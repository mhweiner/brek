import * as fs from 'fs';
import {resolveConf} from './resolveConf';
import {getEnvArguments} from './getEnvArguments';
import {loadConfFromFiles} from './loadConfFromFiles';
import {mergeConfs} from './mergeConfs';
import {getConfDir} from './getConfDir';
import {generateTypeDef} from './generateTypeDef';

export async function writeConfFile(): Promise<void> {

    const env = getEnvArguments();
    const confSources = loadConfFromFiles(env);
    const mergedConf = mergeConfs(confSources);
    const defaultConfig = await resolveConf(mergedConf, {});
    const filepath = `${getConfDir()}/Conf.d.ts`;
    const ts = generateTypeDef(defaultConfig);

    console.log(`brek: writing ${filepath}`);
    fs.writeFileSync(filepath, ts);

}
