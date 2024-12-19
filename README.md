# brek (formerly lambdaconf)

[![build status](https://github.com/mhweiner/lambdaconf/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/lambdaconf/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Brek** stands for **B**locking **R**esolution of **E**nvironment **K**eys.

Brek is a powerful yet simple configuration library for Node.js, Deno, and Bun (server-only). It’s structured, typed, and designed for dynamic configuration loading, making it perfect for securely managing secrets (e.g., AWS Secrets Manager). Written in TypeScript for safety and ease of use. Sponsored by [Aeroview](https://aeroview.io).

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
- Any custom logic can go here, keeping your config files logic-free
- Provides an easy sharable and reusable plugin interface for sharing or re-use

# Installation & Setup

## 1. Install from `npm`

```shell
npm i brek
```

## 2. Create `conf` directory

Create a directory called `conf` in the root of your project. This is where your configuration will go, along with the generated Conf.d.ts TypeScript Declaration File. 

If you will be using the Environment, User, or Deployment [merge strategies](#configuration-overrides-and-merge-strategy), you will need to create those folders within `conf` as `environments`, `users`, and `deployments`, respectively.

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

## 3. Create your configuration files

At a minimum, `default.json` is required at the root of your `conf` folder. 

See [full configuration rules](#configuration-rules), [merge strategy](#configuration-overrides-and-merge-strategy), and reference the example folder structure above.

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

## 5. Call `brek` when your configuration changes

Whenever your configuration changes, you'll need to run the `brek` executable to build the type declaration file. One option is to add the following to your `package.json` file:
    
  ```json
  {
    "scripts": {
      "prepare": "brek"
    }
  }
  ```

To run this manually, you can run `npx brek`. This will generate the `Conf.d.ts` file in your `conf` folder.

You can also use [loaders](#loaders) or [environment variables](#environment-variables-in-config-files).

## Configuration Rules

- `default.json` is required, everything else is optional. Recommended practice is that `default.json` contains all of your "local development" settings.

- All configuration files must be a subset of `default.json`. Think of them simply as overrides to the default. In Typescript terms, conf files must be of type `Partial<Conf>`.

- A property's type should not change simply because of a different environment, user, or deployment. This is basically saying the same as above.

- [Loaders](#loaders) that are used on the same property in different files should all return the same type (again, same as above).

- Arrays should be homogenous (not of mixed types).

## Loading the Configuration

You must first *load* the config, which resolves any [loaders](#loaders) and performs the merge. 

We <b>strongly</b> recommend you call `loadConf()` before your app starts, ie, during initialization, before `app.listen(), etc.`.This will cache the configuration so there will be no performance penalty.

Either way, the configuration will only load once, as it will be cached.

```typescript
import {loadConf, getConf} from "brek";

loadConf().then(() => {

    //start server, etc.
    console.log(getConf()); // outputs config object

}).catch(console.log.bind(console));
```

## Getting the Config Object

Once loaded, use `getConf` to access:

```typescript
import {getConf} from "brek";

const conf = getConf(); // type of Conf is inferred

console.log(conf); // logs config object

const isFooBarEnabled: boolean = conf.foo.bar; // Typescript error if does not exist or type mismatch
```

If you need the type interface, you can import it:

```typescript
import {Conf} from "brek";
```

## Configuration Merge Strategy

Configurations are merged in this order, with the later ones overriding the earlier ones:
 
1. default.json
2. environment file
3. deployment file
4. user file
5. CLI overrides

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

## Using CLI/ENV Overrides

You can use the `BREK` (`OVERRIDE` has been deprecated) environment variable to override properties via CLI/ENV. `BREK` must be valid JSON. Example:

```shell script
BREK="{\"a\": {\"b\": \"q\"}}" ts-node src/index.ts
```

When using with npm scripts, it might be useful to use command substitution like so:

```json
{
   "start": "BREK=$(echo '{\"postgres\": \"localhost\"}') ts-node src/index.ts"
}
```

This is especially useful if you want to make use of environment variables (notice the extra single quotes):

```json
{
   "start": "BREK=$(echo '{\"postgres\": \"'$DATABASE_URL'\"}') ts-node src/index.ts"
}
```

⚠️ _Use caution! CLI overrides are not checked by Typescript's static type checking, and there is currently no runtime type checking feature. Feel free to submit an issue or PR if you want this._

## Environment Variables in Config Files

You can use environment variables as values by wrapping it in `${...}`. For example, to use environment variable `FOO`, use `${FOO}`. This will translate to `process.env.FOO`. These will always be typed as strings. Example config file:

```json
{
  "foo": "${FOO}"
}
```

## Loaders

Loaders are custom functions that are called during startup (run-time). This can be used to do anyting, such as fetching secrets from AWS Secrets Manager, or any other dynamic runtime operation.

Loaders are run once during the type declaration build step (compile-time), and once while the configuration is loading (run-time). They can be normal functions or use async/await/Promise.

### Example

_conf/default.json_
```json
{
  "foo": {
    "[foo]": {
      "a": "demo"
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
    foo: (params: {a: string}) => Promise.resolve(`foo_${a}`),
    add10: (val: number) => number + 10,
};

loadConfig(loaders)
    .then(() => {
        console.log(getConf().foo); // "foo_demo"
        console.log(getConf().bar); // 52
        //start server, etc.
    })
    .catch(console.log.bind(console));
```

### Usage

Loader functions must extend `(params: any) => any`. If helpful, you can import the `Loader` type like so:

```typescript
import type {Loader} from 'brek';
```

In a conf file, any object with a single property matching the pattern `/^\[.*\]$/` (`[...]`) is assumed to call a loader. If a matching loader is not found, it will throw a `LoaderNotFound` error.

# Recommended Best Practices

- `default.json` should contain all of your local development settings, and then "progressively enhance" from there.
- Include `loadConf().then(...)` or `await loadConf()` in your startup process before your server starts listening (ie, before `app.listen()`).
- Create all of the merge folders (ie. deployments) even if you're not using them.
- Use AWS Secrets Manager or Hashicorp Vault to store your sensitive information and use a [loader](#loaders) to load them.

## Debugging

You can set the `LAMBDA_CONF_DEBUG` environment variable to see debug output. Example:

```shell script
LAMBDA_CONF_DEBUG=1 ts-node src/index.ts
```

> Use with caution! This may output sensitive information to the console.

# Known Issues

1. Some IDEs (particularly IntelliJ/Webstorm) occasionally have some issues with caching of the generated `Conf.d.ts file` (which is stored in your `conf` folder). If you run into this problem, restarting your TS service.

# Support, Feedback, and Contributions

- Star this repo if you like it!
- Submit an [issue](https://github.com/mhweiner/brek/issues) with your problem, feature request or bug report
- Issue a PR against `main` and request review. Make sure all tests pass and coverage is good.
- Write about `lambdaconf` in your blog, tweet about it, or share it with your friends!

# Sponsorship

Want to sponsor this project? [Reach out to me via email](mailto:mhweiner234@gmail.com?subject=I%20want%20to%20sponsor%20cjs-mock).

<picture>
    <source srcset="docs/aeroview-logo-lockup-dark.svg" media="(prefers-color-scheme: dark)">
    <source srcset="docs/aeroview-logo-lockup.svg" media="(prefers-color-scheme: light)">
    <img src="docs/aeroview-logo-lockup.svg" alt="Logo" style="max-width: 150px;margin: 0 0 10px">
</picture>

Aeroview is a lightning-fast, developer-friendly, and AI-powered logging IDE. Get started for free at [https://aeroview.io](https://aeroview.io).

# License

MIT &copy; Marc H. Weiner
[See full license](LICENSE)