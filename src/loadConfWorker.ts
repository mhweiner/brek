import {debug} from 'console';
import {LoaderDict, Conf} from '.';
import {getEnvArguments} from './getEnvArguments';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {resolveConf} from './resolveConf';

let resolvedConf: Record<string, any> | null = null;

export async function loadConf(loaders: LoaderDict = {}): Promise<Record<string, any>> {

    const env = getEnvArguments();
    const confFromFiles = loadConfFromFiles(env);
    const mergedConf = mergeConfs({...confFromFiles, overrides: env.overrides});

    debug('env:', env);
    debug('confFromFiles:', confFromFiles);
    debug('merged:', mergedConf);

    resolvedConf = await resolveConf(mergedConf, loaders);

    return resolvedConf as Conf;

}
