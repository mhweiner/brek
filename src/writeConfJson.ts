import * as fs from 'fs';
import {getConfDir} from './getConfDir';

export function writeConfJson(resolvedConf: Record<string, any>): void {

    const filepath = `${getConfDir()}/conf.json`;

    console.log(`brek: writing ${filepath}`);
    fs.writeFileSync(filepath, JSON.stringify(resolvedConf, null, 2));

}
