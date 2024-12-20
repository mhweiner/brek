# brek

(formerly lambdaconf)

[![build status](https://github.com/mhweiner/lambdaconf/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/lambdaconf/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Static Badge](https://img.shields.io/badge/v2-autorel?label=autorel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**Brek** stands for **B**locking **R**esolution of **E**nvironment **K**eys.

Brek is a powerful yet simple configuration library for Node.js. It’s structured, typed, and designed for dynamic configuration loading, making it perfect for securely managing secrets (e.g., AWS Secrets Manager). Written in TypeScript for safety and ease of use. Sponsored by [Aeroview](https://aeroview.io).

**🔒 Out-of-the-box Typescript support**
- Turn your runtime errors into safer compile-time errors! Automatically generated Typescript type definition for configuration object
- Any override must satisfy `Partial<DefaultConfig>` type, or it will throw a Typescript error

**😃 Simple, easy-to-use, safe, and stable**
- All settings are in simple, easily readable & logic free `.json` files.
- Enforces a simple and sensible folder structure
- Limited yet powerful feature set with clean documentation
- Small, simple, and modular codebase written in Typescript with no dependencies.

**💪 Flexible & powerful**
- Provides for overrides via CLI without polluting the CLI argument namespace
- Differentiates between concepts such as `environment`, `deployment`, and `user` and provides an out-of-the-box
  solution with sensible merge strategy
- Fast. Runtime processing is done during app initialization only.
- Put [environment variables](#environment-variables-in-config-files) directly into .json files

**🤖 Dynamic loading**
- Great for AWS Secrets Manager, AWS Parameter Store, HashiCorp Vault, or custom dynamic runtime functions
- Any custom logic lives in [loaders](#loaders), keeping your config files logic-free
- Provides an easy sharable and reusable plugin interface for sharing or re-use

# Installation & Setup

## 1. Install from `npm`

```shell
npm i brek
```

## 2. Create `conf` directory

Create a directory called `conf` in the root of your project. This is where your configuration will go, along with the generated Conf.d.ts TypeScript Declaration File. 

> Note: If you want to use a different directory, you can set the `BREK_CONF_DIR` environment variable to the path of your configuration directory.

Here's an example `conf` folder:

```shell script
root/
└── conf/
    └── deployments
        └── test.acme.json
    └── environments
        └── development.json
        └── production.json
    └── users
        └── john.json
    └── default.json
```

At a minimum, `default.json` is required at the root of your `conf` folder. To learn more about the other folders, see [merge strategy](#configuration-merge-strategy) and [configuration rules](#configuration-rules)

## 3. Create your configuration files

Here's a simple example:

__default.json__
```json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "user": "pguser"
  }
  "port": 3000,
  "foo": {
    "bar": true
  }
}
```

At a minimum, `default.json` is required at the root of your `conf` folder. 

See [full configuration rules](#configuration-rules), [merge strategy](#configuration-overrides-and-merge-strategy), and reference the example folder structure above. Also, don't forget to check out [loaders](#loaders) for dynamic runtime configuration.

## 4. Typescript Configuration (tsconfig.json)

Make sure the generated `conf/Conf.d.ts` file will be picked up by your Typescript parser. One way to do this is by including it in your `include` directive like so:

```json
  "include":[
    "src/**/*",
    "conf/Conf.d.ts"
  ],
```

 If you're using `ts-node`, it might help to add the following:

```json
"ts-node": {
  "files": true
}
```

## 5. Call `brek` when your configuration changes to generate the type declaration file

Whenever your `default.json` configuration changes, you'll need to run the `brek` command to build the type declaration file. For example, you could add the following to your `package.json` file:
    
  ```json
  {
    "scripts": {
      "postinstall": "brek"
    }
  }
  ```

To run this manually, you can run `npx brek`. This will generate the `Conf.d.ts` file in your `conf` folder.

## 6. Optional: Add generated files to `.gitignore`

You may want to add `conf/Conf.d.ts` and `conf/conf.json` to your `.gitignore` file to prevent them from being checked into source control.

# Loading the Configuration

You must first *load* the configuration, which loads the files from disk, does the merge, and resolves any [loaders](#loaders). You have two options:

1. Use `loadConf()` within your app to load the configuration asynchronously before your app starts.

2. Use `loadConf()` in a script to generate the configuration file before running your app.

Here's an example of using `loadConf()` in your app:

```typescript
import {loadConf, getConf} from "brek";

loadConf()
    .then(() => {
        const conf = getConf();
        console.log(conf);
        // start your server, etc.
    })
    .catch(console.log.bind(console));
```

Here's an example of using `loadConf()` in an init script:

```typescript
import {loadConf} from "brek";

loadConf()
    .then(() => {
        console.log("Configuration loaded successfully");
    })
    .catch(console.log.bind(console));
```


# Getting the config object

Once loaded, use `getConf` to access the configuration object. The configuration is cached after the first load, so you can call `getConf` as many times as you want without worrying about performance.

> Note: If you used `loadConf()` in your app, it will already be in memory. If you used `brek load-conf`, the first call to `getConf` will read from disk.

Example:
`
```typescript
import {getConf} from "brek";

const conf = getConf(); // type of Conf

console.log(conf); // logs config object

const isFooBarEnabled: boolean = conf.foo.bar; // will throw Typescript error as expected if does not exist or is not a boolean
```

If you need the type interface, you can import it:

```typescript
import {Conf} from "brek";
```

# Configuration rules

- `default.json` is required, everything else is optional. Recommended practice is that `default.json` contains all of your "local development" settings.

- All configuration files must be a subset of `default.json`. Think of them simply as overrides to the default. In Typescript terms, conf files must be of type `Partial<Conf>`.

- A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.

- [Loaders](#loaders) always must return a string. If you need to return a different type, you can use `JSON.parse()` or similar.

- Arrays should be homogenous (not of mixed types).

# Configuration merge strategy

Configurations are merged in this order, with the later ones overriding the earlier ones:
 
1. default.json
2. environment file
3. deployment file
4. user file
5. CLI/env overrides

Which of these sources to choose depends on the presence of certain `process.env` configuration variables:

| **process.env**         | **conf file**                         |
| ----------------------- | --------------------------------------|
| `NODE_ENV`              | `/conf/environments/[NODE_ENV].json`  |
| `DEPLOYMENT`            | `/conf/deployments/[DEPLOYMENT].json` |
| `USER`                  | `/conf/users/[USER].json`             |
| `BREK`                  | N/A                                   |
| `OVERRIDE` (deprecated) | N/A                                   |

A few notes:

- `BREK` must be valid JSON. [Learn more](#using-cli-overrides)
- `USER` is usually provided by default by UNIX environments (try `console.log(process.env.USER)`)
- [Loaders](#loaders) parameters are simply replaced, not merged. A `loader` instance is treated as a primitive.
- Arrays are simply replaced, not merged.

# Using CLI/env overrides

You can use the `BREK` environment variable to override properties via CLI/ENV. `BREK` must be valid JSON. Using `jq` simplifies dynamic JSON construction, ensures proper quoting, and makes it easier to handle environment variables.

## Examples

```bash
# Override the a.b property
BREK=$(jq -n '{a: {b: "q"}}') ts-node src/index.ts

# Override the postgres property wth an environment variable
DATABASE_URL="postgres://user:pass@localhost:5432/db"
BREK=$(jq -n --arg db "$DATABASE_URL" '{postgres: $db}') ts-node src/index.ts
```

# Environment variables in config files

You can use environment variables as values by wrapping it in `${...}`. For example, to use environment variable `FOO`, use `${FOO}`. This will translate to `process.env.FOO`. These will always be typed as strings. Example config file:

```json
{
  "foo": "${FOO}"
}
```

# Loaders

Loaders are custom functions that are called during startup (run-time). This can be used to do anything, such as fetching secrets from AWS Secrets Manager, or any other dynamic runtime operation. They can be Promise/async/await based.

## Example

_conf/default.json_
```json
{
  "foo": {
    "[fetchSecret]": {
      "key": "demo"
    }   
  },
  "bar": {
    "[add10]": 42
  }
}
```
_index.ts_

```typescript
import {loadConfig, getConf} from "brek";

const loaders = {
    fetchSecret: (params: {key: string}) => Promise.resolve(`secret_${a}`),
    add10: (val: number) => String(val + 10),
};

loadConfig(loaders)
    .then(() => {
        console.log(getConf().foo); // "secret_demo"
        console.log(getConf().bar); // "52"
        //start server, etc.
    })
    .catch(console.log.bind(console));
```

## Usage

Loader functions must extend `(params: any) => string`. If helpful, you can import the `Loader` type like so:

```typescript
import type {Loader} from 'brek';
```

In a conf file, any object with a single property matching the pattern wrapped in square brackets (`[...]`) is assumed to be a loader. The key is the loader name, and the value is the parameter passed to the loader.

If a matching loader is not found, it will throw a `LoaderNotFound` error. Loaders must return strings.

# Recommended best practices

- `default.json` should contain all of your local development settings, and then "progressively enhance" from there.
- Include `loadConf().then(...)` or `await loadConf()` in your startup process before your server starts listening (ie, before `app.listen()`).
- Create all of the merge folders (ie. deployments) even if you're not using them.
- Use AWS Secrets Manager or Hashicorp Vault to store your sensitive information and use a [loader](#loaders) to load them.

# Debugging

You can set the `LAMBDA_CONF_DEBUG` environment variable to see debug output. Example:

```shell script
LAMBDA_CONF_DEBUG=1 ts-node src/index.ts
```

> Use with caution! This may output sensitive information to the console.

# Known issues

1. Some IDEs (particularly IntelliJ/Webstorm) occasionally have some issues with caching of the generated `Conf.d.ts file` (which is stored in your `conf` folder). If you run into this problem, restarting your TS service.

# Support, feedback, and contributions

- Star this repo if you like it!
- Submit an [issue](https://github.com/mhweiner/autorel/issues) with your problem, feature request or bug report
- Issue a PR against `main` and request review. Make sure all tests pass and coverage is good.
- Write about this project in your blog, tweet about it, or share it with your friends!

# Sponsorship
<br>
<picture>
    <source srcset="https://qhg29tyl98-av-www-dev1.s3.us-east-2.amazonaws.com/app-frontend/images/aeroview-white.svg" media="(prefers-color-scheme: dark)">
    <source srcset="https://qhg29tyl98-av-www-dev1.s3.us-east-2.amazonaws.com/app-frontend/images/aeroview-black.svg" media="(prefers-color-scheme: light)">
    <img src="https://qhg29tyl98-av-www-dev1.s3.us-east-2.amazonaws.com/app-frontend/images/aeroview-black.svg" alt="Logo" height="20">
</picture>
<br>

Aeroview is a lightning-fast, developer-friendly, and AI-powered logging IDE. Get started for free at [https://aeroview.io](https://aeroview.io).

Want to sponsor this project? [Reach out](mailto:mhweiner234@gmail.com?subject=I%20want%20to%20sponsor%20brek).

# Other useful libraries

- [autorel](https://github.com/mhweiner/autorel): Automate semantic releases based on conventional commits. Similar to semantic-release but much simpler.
- [hoare](https://github.com/mhweiner/hoare): An easy-to-use, fast, and defensive JS/TS test runner designed to help you to write simple, readable, and maintainable tests.
- [jsout](https://github.com/mhweiner/jsout): A Syslog-compatible, small, and simple logger for Typescript/Javascript projects.
- [cjs-mock](https://github.com/mhweiner/cjs-mock): NodeJS module mocking for CJS (CommonJS) modules for unit testing purposes.
- [typura](https://github.com/aeroview/typura): Simple and extensible runtime input validation for TS/JS, written in TS.

# License

[MIT](LICENSE)