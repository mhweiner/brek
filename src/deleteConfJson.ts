import * as fs from 'node:fs';
import {resolve} from 'node:path';

import {BREK_WRITE_DIR} from '.';
import {debug} from './debug';

export function deleteConfJson(): void {

    const filepath = resolve(BREK_WRITE_DIR, 'config.json');

    if (fs.existsSync(filepath)) {

        debug('deleting disk cache', filepath);
        fs.unlinkSync(filepath);

    }

}
