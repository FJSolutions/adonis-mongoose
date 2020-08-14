import { Exception } from '@poppinss/utils'
import { IocContract } from '@adonisjs/fold'
import {
  ValidationRuntimeOptions,
  validator as validatorStatic,
  // @ts-ignore
} from '@ioc:Adonis/Core/Validator'

export type MongooseDocCheckOptions = {
  /**
   * The Mongoose model name to use for the check
   */
  modelName: string,
  /**
   * The name of the property on the Mongoose model to check
   */
  propName: string,
  /**
   * An object defining additional constraints to check
   */
  where?: { [key: string]: any },
  /**
   * An object defining additional negative constraints to check
   */
  whereNot?: { [key: string]: any },
}


type NormalizedConstraint = {
  key: string,
  operator: 'in' | 'eq',
  value: string | string[],
}

type NormalizedOptions = Omit<MongooseDocCheckOptions, 'where' | 'whereNot'> & {
  where: NormalizedConstraint[],
  whereNot: NormalizedConstraint[],
}

class MongooseDocCheck {
  constructor (private ruleName: 'exists' | 'unique', private ioc: IocContract) { }

  private applyWhere (criteria: { [key: string]: any }, constraints: NormalizedConstraint[]) {
    if (!constraints.length) {
      return
    }

    constraints.forEach(({ key, operator, value }) => {
      if (operator === 'in') {
        criteria[key] = { '$in': value }
      } else {
        criteria[key] = value
      }
    })
  }

  private applyWhereNot (criteria: { [key: string]: any }, constraints: NormalizedConstraint[]) {
    if (!constraints.length) {
      return
    }

    constraints.forEach(({ key, operator, value }) => {
      if (operator === 'in') {
        criteria[key] = { '$nin': value }
      } else {
        criteria[key] = { '$ne': value }
      }
    })
  }

  private normalizeConstraints (constraints: MongooseDocCheckOptions['where']) {
    const normalized: NormalizedConstraint[] = []
    if (!constraints) {
      return normalized
    }

    /**
     * Normalize object into an array of objects
     */
    return Object.keys(constraints).reduce((result, key) => {
      const value = constraints[key]
      const operator = Array.isArray(value) ? 'in' : 'eq'
      result.push({ key, value, operator })

      return result
    }, normalized)
  }

  /**
   * Compile validation options = Normalize and validate
   */
  public compile (options: MongooseDocCheckOptions) {
    if (!options || !options.modelName || !options.propName) {
      throw new Exception(`"${this.ruleName}" rule expects a "model name" and a "property name"`)
    }

    return {
      modelName: options.modelName,
      propName: options.propName,
      where: this.normalizeConstraints(options.where),
      whereNot: this.normalizeConstraints(options.whereNot),
    }
  }

  /**
   * Validate value
   */
  public async validate (
    value: any,
    { modelName, propName, where, whereNot }: NormalizedOptions,
    { pointer, errorReporter, arrayExpressionPointer }: ValidationRuntimeOptions,
  ) {
    const criteria = { [propName]: value }
    this.applyWhere(criteria, where)
    this.applyWhereNot(criteria, whereNot)

    const ns = 'App/Models/' + modelName
    const Model = this.ioc.use(ns).default
    const count = await Model.countDocuments(criteria)

    if (this.ruleName === 'exists') {
      if (count === 0) {
        errorReporter.report(pointer, this.ruleName, `${this.ruleName} validation failure`, arrayExpressionPointer)
      }
      return
    }

    if (this.ruleName === 'unique') {
      if (count !== 0) {
        errorReporter.report(pointer, this.ruleName, `${this.ruleName} validation failure`, arrayExpressionPointer)
      }
      return
    }
  }
}

/**
 * Extends the validator by adding `unique` and `exists` rules.
 */
export function extendValidator (validator: typeof validatorStatic, ioc: IocContract) {
  /**
   * Exists rule to ensure the value exists in the database
   */
  const existsChecker = new MongooseDocCheck('exists', ioc)

  validator.rule<ReturnType<typeof existsChecker['compile']>>('exists', async (value: any, compiledOptions: any, options: any) => {
    try {
      await existsChecker.validate(value, compiledOptions, options)
    } catch (error) {
      options.errorReporter.report(options.pointer, 'exists', error.message, options.arrayExpressionPointer)
    }
  }, (options: any) => {
    return {
      compiledOptions: existsChecker.compile(options[0]),
      async: true,
    }
  })

  /**
   * Unique rule to check if value is unique or not
   */
  const uniqueChecker = new MongooseDocCheck('unique', ioc)

  validator.rule<ReturnType<typeof existsChecker['compile']>>('unique', async (value: any, compiledOptions: any, options: any) => {
    try {
      await uniqueChecker.validate(value, compiledOptions, options)
    } catch (error) {
      options.errorReporter.report(options.pointer, 'unique', error.message, options.arrayExpressionPointer)
    }
  }, (options: any) => {
    return {
      compiledOptions: uniqueChecker.compile(options[0]),
      async: true,
    }
  })
}
