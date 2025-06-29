import crypto from 'crypto';
import { EncryptionError } from './errors';

export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private key: Buffer;

  constructor(encryptionKey: string) {
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new EncryptionError('Encryption key must be at least 32 characters');
    }
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error: any) {
      throw new EncryptionError(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      if (!ivHex || !encrypted) throw new Error('Invalid encrypted data format');
      
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error: any) {
      throw new EncryptionError(`Decryption failed: ${error.message}`);
    }
  }

  encryptDocument(doc: any): string {
    return this.encrypt(JSON.stringify(doc));
  }

  decryptDocument(encrypted: string): any {
    const decrypted = this.decrypt(encrypted);
    return JSON.parse(decrypted);
  }

  static isEncrypted(data: string): boolean {
    return /^[0-9a-f]{32}:[0-9a-f]+$/.test(data);
  }
}