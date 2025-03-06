import {getConfig} from '.';
import {writeTypeDef} from './writeTypeDef';

export function runCmd(mode: string): void {

    switch (mode) {

        case 'write-types':
            writeTypeDef();
            break;
        case 'preload':
            getConfig();
            break;
        default:
            console.error(`Unknown mode: ${mode}. Available commands: write-types, preload`);
            process.exit(1);

    }

}

// Allow direct execution from command line
if (require.main === module) {

    const mode = process.argv[2] ?? 'write-types';

    runCmd(mode);

}
