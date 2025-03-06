import * as fs from 'node:fs';
import {resolve} from 'node:path';

import {BREK_WRITE_DIR} from '.';

export function writeConfJson(resolvedConf: Record<string, any>): void {

    const filepath = resolve(BREK_WRITE_DIR, 'config.json');

    console.log('Writing config to:', filepath);
    fs.writeFileSync(filepath, JSON.stringify(resolvedConf, null, 2));

}
