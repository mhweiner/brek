import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {writeConfJson} from './writeConfJson';
import {toResult} from './lib/toResult';
import {getEnvArguments} from './getEnvArguments';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {resolveConf} from './resolveConf';
import {debug} from './debug';

export interface Config {} // This gets extended in the generated type definition
export type Loader<T extends Record<string, string>> = (params: T) => string;
export type LoaderDict = {[name: string]: Loader<any>};

export const BREK_CONFIG_DIR = process.env.BREK_CONFIG_DIR ?? './config';
// The directory to write the resolved configuration to. On read-only file
// systems such as AWS Lambda, this should be set to a writable directory, ie
// /tmp.
export const BREK_WRITE_DIR = process.env.BREK_WRITE_DIR ?? BREK_CONFIG_DIR;
export const BREK_LOADERS_FILE_PATH = resolve(process.env.BREK_LOADERS_FILE_PATH ?? 'brek.loaders.js');
export const BREK_CONFIG_JSON_PATH = resolve(BREK_WRITE_DIR, 'config.json');

let resolvedConf: Record<string, any> | null = null;

export function getConfig(): Config {

    if (resolvedConf) return resolvedConf as Config;

    // Try to load from config.json first
    const [, confRaw] = toResult(() => readFileSync(BREK_CONFIG_JSON_PATH, 'utf8'));

    if (confRaw) {

        const [jsonParseErr, conf] = toResult(() => JSON.parse(confRaw));

        if (jsonParseErr) throw new Error(`Error parsing config.json: ${jsonParseErr}`);
        if (!conf) throw new Error('Error parsing config.json: empty object');

        resolvedConf = conf;

        return resolvedConf as Config;

    }

    // Load from project's config files and environment variables.
    // Execute the command synchronously, returning the resolved configuration.
    resolvedConf = execSync(`node ${resolve('dist', 'buildAndResolveConfigCli.js')}`) as Record<string, any>;

    // Persist the resolved configuration to config.json
    writeConfJson(resolvedConf);

    return resolvedConf as Config;

}

export async function loadConfig(): Promise<void> {

    const env = getEnvArguments();
    const confFromFiles = loadConfFromFiles(env);
    const mergedConf = mergeConfs({...confFromFiles, overrides: env.overrides});
    let loaders: Record<string, Loader<any>> = {};

    try {

        // Load the loaders from the provided file path.
        // Use the file:// prefix to ensure the dynamic import works correctly in an ESM context.
        const mod = await import(`file://${BREK_LOADERS_FILE_PATH}`);

        loaders = mod.default;

    } catch (e) {

        console.log(`No loaders found at ${BREK_LOADERS_FILE_PATH}.`);

    }

    debug('env:', env);
    debug('confFromFiles:', confFromFiles);
    debug('merged:', mergedConf);
    debug('loaders:', loaders);

    if (Object.keys(loaders)) {

        // Resolve the configuration with the provided loaders.
        const conf = await resolveConf(mergedConf, loaders);

        // Persist the resolved configuration to config.json
        writeConfJson(conf);

    } else {

        // I guess there are no loaders to resolve
        writeConfJson(mergedConf);

    }

}
