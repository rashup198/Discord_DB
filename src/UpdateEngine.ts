import { Document, UpdateOperation, UpdateOperators } from './types';
import { UpdateError } from './errors';

export class UpdateEngine {
  static applyUpdate(doc: Document, update: UpdateOperation): Document {
    try {
      const result = { ...doc };
      
      if (this.isOperatorUpdate(update)) {
        this.applyOperatorUpdate(result, update);
      } else {
        // Treat as replacement document
        Object.assign(result, update);
      }
      
      return result;
    } catch (error) {
        throw new UpdateError(`Update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static isOperatorUpdate(update: UpdateOperation): update is UpdateOperators {
    return Object.keys(update).some(key => key.startsWith('$'));
  }
  
  private static applyOperatorUpdate(doc: Document, operators: UpdateOperators) {
    if (operators.$set) {
      for (const [key, value] of Object.entries(operators.$set)) {
        doc[key] = value;
      }
    }
    
    if (operators.$unset) {
      for (const key of Object.keys(operators.$unset)) {
        delete doc[key];
      }
    }
    
    if (operators.$inc) {
      for (const [key, value] of Object.entries(operators.$inc)) {
        doc[key] = (doc[key] || 0) + value;
      }
    }
    
    if (operators.$push) {
      for (const [key, value] of Object.entries(operators.$push)) {
        if (!Array.isArray(doc[key])) doc[key] = [];
        if (Array.isArray(value)) {
          doc[key].push(...value);
        } else {
          doc[key].push(value);
        }
      }
    }
    
    if (operators.$pull) {
      for (const [key, condition] of Object.entries(operators.$pull)) {
        if (Array.isArray(doc[key])) {
          if (typeof condition === 'object' && condition !== null) {
            doc[key] = doc[key].filter((item: any) => 
              !Object.entries(condition).every(([k, v]) => item[k] === v)
            );
          } else {
            doc[key] = doc[key].filter((item: any) => item !== condition);
          }
        }
      }
    }
    
    if (operators.$addToSet) {
      for (const [key, value] of Object.entries(operators.$addToSet)) {
        if (!Array.isArray(doc[key])) doc[key] = [];
        if (Array.isArray(value)) {
          for (const item of value) {
            if (!doc[key].includes(item)) {
              doc[key].push(item);
            }
          }
        } else {
          if (!doc[key].includes(value)) {
            doc[key].push(value);
          }
        }
      }
    }
  }
}