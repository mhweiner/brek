import {InvalidConf} from './errors';
import {toResult} from './lib/toResult';

export function getEnvOverrides(): Record<string, any> {

    const cliOverrides = process.env.BREK || process.env.OVERRIDE;

    if (cliOverrides) {

        const [err, json] = toResult(() => JSON.parse(cliOverrides));

        if (err) {

            throw new InvalidConf(['CLI overrides (BREK/OVERRIDE) is not valid JSON']);

        }

        return json;

    } else {

        return {};

    }

}
