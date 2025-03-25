/* eslint-disable max-lines-per-function */
import {test} from 'hoare';
import {generateTypeDef, props} from './generateTypeDef';

test('generateTypeDef with a flat configuration object', (assert) => {

    const config = {
        foo: 'bar',
        count: 42,
        isEnabled: true,
    };

    const result = generateTypeDef(config);
    const expected = `
import {Config} from "brek";
declare module "brek" {
    export interface Config {
        'foo': string
        'count': number
        'isEnabled': boolean
    }
}`;

    assert.equal(result, expected, 'Should generate TypeScript type definitions for a flat configuration object.');

});

test('generateTypeDef with a nested configuration object', (assert) => {

    const config = {
        database: {
            host: 'localhost',
            port: 5432,
            credentials: {
                username: 'user',
                password: 'pass',
            },
        },
        features: {
            darkMode: true,
            experiments: ['feature1', 'feature2'],
        },
    };

    const result = generateTypeDef(config);
    const expected = `
import {Config} from "brek";
declare module "brek" {
    export interface Config {
        'database': {
            'host': string
            'port': number
            'credentials': {
                'username': string
                'password': string
            }
        }
        'features': {
            'darkMode': boolean
            'experiments': string[]
        }
    }
}`;

    assert.equal(result, expected, 'Should generate TypeScript type definitions for a nested configuration object.');

});

test('generateTypeDef infers \'string\' for loader values', (assert) => {

    const config = {
        mongoDb: {
            '[fetchSecret]': {
                key: 'MONGODB_URI',
            },
        },
    };

    const result = generateTypeDef(config);
    const expected = `
import {Config} from "brek";
declare module "brek" {
    export interface Config {
        'mongoDb': string
    }
}`;

    assert.equal(result, expected, 'Should infer \'string\' for loader values.');

});

test('props function handles arrays correctly', (assert) => {

    const obj = {
        list: ['item1', 'item2'],
    };

    const result = props(obj);
    const expected = '        \'list\': string[]';

    assert.equal(result, expected, 'Should handle arrays correctly.');

});

test('props function handles mixed types in nested objects', (assert) => {

    const obj = {
        nested: {
            flag: true,
            count: 42,
            text: 'hello',
        },
    };

    const result = props(obj);
    const expected = '        \'nested\': {\n            \'flag\': boolean\n            \'count\': number\n            \'text\': string\n        }';

    assert.equal(result, expected, 'Should handle mixed types in nested objects.');

});
