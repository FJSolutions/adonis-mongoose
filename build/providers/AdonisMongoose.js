"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdonisMongoose = void 0;
class AdonisMongoose {
    constructor() {
        this.connections = new Map();
    }
    add(name, mongoose, setAsDefaultConnection = false) {
        this.connections.set(name, mongoose);
        if (setAsDefaultConnection) {
            this.defaultMongoose = mongoose;
        }
        return mongoose;
    }
    use(name, changeConnection = false) {
        if (!this.connections.has(name)) {
            throw new Error("Unknown mongoose connection name!");
        }
        if (changeConnection) {
            this.defaultMongoose = this.connections.get(name);
        }
        return this.connections.get(name);
    }
    model(name, schema, collectionName) {
        var _a;
        return (_a = this.defaultMongoose) === null || _a === void 0 ? void 0 : _a.model(name, schema, collectionName);
    }
}
exports.AdonisMongoose = AdonisMongoose;
