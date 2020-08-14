import { BaseCommand } from '@adonisjs/ace'
import { args } from '@adonisjs/ace/build/src/Decorators/args'
import { flags } from '@adonisjs/ace/build/src/Decorators/flags'
import { Generator } from '@adonisjs/ace/build/src/Generator'
import Path from 'path'
import fs from 'fs'
import { runInThisContext } from 'vm'

export default class MongooseModel extends BaseCommand {
  public static commandName = 'mongoose:model'
  public static description = 'Makes a new Mongoose model in the \'App/Models/\' directory'

  @args.string({ name: 'name', description:'The name of the Mongoose model', required: true })
  // @ts-ignore
  public modelName: string

  @flags.boolean({ name: 'noDateStamps', alias: 'd', default: false, description: 'Do not add the date-stamp fields to the new model' })
  // @ts-ignore
  public noDateStamps: boolean

  @flags.boolean({ alias: 'f', default: false, description: 'Force the file to be overwritten if it already exists.' })
  // @ts-ignore
  public force: boolean

  public async handle () {
    // this.logger.info('Creating Mongoose model: "%s" (%s)', this.modelName, String(this.noDateStamps))
    const templateFileNameWithTimestamps = Path.join(__dirname, 'templates/model-template.mustache')
    
    // this.logger.info('Full Template Path: %s', templateFileNameWithTimestamps)
    const generator = new Generator(this.logger)
    const genFile = generator.addFile(this.modelName, { extname: '.ts', pattern: 'pascalcase' })
      .useMustache()
      .destinationDir('App/Models/')
      .apply({ name: this.modelName, dateStamps: !this.noDateStamps })
      .stub(templateFileNameWithTimestamps)
      
    const genFileObj = JSON.parse(JSON.stringify(genFile))
    // this.logger.pending('Gen File: %s', genFileObj)
    const pos = (genFileObj.filepath as string).lastIndexOf(Path.sep) + 1
    const fileName = (genFileObj.filepath as string).slice(pos)

    if(fs.existsSync(genFileObj.filepath)) {
      if(this.force){
        this.logger.delete('App/Models/%s', fileName)
        fs.unlinkSync(genFileObj.filepath)
      }
      else {
        this.logger.skip('The model file already exists ("App/Models/%s")', fileName)
        return
      }
    }
    
    await generator.run()


    this.logger.complete('Created Mongoose Model: "App/Models/%s" ', fileName)
  }
}

