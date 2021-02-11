import Mongoose from "mongoose";
import { MongooseConfig } from "../contracts/MongooseConfig";

export class AdonisMongoose {
  private connections = new Map<string, Mongoose.Connection>();
  private defaultMongoose: Mongoose.Connection | undefined;

  /**
   * Adds a new Mongoose connection object to the object
   *
   * @param name The name key of the connection
   * @param mongoose The Mongoose connection
   * @param setAsDefaultConnection Sets the connection that is being added as the default connection.
   * @returns {Mongoose.Connection} The just added connection, for chaining purposes.
   */
  public add(
    name: string,
    mongoose: Mongoose.Connection,
    setAsDefaultConnection = false
  ): Mongoose.Connection {
    this.connections.set(name, mongoose);

    if (setAsDefaultConnection) {
      this.defaultMongoose = mongoose;
    }

    return mongoose;
  }

  /**
   * Use the connection keyed to the supplied name
   *
   * @param name The name of the connection key
   * @param changeConnection A flag indicating whether to change the default connection to the one named (default = false)
   * @returns {Mongoose.Connection} The named connection, for chaining purposes
   */
  public use(name: string, changeConnection = false): Mongoose.Connection {
    if (!this.connections.has(name)) {
      throw new Error("Unknown mongoose connection name!");
    }

    if (changeConnection) {
      this.defaultMongoose = this.connections.get(name)!;
    }

    return this.connections.get(name)!;
  }

  /**
   * Registers a Mongoose model object
   *
   * @param name The name of the model class being registered
   * @param schema The Schema definition for the model class
   * @param collectionName (Optional) The name of the non-default collection name
   * @returns {MongooseModel<T>} The Mongoose model factory
   */
  public model<T extends Mongoose.Document>(
    name: string,
    schema: Mongoose.Schema<T>,
    collectionName?: string
  ): Mongoose.Model<T> {
    return this.defaultMongoose?.model<T>(name, schema, collectionName)!;
  }
}
