import * as fs from 'fs';
import {getConfDir} from './getConfDir';

export function writeConfJson(
    resolvedConf: Record<string, any>,
    silent = false // will not log to console
): void {

    const filepath = `${getConfDir()}/conf.json`;

    !silent && console.log(`brek: writing ${filepath}`);
    fs.writeFileSync(filepath, JSON.stringify(resolvedConf, null, 2));

}
