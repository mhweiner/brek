import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {InvalidConf} from './errors';
import {BREK_CONFIG_DIR} from '.';

/**
 * Loads a configuration file relative to the BREK_CONFIG_DIR. Does not
 * require leading slashes.
 * @param parts
 */
export function loadConfFile(parts: string[]): Record<string, any> {

    const file = resolve(BREK_CONFIG_DIR, ...parts);
    let fileContent;

    try {

        fileContent = readFileSync(file, 'utf-8');

    } catch (e) {

        return {};

    }

    try {

        return JSON.parse(fileContent) as Record<string, any>;

    } catch (e) {

        throw new InvalidConf([`${file} is not valid JSON`]);

    }

}
