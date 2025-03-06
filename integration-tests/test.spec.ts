import {test} from 'hoare';
import {writeTypeDef} from '../src/writeTypeDef';
import {getConfig} from '../src';
import {readFileSync} from 'node:fs';

test('write spec file in tmp folder and read it successfully with correct contents', (assert) => {

    writeTypeDef();

    // read the file and check the contents
    const configFileContents = readFileSync('/tmp/config.json', 'utf-8');

    assert.equal(configFileContents, '{"foo":"bar"}');

});

test('load config correctly', (assert) => {

    const config = getConfig();

    assert.equal(config, 'poop');

    // read the file and check the contents
    const configFileContents = readFileSync('/tmp/config.json', 'utf-8');

    assert.equal(configFileContents, '{"foo":"bar"}');

});
