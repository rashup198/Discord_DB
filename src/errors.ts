export class DiscordDBError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'DiscordDBError';
      Object.setPrototypeOf(this, DiscordDBError.prototype);
    }
  }
  
  export class ValidationError extends DiscordDBError {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
      Object.setPrototypeOf(this, ValidationError.prototype);
    }
  }
  
  export class NetworkError extends DiscordDBError {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
      Object.setPrototypeOf(this, NetworkError.prototype);
    }
  }
  
  export class EncryptionError extends DiscordDBError {
    constructor(message: string) {
      super(message);
      this.name = 'EncryptionError';
      Object.setPrototypeOf(this, EncryptionError.prototype);
    }
  }
  
  export class QueryParseError extends DiscordDBError {
    constructor(message: string) {
      super(message);
      this.name = 'QueryParseError';
      Object.setPrototypeOf(this, QueryParseError.prototype);
    }
  }
  
  export class UpdateError extends DiscordDBError {
    constructor(message: string) {
      super(message);
      this.name = 'UpdateError';
      Object.setPrototypeOf(this, UpdateError.prototype);
    }
  }
  
  export class RateLimitError extends DiscordDBError {
    retryAfter: number;
    
    constructor(message: string, retryAfter: number) {
      super(message);
      this.name = 'RateLimitError';
      this.retryAfter = retryAfter;
      Object.setPrototypeOf(this, RateLimitError.prototype);
    }
  }