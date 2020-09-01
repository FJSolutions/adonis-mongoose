"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const V = __importStar(require("voca"));
const mongodb_uri_1 = require("@fjsolutions/mongodb-uri");
const validation_1 = require("../validation");
const AdonisMongoose_1 = require("../providers/AdonisMongoose");
class MongooseProvider {
    constructor(ioc) {
        this.ioc = ioc;
    }
    defineValidationRules() {
        this.ioc.with(['Adonis/Core/Validator'], (Validator) => {
            validation_1.extendValidator(Validator.validator, this.ioc);
        });
    }
    register() {
        this.ioc.singleton('Provider/Mongoose', () => new AdonisMongoose_1.AdonisMongoose());
    }
    async boot() {
        const Logger = this.ioc.use('Adonis/Core/Logger');
        const Config = this.ioc.use('Adonis/Core/Config');
        const adonisMongoose = this.ioc.use('Provider/Mongoose');
        const configurations = Config.get('database.mongoose.connections');
        if (configurations && configurations.length === 0) {
            Logger.error('No Mongoose configuration has been defined');
            throw new Error('No Mongoose configuration has been defined!');
        }
        else if (configurations && configurations.length === 1) {
            const conn = await this.connect(configurations[0]);
            if (!conn) {
                throw new Error('Unable to establish the Mongoose connection');
            }
            adonisMongoose.add(configurations[0].name || 'Default', conn, true);
        }
        else {
            await Promise.all(configurations.map(async (config) => {
                if (V.isBlank(config.name)) {
                    throw new Error('The Mongoose connection configuration must have a name!');
                }
                const conn = await this.connect(config);
                if (!conn) {
                    throw new Error('Unable to establish the Mongoose connection');
                }
                adonisMongoose.add(config.name, conn, config.name === 'Default');
            }));
        }
        this.defineValidationRules();
    }
    async ready() {
    }
    async shutdown() {
        const Logger = this.ioc.use('Adonis/Core/Logger');
        await mongoose_1.default.connection.close();
        Logger.debug('Mongoose connection closed');
    }
    async connect(config) {
        const Logger = this.ioc.use('Adonis/Core/Logger');
        let connectionUri = '';
        if (typeof config.connection === 'string') {
            connectionUri = config.connection;
        }
        if (!connectionUri || V.isBlank(connectionUri)) {
            connectionUri = mongodb_uri_1.UriBuilder.setConfig(config.connection).buildUri();
        }
        Logger.debug('Connecting using: %s ...', connectionUri);
        if (connectionUri) {
            try {
                const conn = await mongoose_1.default.createConnection(connectionUri, { useNewUrlParser: true, useUnifiedTopology: true });
                Logger.debug('Mongoose connected');
                return conn;
            }
            catch (e) {
                Logger.error('%s (%s)', e.message, connectionUri);
            }
        }
        else {
            Logger.error('No connection URI was created from the configuration (%s)', config.name);
        }
    }
}
exports.default = MongooseProvider;
