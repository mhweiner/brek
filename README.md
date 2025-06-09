<img src="docs/brek-logo.svg" alt="brek" title="brek">

[![build status](https://github.com/mhweiner/brek/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/brek/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/%F0%9F%9A%80%20AutoRel-2D4DDE)](https://github.com/mhweiner/autorel)

Brek is a structured, typed config loader for Node.js — ideal for dynamic environments and securely managing secrets like those in [AWS Secrets Manager](https://github.com/mhweiner/brek-loader-aws-secrets-manager).

Brek stands for **B**locking **R**esolution of **E**nvironment **K**eys.

_config/default.json_
```json
{
  "foo": "bar",
  "baz": {
    "qux": 42
  },
  "quux": {
    "[awsSecret]": {"key": "demo"}
  }
}
```

_blah.ts_
```typescript
import {getConfig} from "brek";

const {foo, baz} = getConfig();

console.log(foo); // "bar"
console.log(baz.qux); // 42
console.log(baz.quux); // "secret_demo"
console.log(baz.jazz); // undefined and Typescript will throw an error at compile time

// Enjoy full autocompletion and type safety! 🚀

```

## Features

### **🔒 Out-of-the-box Typescript support**
- Turn your runtime errors into safer compile-time errors! Automatically generated Typescript type definition for configuration object

### **😃 Easy-to-use & stable**
- All settings are in simple, logic free `.json` files.
- Adds structure and organization to your configuration files
- Easily see what is being overridden and where
- Comprehensive yet easy to understand documentation
- Small, modular, and unit-tested codebase written in Typescript.
- **No dependencies**!

### **💪 Flexible & powerful**
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box solution with [sensible merge strategy](#configuration-merge-strategy)
- Provides for [overrides via CLI](#using-clienv-overrides) without polluting the CLI argument namespace
- Fast. Runtime processing is done once during app initialization only.
- Put [environment variables](#environment-variables-in-config-files) directly into .json files

### **🤖 Dynamic loading**
- Great for AWS Secrets Manager, AWS Parameter Store, HashiCorp Vault, or custom dynamic runtime functions
- Any custom logic lives in [loaders](#loaders), keeping your config files logic-free
- Provides an easy sharable and reusable plugin interface for sharing or re-use

## Table of Contents

- [Getting Started](docs/gettingStarted.md)
- [Configuration Rules](#configuration-rules)
- [Configuration Merge Strategy](#configuration-merge-strategy)
- [Using CLI/ENV Overrides](#using-clienv-overrides)
- [Environment Variables in Config Files](#environment-variables-in-config-files)
- [Loaders](docs/loaders.md)
- [API Reference](#api-reference)
- [CLI Reference](#cli-reference)
- [Recommended Best Practices](#recommended-best-practices)
- [Usage with AWS Lambda](#usage-with-aws-lambda)
- [Debugging](#debugging)
- [Known Issues](#known-issues)
- [Support, Feedback, and Contributions](#support-feedback-and-contributions)
- [Why is it called brek?](#why-is-it-called-brek)
- [Sponsorship](#sponsorship)
- [Other Useful Libraries](#other-useful-libraries)

## Getting Started

To install and get started with `brek`, see our [Getting Started](docs/gettingStarted.md) guide.

## Configuration rules

- `default.json` is required, everything else is optional. Recommended practice is that `default.json` contains all of your "local development" settings.

- All configuration files must be a subset of `default.json`. Think of them simply as overrides to the default. In Typescript terms, configuration files must be of type `Partial<Config>`.

- A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.

- [Loaders](#loaders) always must return a string. If you need to return a different type, you can use `JSON.parse()` or similar.

- Arrays should be homogenous (not of mixed types).

## Configuration merge strategy

Brek uses a simple and intuitive merge strategy, with the goal of making it easy to understand what is being overridden and where. You can specify configuration overrides for different environments, deployments, and users.

Configurations are merged in this order, with the later ones overriding the earlier ones:
 
1. default.json
2. environment file
3. deployment file
4. user file
5. [CLI/env overrides](#using-clienv-overrides)

Which of these sources to choose depends on the presence of certain `process.env` configuration variables:

| **process.env**              | **conf file**                          |
| ---------------------------- | ---------------------------------------|
| `ENVIRONMENT`, `NODE_ENV`    | `/conf/environments/[ENVIRONMENT].json`|
| `DEPLOYMENT`                 | `/conf/deployments/[DEPLOYMENT].json`  |
| `USER`                       | `/conf/users/[USER].json`              |

A few notes:

- `ENVIRONMENT` takes precedence over `NODE_ENV` if both are set. This is useful for local development, or to not be tied to the `NODE_ENV` convention (ie, if you have a package that uses `NODE_ENV` for something else).
- `USER` is usually provided by default by UNIX environments (try `console.log(process.env.USER)`)
- Arrays and loaders are simply replaced, not merged.

You specify these by setting the appropriate `process.env` variables. For example, to use the `production` environment, set `NODE_ENV=production` or `ENVIRONMENT=production`.

## Using CLI/env overrides

You can use the `BREK` environment variable to override properties via CLI/ENV. `BREK` must be valid JSON. Using `jq` simplifies dynamic JSON construction, ensures proper quoting, and makes it easier to handle environment variables.

### Examples

```bash
# Override the a.b property
BREK=$(jq -n '{a: {b: "q"}}') ts-node src/index.ts

# Override the postgres property wth an environment variable
DATABASE_URL="postgres://user:pass@localhost:5432/db"
BREK=$(jq -n --arg db "$DATABASE_URL" '{postgres: $db}') ts-node src/index.ts
```

## Environment variables in config files

You can use environment variables as values by wrapping it in `${...}`. For example, to use environment variable `FOO`, use `${FOO}`. This will translate to `process.env.FOO`. These will always be typed as strings. Example config file:

```json
{
  "foo": "${FOO}"
}
```

## Loaders

Loaders are custom functions that are called during startup (run-time). This can be used to do anything, such as fetching secrets from AWS Secrets Manager, or any other dynamic runtime operation. They can be Promise/async/await based.

Quick example:

_config/default.json_
```json
{
  "foo": {
    "[fetchSecret]": {
      "key": "demo"
    }
  }
}
```

To learn more about loaders, see the [Loaders](docs/loaders.md) documentation.


## API Reference

### `getConfig(): Config`

Returns the configuration object.

---

### `loadConfig(): Promise<void>`

Preloads the configuration. Loads the configuration files from disk, merges them, resolves any loaders, and writes the final configuration to `config.json`. This is not typically called directly, but you can if you want to instead of using the CLI.

## CLI Reference

You can call the binary `brek` to perform various operations. You can use `npx brek` or in your `package.json` scripts.

### `brek load-config`

Preloads the configuration. Loads the configuration files from disk, merges them, resolves any loaders, and writes the final configuration to `config.json`.

---

### `brek write-types`

Writes the types to `config/Config.d.ts` unless otherwise specified. This must be called whenever `default.json` is changed.

## Recommended best practices

- `default.json` should contain all of your local development settings, and then "progressively enhance" from there.
- Use AWS Secrets Manager or Hashicorp Vault to store your sensitive information and use a [loader](#loaders) to load them.

## Usage with AWS Lambda

AWS Lambda has a read-only file system, except for the temporary `/tmp` directory, which is writable. To handle this, set the environment variable `BREK_WRITE_DIR` to `/tmp`.

You may also want to run `brek load-config` after your build step. Example:

```json
{
  "scripts": {
    "build": "tsc",
    "load-config": "ENVIRONMENT=prod BREK_WRITE_DIR=/tmp brek load-config",
    "prepare": "npm run build && npm run load-config"
  }
}
```

If the loaders must be executed during runtime, then you can use the `await loadConfig()` method in your Lambda handler to ensure the configuration is loaded before your function executes. Don't forget to include `BREK_WRITE_DIR=/tmp` in your Lambda environment variables.

## Debugging

You can set the `BREK_DEBUG` environment variable to see debug output. Example:

```shell script
BREK_DEBUG=1 ts-node src/index.ts
```

> Use with caution! This may output sensitive information to the console.

## Known issues

1. Some IDEs (particularly IntelliJ/Webstorm) occasionally have some issues with caching of the generated `Config.d.ts file` (which is stored in your `config` folder). If you run into this problem, restarting your TS service.
2. If you're using AWS Lambda, see the [Usage with AWS Lambda](#usage-with-aws-lambda) section.
3. If the iguration ever gets out of date, you'll need to do one or more of the following:

    - Call `brek write-types` to regenerate the type declaration file and delete the disk cache (`config.json`)
    - Make sure you're calling `brek load-config` or `loadConfig(): Promise<void>` before app startup
    - Restart your app to clear cache in memory

## Contributing

- ⭐ Star this repo if you like it!
- 🐛 Open an [issue](https://github.com/mhweiner/brek/issues) for bugs or suggestions.
- 🤝 Submit a PR to `main` — all tests must pass.

## Why is it called brek?

**Brek** stands for **B**locking **R**esolution of **E**nvironment **K**eys.

## Other useful libraries

- [autorel](https://github.com/mhweiner/autorel): Automate semantic releases based on conventional commits. Similar to semantic-release but much simpler.
- [hoare](https://github.com/mhweiner/hoare): An easy-to-use, fast, and defensive JS/TS test runner designed to help you to write simple, readable, and maintainable tests.
- [jsout](https://github.com/mhweiner/jsout): A Syslog-compatible, small, and simple logger for Typescript/Javascript projects.
- [cjs-mock](https://github.com/mhweiner/cjs-mock): NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes.
- [typura](https://github.com/aeroview/typura): Simple and extensible runtime input validation for TS/JS, written in TS.