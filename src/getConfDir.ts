import * as path from 'path';

export function getConfDir(): string {

    const confDir = process.env.CONF_DIR || process.env.BREK_CONF_DIR || '/conf';

    return path.resolve(process.cwd() + confDir);

}
