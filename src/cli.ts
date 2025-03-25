import {loadConfig} from '.';
import {deleteConfJson} from './deleteConfJson';
import {writeTypeDef} from './writeTypeDef';

export function run(cmd: string): void {

    switch (cmd && cmd.trim()) {

        case 'write-types':
            writeTypeDef();
            deleteConfJson(); // clear disk cache
            break;
        case 'load-config':
            loadConfig();
            break;
        default:
            console.error(`Unknown command: ${cmd}. Available commands: write-types, load-config`);
            process.exit(1);

    }

}
