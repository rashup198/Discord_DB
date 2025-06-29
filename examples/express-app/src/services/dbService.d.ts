export declare const db: any;
export declare const usersCollection = "users";
export declare const tasksCollection = "tasks";
export declare function initializeCollections(): Promise<void>;
export declare function getCollection(name: string): Promise<any>;
