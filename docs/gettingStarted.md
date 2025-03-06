# Getting Started

Using `brek` is simple, we promise. Here's a quick guide to get you started. At a high level, you'll need to:

1. Install `brek` from `npm`
2. Create a `conf` directory
3. Create your configuration files
4. Configure Typescript to include the generated `Conf.d.ts` file
5. Call `brek` to generate the type declaration file
6. Load the configuration in your app

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
      "prepare": "brek"
    }
  }
  ```

To run this manually, you can run `npx brek`. This will generate the `Conf.d.ts` file in your `conf` folder.

## 6. Optional: Add generated files to `.gitignore`

You may want to add `conf/Conf.d.ts` and `conf/conf.json` to your `.gitignore` file to prevent them from being checked into source control.

# Loading the configuration

Before you can read the configuration within your app, you must first *load* it. This step involves reading the files from disk, merging them, and resolving any [loaders](#loaders). You have two options:

1. Use `loadConf()` within your app to load the configuration asynchronously before your app starts.

2. Use `loadConf()` in a script to generate the `conf.json` configuration file before running your app.

Here's an example of using `loadConf()` in your app:

```typescript
import {loadConf, getConf} from "brek";

loadConf() // optionally pass in loaders and options here
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

loadConf()  // optionally pass in loaders here
    .then(() => {
        console.log("Configuration loaded successfully and written to conf.json");
    })
    .catch(console.log.bind(console));
```

```bash
ts-node init.ts && ts-node src/index.ts
```

# Getting the config object

Once loaded, use `getConf` to access the configuration object. The configuration is cached after the first load, so you can call `getConf` as many times as you want without worrying about performance.

Example:

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