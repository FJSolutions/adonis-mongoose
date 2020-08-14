import { UriConfigContract } from '@fjsolutions/mongodb-uri';
export interface MongooseConfig {
    mongoose: {
        client: 'mongoose';
        connections: MongoDbConfig[];
    };
}
export interface MongoDbConfig {
    name: string;
    connectionString?: string;
    connection: UriConfigContract;
}
