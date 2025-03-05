import {ConfNotLoaded} from './errors';
import {getEnvArguments} from './getEnvArguments';
import {resolveConf} from './resolveConf';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {debug} from './debug';
import {writeConfJson} from './writeConfJson';
import {readFileSync} from 'fs';
import {toResult} from './lib/toResult';
import {getConfDir} from './getConfDir';

export interface Conf {} // This gets extended in the generated type definition
export type Loader<T extends Record<string, string>> = (params: T) => string;
export type LoaderDict = {[name: string]: Loader<any>};

let resolvedConf: Record<string, any> | null = null;

export async function loadConf(loaders: LoaderDict = {}): Promise<Conf> {

    const env = getEnvArguments();
    const confFromFiles = loadConfFromFiles(env);
    const mergedConf = mergeConfs({...confFromFiles, overrides: env.overrides});

    debug('env:', env);
    debug('confFromFiles:', confFromFiles);
    debug('merged:', mergedConf);

    resolvedConf = await resolveConf(mergedConf, loaders);
    writeConfJson(resolvedConf);

    return resolvedConf as Conf;

}

export function getConf(): Conf {

    if (!resolvedConf) {

        // try to load from conf.json
        const confJsonFilePath = `${getConfDir()}/conf.json`;
        const [err, confRaw] = toResult(() => readFileSync(confJsonFilePath, 'utf8'));

        if (err || !confRaw) throw new ConfNotLoaded();

        const [err2, conf] = toResult(() => JSON.parse(confRaw));

        if (err2) throw new Error(`Error parsing conf.json: ${err}`);

        resolvedConf = conf;

    }

    return resolvedConf as Conf;

}

export * from './writeTypeDef';
