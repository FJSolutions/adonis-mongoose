import Mongoose from 'mongoose';
export declare class AdonisMongoose {
    private connections;
    private defaultMongoose;
    add(name: string, mongoose: Mongoose.Connection, setAsDefaultConnection?: boolean): Mongoose.Connection;
    use(name: string, changeConnection?: boolean): Mongoose.Connection;
    model<T extends Mongoose.Document>(name: string, schema: Mongoose.Schema, collectionName?: string): Mongoose.Model<T>;
}
