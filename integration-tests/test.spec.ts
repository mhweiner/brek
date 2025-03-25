import {test} from 'hoare';
import {writeTypeDef} from '../src/writeTypeDef';
import {getConfig, loadConfig} from '../src';
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
        'typeTest': {
            'array': number[]
            'boolean': boolean
            'number': number
            'string': string
            'object': {
                'key': string
            }
        }
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
        typeTest: {
            array: [1, 2, 3],
            boolean: true,
            number: 42,
            string: 'hello',
            object: {key: 'value'},
        },
    });

    // cleanup, delete the config.json file
    unlinkSync(resolve(process.env.BREK_WRITE_DIR ?? 'config', 'config.json'));

});

// write a test taht does the same as above but checks the output of the config.json file
test('write config.json file and read it successfully with correct contents', async (assert) => {

    // given
    const expectedContents = {
        foo: 'bar',
        addResult: '11',
        multiplyResult: '25',
        typeTest: {
            array: [1, 2, 3],
            boolean: true,
            number: 42,
            string: 'hello',
            object: {key: 'value'},
        },
    };

    // when
    await loadConfig();

    // read the file and check the contents
    const filepath = resolve(process.env.BREK_WRITE_DIR ?? 'config', 'config.json');
    const configFileContent = readFileSync(filepath, 'utf-8');

    // then
    assert.equal(JSON.parse(configFileContent), expectedContents);

    // cleanup by deleting the file
    unlinkSync(filepath);

});
