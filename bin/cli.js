#!/usr/bin/env node

const cmd = process.argv[2];

switch (cmd) {

    case 'load':
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        require('../dist/index').loadConf().then(() => console.log('Brek: Config loaded and written to conf.json'));
        break;
    default:
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        require('../dist/writeTypeDef').writeTypeDef();
        break;

}
