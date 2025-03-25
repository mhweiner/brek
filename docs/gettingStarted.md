# Getting Started

Using `brek` is simple, we promise. Here's a quick guide to get you started.

## Installation & Setup

### 1. Install from `npm`

```shell
npm i brek
```

### 2. Create `config` directory and configuration files

Create a directory called `config` in the root of your project. This is where your configuration will go, along with the generated Conf.d.ts TypeScript Declaration File. 

> Note: If you want to use a different directory, you can set the `BREK_CONFIG_DIR` environment variable to the path of your configuration directory.

Here's an example `config` folder:

```shell script
root/
└── config/
    └── deployments
        └── test.acme.json
    └── environments
        └── development.json
        └── production.json
    └── users
        └── john.json
    └── default.json
```

Only `default.json` is required, which is placed at the root of your `config` folder. 

Here's a simple example:

__default.json__
```json
{
  "postgres": {
    "host": "localhost",
    "port": 5432,
    "user": "pguser",
    "password": "pgpassword",
  }
  "port": 3000
}
```

To learn more how this works, see [merge strategy](../README#configuration-merge-strategy) and [configuration rules](../README.md#configuration-rules). Also, don't forget to check out [loaders](#loaders) for dynamic runtime configuration! 🚀

### 3. Call `brek write-types` when your configuration changes to generate the type declaration file

Whenever your base `default.json` configuration changes, you'll need to run the command to build the type declaration file, `Config.d.ts`.

For example, you could add the following to your `package.json` file:
    
  ```json
  {
    "scripts": {
      "prepare": "brek write-types"
    }
  }
  ```

To run this manually, you can run `npx brek write-types`.

### 4. Recommended: Typescript Configuration (tsconfig.json)

If you're using Typescript, you'll need to make sure the generated `Config.d.ts` file will be picked up by your Typescript parser. One way to do this is by including it in your `include` directive like so:

```json
  "include":[
    "src/**/*",
    "config/Conf.d.ts" // modify this if your config directory is different
  ],
```

 If you're using `ts-node`, it might help to add the following:

```json
"ts-node": {
  "files": true
}
```

### 5. Recommended: Clear disk cache & preload configuration

The first time the configuration is accessed, it will be loaded from disk and merged, along with the resolution of any loaders.

This can cause a delay in your app. To avoid this, you can preload the configuration by calling `brek load-config` before your app starts.

This also deletes the cached `config.json` file, which is used to speed up subsequent loads.

```json
{
  "scripts": {
    "start": "brek load-config && node src/index.js"
  }
}
```

### 6. Recommended: Add generated files to `.gitignore`

You may want to add `config/Config.d.ts` and `config/config.json` to your `.gitignore` file to prevent them from being checked into source control.

## Getting the config object or Config type

Use `getConfig()` to access the configuration object.

Example:

```typescript
import {getConfig} from "brek";

const config = getConfig(); // type of Config

// Enjoy full autocompletion and type safety! 🚀
```

If you need the type interface, you can import it:

```typescript
import {Config} from "brek";
```

**Note: If the cached configuration ever gets out of date, you'll need to do one or more of the following:**

- Restart your app
- Call `brek write-types` to regenerate the type declaration file and delete the config.json file (disk cache)
- Restart your app to clear cache in memory