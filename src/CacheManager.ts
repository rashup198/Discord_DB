
import { Document } from './types';
import { Message } from 'discord.js';

export class CacheManager {
  private cache: Map<string, { doc: Document; message: Message; timestamp: number }> = new Map();
  private ttl: number;
  
  constructor(ttl: number = 300000) { 
    this.ttl = ttl;
    
    setInterval(() => this.cleanup(), this.ttl);
  }
  
  set(id: string, doc: Document, message: Message) {
    this.cache.set(id, {
      doc,
      message,
      timestamp: Date.now()
    });
  }
  
  get(id: string): { doc: Document; message: Message } | undefined {
    const entry = this.cache.get(id);
    if (entry) {
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      return { doc: entry.doc, message: entry.message };
    }
    return undefined;
  }
  
  delete(id: string) {
    this.cache.delete(id);
  }
  
  clear() {
    this.cache.clear();
  }
  
  has(id: string): boolean {
    return this.cache.has(id);
  }
  
  size(): number {
    return this.cache.size;
  }
  entries(): IterableIterator<[string, { doc: Document; message: Message; timestamp: number }]> {
    return this.cache.entries();
  }
  private cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(id);
      }
    }
  }
  
  async populateFromMessages(messages: Message[]) {
    for (const message of messages) {
      this.set(message.id, { _id: message.id }, message);
    }
  }
}