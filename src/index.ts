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
export type Loader<T extends Record<string, string>> = (params: T) => string | Promise<string>;
export type LoaderDict = {[name: string]: Loader<any>};

export const BREK_CONFIG_DIR = process.env.BREK_CONFIG_DIR ?? resolve('config');
// The directory to write the resolved configuration to. On read-only file
// systems such as AWS Lambda, this should be set to a writable directory, ie
// /tmp.
export const BREK_WRITE_DIR = process.env.BREK_WRITE_DIR ? resolve(process.env.BREK_WRITE_DIR) : BREK_CONFIG_DIR;
export const BREK_LOADERS_FILE_PATH = process.env.BREK_LOADERS_FILE_PATH ? resolve(process.env.BREK_LOADERS_FILE_PATH) : resolve('brek.loaders.js');
export const BREK_CONFIG_JSON_PATH = resolve(BREK_WRITE_DIR, 'config.json');

let resolvedConf: Record<string, any> | null = null;
let attempts = 0;

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
    // Execute the command synchronously, which writes the resolved configuration to config.json.
    const cliPath = resolve(__dirname, '../bin/cli.js');
    const cmd = `node ${cliPath} load-config`;

    debug(`No config.json found. Running ${cmd} to generate one...`);

    try {

        // Set encoding to 'utf8' so execSync returns a string instead of a Buffer.
        const output = execSync(cmd, {encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});

        console.log(output);

    } catch (error: any) {

        console.log(error.stdout);
        console.error(error.stderr);
        throw error;

    }

    if (attempts > 2) {

        throw new Error('Failed to load configuration after multiple attempts.');

    }

    attempts++;
    return getConfig();

}

/**
 * Load the configuration from the project's config files and environment variables,
 * and write the resolved configuration to config.json.
 */
export async function loadConfig(): Promise<void> {

    const env = getEnvArguments();
    const confFromFiles = loadConfFromFiles(env);
    const mergedConf = mergeConfs({...confFromFiles, overrides: env.overrides});
    let loaders: Record<string, Loader<any>> = {};

    try {

        // Load the loaders from the provided file path.
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const mod = require(BREK_LOADERS_FILE_PATH);

        loaders = mod.default || mod;

    } catch (e: any) {

        if (e.code === 'MODULE_NOT_FOUND') {

            console.log(`No loaders found at ${BREK_LOADERS_FILE_PATH}.`);

        } else {

            throw e;

        }

    }

    debug('env:', env);
    debug('confFromFiles:', confFromFiles);
    debug('merged:', mergedConf);
    debug('loaders:', loaders ? Object.keys(loaders) : 'none');

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
