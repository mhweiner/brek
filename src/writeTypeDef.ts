import * as fs from 'node:fs';
import {resolve} from 'node:path';

import {generateTypeDef} from './generateTypeDef';
import {loadConfFile} from './loadConfFile';
import {BREK_CONFIG_DIR} from '.';

export function writeTypeDef(): void {

    const defaultConfig = loadConfFile(['default.json']);
    const filepath = resolve(BREK_CONFIG_DIR, 'Config.d.ts');
    const ts = generateTypeDef(defaultConfig);

    console.log(`brek: writing ${filepath}`);
    fs.writeFileSync(filepath, ts);

}
