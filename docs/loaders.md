# Loaders

Loaders are custom functions that are called during startup (run-time). This can be used to do anything, such as fetching secrets from AWS Secrets Manager, or any other dynamic runtime operation. They can be Promise/async/await based.

## Example

_conf/default.json_
```json
{
  "foo": {
    "[fetchSecret]": {
      "key": "demo",
      "region": "us-west-2"
    }   
  },
  "bar": {
    "[add10]": 42
  }
}
```
_brek.loaders.js_
```javascript
module.exports = {
    fetchSecret: async ({key, region}) => {
        //fetch secret from AWS Secrets Manager
        return Promise.resolve(`secret_${key}_${region}`);
    },
    add10: (val) => {
        return String(val + 10);
    }
};
```

_index.ts_
```typescript
import {getConf} from "brek";

const {foo, bar} = getConf();

console.log(foo); // secret_demo_us-west-2
console.log(bar); // 52
```

## Usage

Loader functions must extend `(params: any) => string`. If helpful, you can import the `Loader` type like so:

```typescript
import type {Loader} from 'brek';
```

In a conf file, any object with a single property matching the pattern wrapped in square brackets (`[...]`) is assumed to be a loader. The key is the loader name, and the value is the parameter passed to the loader.

If a matching loader is not found, it will throw a `LoaderNotFound` error. Loaders must return strings.