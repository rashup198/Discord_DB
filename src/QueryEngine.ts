import { Document, FilterQuery, QueryOperator } from './types';
import { QueryParseError } from './errors';

export class QueryEngine {
  static matchDocument(doc: Document, filter: FilterQuery): boolean {
    try {
      // Handle logical operators first
      if (filter.$and) {
        return filter.$and.every(f => this.matchDocument(doc, f));
      }
      
      if (filter.$or) {
        return filter.$or.some(f => this.matchDocument(doc, f));
      }
      
      if (filter.$nor) {
        return !filter.$nor.some(f => this.matchDocument(doc, f));
      }
      
      if (filter.$not) {
        return !this.matchDocument(doc, filter.$not);
      }
      
      // Handle field-level operators
      for (const [key, condition] of Object.entries(filter)) {
        if (key.startsWith('$')) continue; // Skip logical operators
        
        const value = doc[key];
        
        if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
          if (!this.handleFieldOperators(value, condition as QueryOperator)) {
            return false;
          }
        } else {
          // Simple equality check
          if (!this.compareValues(value, condition)) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
        throw new QueryParseError(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private static handleFieldOperators(value: any, operator: QueryOperator): boolean {
    for (const [op, opValue] of Object.entries(operator)) {
      switch (op) {
        case '$eq': return this.compareValues(value, opValue);
        case '$ne': return !this.compareValues(value, opValue);
        case '$gt': return value > opValue;
        case '$gte': return value >= opValue;
        case '$lt': return value < opValue;
        case '$lte': return value <= opValue;
        case '$in': 
          if (!Array.isArray(opValue)) throw new Error('$in requires an array');
          return opValue.some(v => this.compareValues(value, v));
        case '$nin':
          if (!Array.isArray(opValue)) throw new Error('$nin requires an array');
          return !opValue.some(v => this.compareValues(value, v));
        case '$exists':
          return (opValue === true) ? (value !== undefined) : (value === undefined);
        case '$regex': {
            const regexOptions = (operator as any).$options || undefined;
            const regex = typeof opValue === 'string' 
              ? new RegExp(opValue, regexOptions) 
              : opValue;
          return typeof value === 'string' && regex.test(value);
        }
        default:
          throw new Error(`Unsupported operator: ${op}`);
      }
    }
    return true;
  }
  
  private static compareValues(a: any, b: any): boolean {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (JSON.stringify(a) === JSON.stringify(b)) return true;
    return false;
  }
  
  static applyProjection(doc: Document, projection: Record<string, 0 | 1 | boolean>): Document {
    const result: Document = {};
    
    if (Object.values(projection).includes(1) || Object.values(projection).includes(true)) {
      // Inclusive projection
      for (const [key, include] of Object.entries(projection)) {
        if (include === 1 || include === true) {
          result[key] = doc[key];
        }
      }
      // Always include _id unless explicitly excluded
      if (doc._id !== undefined && projection._id !== 0 && projection._id !== false) {
        result._id = doc._id;
      }
    } else {
      // Exclusive projection
      Object.assign(result, doc);
      for (const [key, exclude] of Object.entries(projection)) {
        if (exclude === 0 || exclude === false) {
          delete result[key];
        }
      }
    }
    
    return result;
  }
  
  static sortDocuments(docs: Document[], sort: Record<string, 1 | -1>): Document[] {
    return [...docs].sort((a, b) => {
      for (const [key, direction] of Object.entries(sort)) {
        const aVal = a[key];
        const bVal = b[key];
        
        if (aVal === undefined && bVal === undefined) continue;
        if (aVal === undefined) return direction;
        if (bVal === undefined) return -direction;
        
        if (aVal < bVal) return -direction;
        if (aVal > bVal) return direction;
      }
      return 0;
    });
  }
}