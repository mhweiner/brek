import * as fs from 'fs';
import {getConfDir} from './getConfDir';
import {generateTypeDef} from './generateTypeDef';
import {loadConfFile} from './loadConfFile';

export function writeTypeDef(): void {

    const defaultConfig = loadConfFile('/default.json');
    const filepath = `${getConfDir()}/Conf.d.ts`;
    const ts = generateTypeDef(defaultConfig);

    console.log(`brek: writing ${filepath}`);
    fs.writeFileSync(filepath, ts);

}
