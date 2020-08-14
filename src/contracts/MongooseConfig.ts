import { UriConfigContract } from '@fjsolutions/mongodb-uri'

export interface MongooseConfig {
  /**
   * The root Mongoose connection configuration object
   */
  mongoose: {
    /**
     * AS constant indicating that this is a Mongoose connection configuration
     */
    client: 'mongoose',
    /**
     * The array of Mongoose connections
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
   * The full MongoDB connection URI string
   */
  connectionString?: string,

  /**
   * An object with the details of the connection
   */
  connection: UriConfigContract
}
