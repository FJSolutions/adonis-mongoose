import { IocContract } from '@adonisjs/fold';
import { validator as validatorStatic } from '@ioc:Adonis/Core/Validator';
export declare type MongooseDocCheckOptions = {
    modelName: string;
    propName: string;
    where?: {
        [key: string]: any;
    };
    whereNot?: {
        [key: string]: any;
    };
};
export declare function extendValidator(validator: typeof validatorStatic, ioc: IocContract): void;
