import * as fs from 'node:fs';
import {resolve} from 'node:path';

import {debug} from './debug';
import {BREK_WRITE_DIR} from '.';

export function writeConfJson(resolvedConf: Record<string, any>): void {

    const filepath = resolve(BREK_WRITE_DIR, 'config.json');

    debug('Writing config to:', filepath);
    fs.writeFileSync(filepath, JSON.stringify(resolvedConf, null, 2));

}
