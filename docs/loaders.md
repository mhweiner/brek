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