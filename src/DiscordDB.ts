import { Client, GatewayIntentBits, TextChannel, Message, REST, Routes } from 'discord.js';
import { DiscordDBConfig, Document, FilterQuery, FindOptions, UpdateOperation } from './types';
import { QueryEngine } from './QueryEngine';
import { UpdateEngine } from './UpdateEngine';
import { EncryptionService } from './EncryptionService';
import { CacheManager } from './CacheManager';
import { 
  DiscordDBError, ValidationError, NetworkError, 
  EncryptionError, QueryParseError, UpdateError,
  RateLimitError
} from './errors';

export class DiscordDB {
    public async ready(): Promise<void> {
        if (this.channel) return;
        
        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new NetworkError('Connection timeout'));
          }, 10000);
    
          const checkReady = () => {
            if (this.channel) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          
          checkReady();
        });
      }
  private client: Client;
  private rest: REST;
  private channel!: TextChannel;
  private encryptionService?: EncryptionService;
  private cache: CacheManager;
  private rateLimitQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  
  constructor(private config: DiscordDBConfig) {
    if (!config.botToken || config.botToken.length < 50) {
        throw new ValidationError('Invalid Discord bot token');
      }
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ],
      
      rest: {
        api: config.baseURL || 'https://discord.com/api'
      }
    });
    
    this.rest = new REST({ version: '10' }).setToken(config.botToken);
    
    if (config.encryptionKey) {
      this.encryptionService = new EncryptionService(config.encryptionKey);
    }
    
    this.cache = new CacheManager(config.cacheTTL || 300000);
    
    this.initialize();
  }
  
  // src/DiscordDB.ts
private async initialize() {
    try {
      console.log('Attempting to login...');
      await this.client.login(this.config.botToken);
      console.log('Login successful!');
  
      console.log('Fetching channel:', this.config.channelId);
      
      // Add this debug line
      console.log('Available channels:', this.client.channels.cache.map(c => `${c.id} (${c.type})`));
      
      const channel = await this.client.channels.fetch(this.config.channelId);
      
      if (!channel) {
        throw new DiscordDBError('Channel not found. Possible reasons:\n' +
          '1. Invalid channel ID\n' +
          '2. Bot not in the server\n' +
          '3. Channel not accessible to bot');
      }
      
      if (!channel.isTextBased()) {
        throw new DiscordDBError('Channel is not a text channel');
      }
      
      this.channel = channel as TextChannel;
      console.log(`Connected to channel: ${this.channel.name} (${this.channel.id})`);
      
    } catch (error: any) {
      console.error('Full error details:', error);
      throw new NetworkError(`Connection failed: ${error.message}`);
    }
  }
  private async ensureReady() {
    if (this.client.isReady()) return;
    
    return new Promise<void>((resolve, reject) => {
        this.client.once('ready', () => resolve());
        this.client.once('error', reject);
      setTimeout(() => reject(new NetworkError('Connection timeout')), 10000);
    });
  }
  
  isEncryptionEnabled(): boolean {
    return !!this.encryptionService;
  }
  
  async insertOne(doc: Document): Promise<Document> {
    if (!this.channel) {
        throw new DiscordDBError('Channel not initialized. Call initialize() first.');
      }
    if (doc._id) {
      throw new ValidationError('Cannot specify _id field for new documents');
    }
    
    const content = this.serializeDocument(doc);
    this.validateContentLength(content);
    
    try {
      const message = await this.enqueueRequest(() => this.channel.send(content));
      const insertedDoc = { ...doc, _id: message.id };
      
      if (this.config.cacheEnabled !== false) {
        this.cache.set(message.id, insertedDoc, message);
      }
      
      return insertedDoc;
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  async find(filter: FilterQuery = {}, options: FindOptions = {}): Promise<Document[]> {
    try {
      const messages = await this.fetchMessages();
      const docs: Document[] = [];
      
      for (const message of messages.values()) {
        try {
          const doc = await this.parseMessage(message);
          if (QueryEngine.matchDocument(doc, filter)) {
            const projectedDoc = options.projection 
              ? QueryEngine.applyProjection(doc, options.projection)
              : doc;
            docs.push(projectedDoc);
          }
        } catch (error) {
            console.warn(`Skipping invalid message ${message.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);        }
      }
      
      // Apply sorting
      const sortedDocs = options.sort 
        ? QueryEngine.sortDocuments(docs, options.sort)
        : docs;
      
      // Apply pagination
      const skip = options.skip || 0;
      const limit = options.limit || sortedDocs.length;
      return sortedDocs.slice(skip, skip + limit);
      
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  async findOne(filter: FilterQuery = {}, options: FindOptions = {}): Promise<Document | null> {
    const results = await this.find(filter, { ...options, limit: 1 });
    return results[0] || null;
  }
  
  async updateOne(filter: FilterQuery, update: UpdateOperation): Promise<Document | null> {
    const doc = await this.findOne(filter);
    if (!doc) return null;
    
    const updatedDoc = UpdateEngine.applyUpdate(doc, update);
    const content = this.serializeDocument(updatedDoc);
    this.validateContentLength(content);
    
    try {
      let message = this.cache.get(doc._id)?.message;
      if (!message) {
        message = await this.channel.messages.fetch(doc._id);
      }
      
      const editedMessage = await this.enqueueRequest(() => message!.edit(content));
      
      // Update cache
      if (this.config.cacheEnabled !== false) {
        this.cache.set(doc._id, updatedDoc, editedMessage);
      }
      
      return updatedDoc;
      
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  async deleteOne(filter: FilterQuery): Promise<boolean> {
    const doc = await this.findOne(filter);
    if (!doc) return false;
    
    try {
      let message = this.cache.get(doc._id)?.message;
      if (!message) {
        message = await this.channel.messages.fetch(doc._id);
      }
      
      await this.enqueueRequest(() => message!.delete());
      
      // Remove from cache
      if (this.config.cacheEnabled !== false) {
        this.cache.delete(doc._id);
      }
      
      return true;
      
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  async countDocuments(filter: FilterQuery = {}): Promise<number> {
    const docs = await this.find(filter);
    return docs.length;
  }
  
  async dropCollection(): Promise<boolean> {
    try {
      const messages = await this.channel.messages.fetch();
      await this.enqueueRequest(() => this.channel.bulkDelete(messages));
      this.cache.clear();
      return true;
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  private async fetchMessages(limit = 100): Promise<Map<string, Message>> {
    if (this.config.cacheEnabled !== false && this.cache.size() > 0) {
        return new Map(
            Array.from(this.cache.entries())
              .map(([id, entry]) => [id, entry.message])
          );
    }
    
    try {
      const messages = await this.enqueueRequest(() => 
        this.channel.messages.fetch({ limit })
      );
      return messages;
    } catch (error: any) {
      this.handleDiscordError(error);
    }
  }
  
  private async parseMessage(message: Message): Promise<Document> {
    // Check cache first
    if (this.config.cacheEnabled !== false) {
      const cached = this.cache.get(message.id);
      if (cached && !EncryptionService.isEncrypted(message.content)) {
        return cached.doc;
      }
    }
    
    try {
      let doc: Document;
      
      if (this.encryptionService && EncryptionService.isEncrypted(message.content)) {
        doc = this.encryptionService.decryptDocument(message.content);
      } else {
        doc = JSON.parse(message.content);
      }
      
      doc._id = message.id;
      
      // Update cache
      if (this.config.cacheEnabled !== false) {
        this.cache.set(message.id, doc, message);
      }
      
      return doc;
    } catch (error) {
      throw new ValidationError('Invalid message content format');
    }
  }
  
  private serializeDocument(doc: Document): string {
    const docToSerialize = { ...doc };
    delete docToSerialize._id;
    
    if (this.encryptionService) {
      return this.encryptionService.encryptDocument(docToSerialize);
    }
    return JSON.stringify(docToSerialize);
  }
  
  private validateContentLength(content: string) {
    if (content.length > 2000) {
      throw new ValidationError(`Document exceeds Discord message limit (2000 chars). Size: ${content.length}`);
    }
  }
  
  private async enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.rateLimitQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }
  
  private async processQueue() {
    if (this.isProcessingQueue || this.rateLimitQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    try {
      while (this.rateLimitQueue.length > 0) {
        const task = this.rateLimitQueue.shift()!;
        await task();
        
        // Add delay between requests to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Error processing request queue:', error);
    } finally {
      this.isProcessingQueue = false;
    }
  }
  
  private handleDiscordError(error: any): never {
    if (error.code === 429) {
      const retryAfter = error.response?.headers?.['retry-after'] || 5;
      throw new RateLimitError('Discord API rate limit exceeded', retryAfter);
    }
    
    if (error instanceof DiscordDBError) {
      throw error;
    }
    
    if (error.name === 'DiscordAPIError') {
      throw new NetworkError(`Discord API error: ${error.message}`);
    }
    
    throw new DiscordDBError(`Unexpected error: ${error.message}`);
  }
}