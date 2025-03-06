import {loadConfig} from '.';
import {writeTypeDef} from './writeTypeDef';

export function run(cmd: string): void {

    switch (cmd && cmd.trim()) {

        case 'write-types':
            writeTypeDef();
            break;
        case 'load-config':
            loadConfig();
            break;
        default:
            console.error(`Unknown command: ${cmd}. Available commands: write-types, load-config`);
            process.exit(1);

    }

}
