import {test} from 'hoare';
import {writeTypeDef} from '../src/writeTypeDef';
import {getConfig} from '../src';
import {readFileSync, unlinkSync} from 'node:fs';
import {resolve} from 'node:path';

test('write spec file in tmp folder and read it successfully with correct contents', (assert) => {

    writeTypeDef();

    // read the file and check the contents
    const filepath = resolve('integration-tests', 'config', 'Config.d.ts');
    const typeFileContent = readFileSync(filepath, 'utf-8');

    const expectedContents = `
import {Config} from "brek";
declare module "brek" {
    export interface Config {
        'foo': string
        'addResult': string
        'multiplyResult': string
    }
}`;

    assert.equal(typeFileContent, expectedContents);

    // cleanup by deleting the file
    unlinkSync(filepath);

});

test('load config correctly', (assert) => {

    assert.equal(getConfig(), {
        foo: 'bar',
        addResult: '11',
        multiplyResult: '25',
    });

    // cleanup, delete the config.json file
    unlinkSync(resolve(process.env.BREK_WRITE_DIR ?? 'config', 'config.json'));

});
