import * as fs from 'fs';
import {getConfDir} from './getConfDir';
import {debug} from './debug';

export function writeConfJson(resolvedConf: Record<string, any>): void {

    const filepath = `${getConfDir()}/conf.json`;

    debug('Writing conf to:', filepath);
    fs.writeFileSync(filepath, JSON.stringify(resolvedConf, null, 2));

}
