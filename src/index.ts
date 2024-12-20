import {ConfNotLoaded} from './errors';
import {getEnvArguments} from './getEnvArguments';
import {resolveConf} from './resolveConf';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {debug} from './debug';

export interface Conf {}

export type Loader<I, O> = (params: I) => O;
export type LoaderDict = {[name: string]: Loader<any, any>};

let resolvedConf: Record<string, any> | null = null;

export async function loadConf(loaders: LoaderDict = {}): Promise<Conf> {

    const env = getEnvArguments();
    const confFromFiles = loadConfFromFiles(env);
    const mergedConf = mergeConfs({...confFromFiles, overrides: env.overrides});

    debug('env:', env);
    debug('confFromFiles:', confFromFiles);
    debug('merged:', mergedConf);

    resolvedConf = await resolveConf(mergedConf, loaders);

    return resolvedConf as Conf;

}

export function getConf(): Conf {

    if (!resolvedConf) {

        throw new ConfNotLoaded();

    }

    return resolvedConf as Conf;

}

export * from './writeTypeDef';
