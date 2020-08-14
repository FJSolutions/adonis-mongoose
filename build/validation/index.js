"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendValidator = void 0;
const utils_1 = require("@poppinss/utils");
class MongooseDocCheck {
    constructor(ruleName, ioc) {
        this.ruleName = ruleName;
        this.ioc = ioc;
    }
    applyWhere(criteria, constraints) {
        if (!constraints.length) {
            return;
        }
        constraints.forEach(({ key, operator, value }) => {
            if (operator === 'in') {
                criteria[key] = { '$in': value };
            }
            else {
                criteria[key] = value;
            }
        });
    }
    applyWhereNot(criteria, constraints) {
        if (!constraints.length) {
            return;
        }
        constraints.forEach(({ key, operator, value }) => {
            if (operator === 'in') {
                criteria[key] = { '$nin': value };
            }
            else {
                criteria[key] = { '$ne': value };
            }
        });
    }
    normalizeConstraints(constraints) {
        const normalized = [];
        if (!constraints) {
            return normalized;
        }
        return Object.keys(constraints).reduce((result, key) => {
            const value = constraints[key];
            const operator = Array.isArray(value) ? 'in' : 'eq';
            result.push({ key, value, operator });
            return result;
        }, normalized);
    }
    compile(options) {
        if (!options || !options.modelName || !options.propName) {
            throw new utils_1.Exception(`"${this.ruleName}" rule expects a "model name" and a "property name"`);
        }
        return {
            modelName: options.modelName,
            propName: options.propName,
            where: this.normalizeConstraints(options.where),
            whereNot: this.normalizeConstraints(options.whereNot),
        };
    }
    async validate(value, { modelName, propName, where, whereNot }, { pointer, errorReporter, arrayExpressionPointer }) {
        const criteria = { [propName]: value };
        this.applyWhere(criteria, where);
        this.applyWhereNot(criteria, whereNot);
        const ns = 'App/Models/' + modelName;
        const Model = this.ioc.use(ns).default;
        const count = await Model.countDocuments(criteria);
        if (this.ruleName === 'exists') {
            if (count === 0) {
                errorReporter.report(pointer, this.ruleName, `${this.ruleName} validation failure`, arrayExpressionPointer);
            }
            return;
        }
        if (this.ruleName === 'unique') {
            if (count !== 0) {
                errorReporter.report(pointer, this.ruleName, `${this.ruleName} validation failure`, arrayExpressionPointer);
            }
            return;
        }
    }
}
function extendValidator(validator, ioc) {
    const existsChecker = new MongooseDocCheck('exists', ioc);
    validator.rule('exists', async (value, compiledOptions, options) => {
        try {
            await existsChecker.validate(value, compiledOptions, options);
        }
        catch (error) {
            options.errorReporter.report(options.pointer, 'exists', error.message, options.arrayExpressionPointer);
        }
    }, (options) => {
        return {
            compiledOptions: existsChecker.compile(options[0]),
            async: true,
        };
    });
    const uniqueChecker = new MongooseDocCheck('unique', ioc);
    validator.rule('unique', async (value, compiledOptions, options) => {
        try {
            await uniqueChecker.validate(value, compiledOptions, options);
        }
        catch (error) {
            options.errorReporter.report(options.pointer, 'unique', error.message, options.arrayExpressionPointer);
        }
    }, (options) => {
        return {
            compiledOptions: uniqueChecker.compile(options[0]),
            async: true,
        };
    });
}
exports.extendValidator = extendValidator;
