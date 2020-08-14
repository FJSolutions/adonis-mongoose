import { IocContract } from '@adonisjs/fold';
export default class MongooseProvider {
    protected ioc: IocContract;
    constructor(ioc: IocContract);
    private defineValidationRules;
    register(): void;
    boot(): Promise<void>;
    ready(): Promise<void>;
    shutdown(): Promise<void>;
    private connect;
}
