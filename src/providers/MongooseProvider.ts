import Mongoose from 'mongoose'
import * as V from 'voca'
import { IocContract } from '@adonisjs/fold'
import { Logger as ILogger } from '@adonisjs/logger/build/src/Logger'
import { Config as IConfig } from '@adonisjs/config/build/src/Config'
import { UriBuilder, UriConfigContract } from '@fjsolutions/mongodb-uri'
import { extendValidator } from '../validation'
import { MongoDbConfig } from '../contracts/MongooseConfig'
import { AdonisMongoose } from '../providers/AdonisMongoose'

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready, when this file is loaded by the framework.
| Hence, the level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
  |   const Database = (await import('@ioc:Adonis/Lucid/Database')).default
  |   const Event = (await import('@ioc:Adonis/Core/Event')).default
  |   Event.on('db:query', Database.prettyPrint)
  | }
  |
  */
export default class MongooseProvider {
  constructor (protected ioc: IocContract) {
  }

  /**
   * Extends the validator by defining validation rules
   */
  private defineValidationRules () {
    this.ioc.with(['Adonis/Core/Validator'], (Validator) => {
      extendValidator(Validator.validator, this.ioc)
    })
  }

  public register () {
    // Register your own bindings for the default MongoDB connection
    this.ioc.singleton('Provider/Mongoose', () => new AdonisMongoose())
  }

  public async boot () {
    // All bindings are ready, feel free to use them
    const Logger = this.ioc.use<ILogger>('Adonis/Core/Logger')
    const Config = this.ioc.use<IConfig>('Adonis/Core/Config')
    const adonisMongoose = this.ioc.use<AdonisMongoose>('Provider/Mongoose')

    // Check how many connection configurations have been defined
    const configurations: Array<MongoDbConfig> = Config.get('database.mongoose.connections')
    if(configurations && configurations.length === 0) {
      // No configuration!
      Logger.error('No Mongoose configuration has been defined')
      throw new Error('No Mongoose configuration has been defined!')
    }
    else if(configurations && configurations.length === 1) {
      // Create a single connection as the default
      const conn = await this.connect(configurations[0])
      if(!conn) {
        throw new Error('Unable to establish the Mongoose connection')
      }
      
      adonisMongoose.add(configurations[0].name || 'Default', conn, true)
    }
    else {
      // Creating multiple, named connections
      await Promise.all(
        configurations.map(async config => {
          if(V.isBlank(config.name)) {
            throw new Error('The Mongoose connection configuration must have a name!')
          }
          
          const conn = await this.connect(config)
          if(!conn) {
            throw new Error('Unable to establish the Mongoose connection')
          }

          adonisMongoose.add(config.name, conn, config.name === 'Default')
        })  
      )
    }

    // Add the MongoDB data Rules
    this.defineValidationRules()
  }

  public async ready () {
    // App is ready
  }

  public async shutdown () {
    // Cleanup, since app is going down
    const Logger = this.ioc.use<ILogger>('Adonis/Core/Logger')
    await Mongoose.connection.close()
    Logger.debug('Mongoose connection closed')
  }

  private async connect (config: MongoDbConfig) {
    const Logger = this.ioc.use<ILogger>('Adonis/Core/Logger')

    // Check the Config object: if there's a connection URI and use that, otherwise use the configuration
    let connectionUri = ''
    if(typeof config.connection === 'string'){
      connectionUri = config.connection
    }
    
    // If there's no connection string, then there's a connection object
    if(!connectionUri || V.isBlank(connectionUri)) {
      connectionUri = UriBuilder.setConfig(config.connection as UriConfigContract).buildUri()
    }

    Logger.debug('Connecting using: %s ...', connectionUri)

    // Make the database connection
    if(connectionUri) {
      try{

        const conn = await Mongoose.createConnection(connectionUri, { useNewUrlParser: true, useUnifiedTopology: true })
        
        Logger.debug('Mongoose connected')
        
        return conn
      }
      catch(e) {
        Logger.error('%s (%s)', e.message, connectionUri)

      }
    }
    else{
      Logger.error('No connection URI was created from the configuration (%s)', config.name)
    }
  }
}
