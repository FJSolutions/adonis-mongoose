import { UriConfigContract } from '@fjsolutions/mongodb-uri'

export interface MongooseConfig {
  /**
   * The root Mongoose connection configuration object
   */
  mongoose: {
    /**
     * A constant indicating that this is a Mongoose connection configuration
     */
    client: 'mongoose',
    /**
     * An array of named Mongoose connections
     */
    connections: MongoDbConfig[]
  },
}

export interface MongoDbConfig {
  /**
   * The name of this Mongoose configuration (default = 'Default')
   */
  name: string,
  /**
   * Either a full MongoDB connection URI string, or an object with the details of the connection
   */
  connection: string | UriConfigContract
}
