import {isLoader} from './isLoader';
import type {LoaderDict} from '.';
import {LoaderNotFound} from './errors';
import {isEnvironmentVariable} from './isEnvironmentVariable';

export async function resolveConf(
    obj: {[key: string]: any},
    loaders: LoaderDict,
): Promise<Record<string, any>> {

    const resolvedConfig = {...obj}; // Make a copy of the object, which will be modified

    await Promise.all(Object.keys(obj).map(async (key: string) => {

        const value = obj[key];

        if (typeof value === 'object') {

            if (isLoader(value)) {

                resolvedConfig[key] = await resolveLoader(value, loaders);

            } else {

                // Recursively resolve the object
                resolvedConfig[key] = await resolveConf(value, loaders);

            }

        } else if (typeof value === 'string' && isEnvironmentVariable(value)) {

            const name = value.slice(2, value.length - 1);

            resolvedConfig[key] = process.env[name];

        }

    }));

    return resolvedConfig;

}

async function resolveLoader(obj: {[key: string]: any}, loaders: LoaderDict): Promise<any> {

    const [key] = Object.keys(obj); // [...]
    const name = key.slice(1, key.length - 1);
    const params = obj[key];

    if (!loaders[name]) throw new LoaderNotFound(name, loaders);

    const loader = loaders[name];

    return loader(params);

}
