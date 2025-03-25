import {test} from 'hoare';
import {resolveConf} from './resolveConf';

test('if no loaders or environment variables present, should return same result back', async (assert) => {

    // given
    const unresolvedConfig = {foo: 'bar', arr: [1, 2, 3], obj: {a: 1, b: 2}};

    // when
    const output = await resolveConf(unresolvedConfig, {});

    // then
    assert.equal(output, unresolvedConfig);

});
test('should resolve environment variable', async (assert) => {

    // given
    process.env.FOO = 'bar123!';

    const unresolvedConfig = {
        foo: '${FOO}',
        obj: {
            a: '${FOO}',
            b: {
                c: '${FOO}',
            },
        },
    };
    const expected = {
        foo: 'bar123!',
        obj: {
            a: 'bar123!',
            b: {
                c: 'bar123!',
            },
        },
    };

    // when
    const output = await resolveConf(unresolvedConfig, {});

    // then
    assert.equal(output, expected);

});
test('config with a loader should resolve', async (assert) => {

    // given
    const loaders = {
        foo: (arg: {a: string}): string => `foo_${arg.a}`,
        bar: (arg: string): string => `bar_${arg}`,
    };
    const unresolvedConfig = {
        a: {
            '[foo]': {
                a: '123',
            },
        },
        b: {
            a: {
                '[bar]': '321',
            },
        },
    };
    const expected = {
        a: 'foo_123',
        b: {
            a: 'bar_321',
        },
    };

    // when
    const output = await resolveConf(unresolvedConfig, loaders);

    // then
    assert.equal(output, expected);

});
