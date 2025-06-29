export type Document = Record<string, any>;
export type Filter = Record<string, any>;
export type Projection = Record<string, 0 | 1 | boolean>;
export type Sort = Record<string, 1 | -1>;

export interface DiscordDBConfig {
  botToken: string;
  channelId: string;
  baseURL?: string;
  encryptionKey?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

export interface FindOptions {
  projection?: Projection;
  sort?: Sort;
  skip?: number;
  limit?: number;
}

export interface UpdateOperators {
  $set?: Document;
  $unset?: { [key: string]: 1 | boolean | "" };
  $inc?: Document;
  $push?: Document;
  $pull?: Document;
  $addToSet?: Document;
}

export interface LogicalOperators {
  $and?: Filter[];
  $or?: Filter[];
  $nor?: Filter[];
  $not?: Filter;
}

export interface ElementOperators {
  $exists?: boolean;
}

export interface EvaluationOperators {
  $regex?: string | RegExp;
  $options?: string;
}

export type UpdateOperation = UpdateOperators | Document;
export type QueryOperator = 
  | { $eq: any }
  | { $ne: any }
  | { $gt: any }
  | { $gte: any }
  | { $lt: any }
  | { $lte: any }
  | { $in: any[] }
  | { $nin: any[] }
  | LogicalOperators
  | ElementOperators
  | EvaluationOperators;

export type FilterQuery = {
  [key: string]: any | QueryOperator;
} & LogicalOperators;