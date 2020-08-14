import { BaseCommand } from '@adonisjs/ace';
export default class MongooseModel extends BaseCommand {
    static commandName: string;
    static description: string;
    modelName: string;
    noDateStamps: boolean;
    force: boolean;
    handle(): Promise<void>;
}
