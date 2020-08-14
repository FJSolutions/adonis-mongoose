# adonis-mongoose

An `AdonisJS` 5 provider for `Mongoose`.

* [AdonisJS](https://github.com/adonisjs)
* [Mongoose](https://github.com/Automattic/mongoose)

```sh
npm install @fjsolutions/adonis-mongoose --save
```

After installation completes run the following to setup the package in the project:

```sh
node ace invoke @fjsolutions/adonis-mongoose
```

## Configuration file

 A skeleton configuration file is created by the package. It contains a configuration array with a single bare-bones configuration instance.

 Each configuration has a name attribute. If there is a single configuration and the name is not supplied then it is set to 'Default'. But if there are multiple configurations in the array one must be named 'Default' and is set as the initial connection instance.

 The provider initializes each of the connections with its configuration as part of its boot sequence, so if any of the configurations contain errors or the host cannot be reached it will be detected early.

 ### The AdonisMongoose instance

 The `AdonisMongoose` instance returned from importing `@ioc:Providers/Mongoose` is a singleton, and has two methods:

 * `model()` for creating `Mongoose` models.
 * `use()` which returns the named `Mongoose` connection.

All other interaction with `MongoDB` is done through the Model.

## Features

The module provides `Mongoose` based models. It contains:

* A provider to boot `Mongoose` and add it to the IOC container (`@ioc:Providers/Mongoose`).
* A `mongoose:model` command for generating `Mongoose` models in `Adonis`.
* `exists` and `unique` validation rules.
* A strongly typed configuration system that can configure multiple Mongoose connections.
* Contracts for intellisense with `@ioc:Providers/Mongoose` and `@ioc:Adonis/Core/Validator`.

## Classes

* `src/Providers/MongooseProvider.ts` - The mongoose provider for AdonisJS 5
* `src/validation/index.ts` - The file that contains the database validators: `exists` and `unique` (they are registered by the provider).
* `templates/validator.ts.mustache` - (Template) The interface for the extended database validators.
* `templates/mongoose.ts.mustache` - (Template) The interface for the MongooseProvider returned from the `ioc` container.
* `templates/database.ts.mustache` - (Template) The MongoDB database configuration file.
* `commands/MongooseModel.ts` - The `ace` command for creating Mongoose models.
    + `commands/templates/model-template.mustache` - The `mustache` template files.

## TODO Still:

* `src/commands/Seeder.ts` - Create a `mongoose` seeder class to populate the database.
* `src/commands/Seed.ts` - Create a class that runs the seeders from the seeder folder.
