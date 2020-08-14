"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ace_1 = require("@adonisjs/ace");
const args_1 = require("@adonisjs/ace/build/src/Decorators/args");
const flags_1 = require("@adonisjs/ace/build/src/Decorators/flags");
const Generator_1 = require("@adonisjs/ace/build/src/Generator");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MongooseModel extends ace_1.BaseCommand {
    async handle() {
        const templateFileNameWithTimestamps = path_1.default.join(__dirname, 'templates/model-template.mustache');
        const generator = new Generator_1.Generator(this.logger);
        const genFile = generator.addFile(this.modelName, { extname: '.ts', pattern: 'pascalcase' })
            .useMustache()
            .destinationDir('App/Models/')
            .apply({ name: this.modelName, dateStamps: !this.noDateStamps })
            .stub(templateFileNameWithTimestamps);
        const genFileObj = JSON.parse(JSON.stringify(genFile));
        const pos = genFileObj.filepath.lastIndexOf(path_1.default.sep) + 1;
        const fileName = genFileObj.filepath.slice(pos);
        if (fs_1.default.existsSync(genFileObj.filepath)) {
            if (this.force) {
                this.logger.delete('App/Models/%s', fileName);
                fs_1.default.unlinkSync(genFileObj.filepath);
            }
            else {
                this.logger.skip('The model file already exists ("App/Models/%s")', fileName);
                return;
            }
        }
        await generator.run();
        this.logger.complete('Created Mongoose Model: "App/Models/%s" ', fileName);
    }
}
MongooseModel.commandName = 'mongoose:model';
MongooseModel.description = 'Makes a new Mongoose model in the \'App/Models/\' directory';
__decorate([
    args_1.args.string({ name: 'name', description: 'The name of the Mongoose model', required: true }),
    __metadata("design:type", String)
], MongooseModel.prototype, "modelName", void 0);
__decorate([
    flags_1.flags.boolean({ name: 'noDateStamps', alias: 'd', default: false, description: 'Do not add the date-stamp fields to the new model' }),
    __metadata("design:type", Boolean)
], MongooseModel.prototype, "noDateStamps", void 0);
__decorate([
    flags_1.flags.boolean({ alias: 'f', default: false, description: 'Force the file to be overwritten if it already exists.' }),
    __metadata("design:type", Boolean)
], MongooseModel.prototype, "force", void 0);
exports.default = MongooseModel;
