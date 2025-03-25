import {test} from 'hoare';
import {mergeConfs} from './mergeConfs';

test('If only Default is given and no loaders, output should be same as default', (assert) => {

    // given
    const confs = {
        Default: {
            foo1: 'bar',
            foo2: 42,
            foo3: true,
            foo4: null,
            foo5: [1, 2, 3],
        },
    };

    // when
    const mergedConf = mergeConfs(confs);

    // then
    assert.equal(mergedConf, confs.Default);

});

// eslint-disable-next-line max-lines-per-function
test('all conf sources should be merged in correct order (no loaders) ', (assert) => {

    // given
    const confs = {
        Default: {
            foo1: 'default',
            foo2: 'default',
            foo3: 'default',
            foo4: 'default',
            foo5: 'default',
        },
        environment: {
            foo2: 'environment',
            foo3: 'environment',
            foo4: 'environment',
            foo5: 'environment',
        },
        deployment: {
            foo3: 'deployment',
            foo4: 'deployment',
            foo5: 'deployment',
        },
        user: {
            foo4: 'user',
            foo5: 'user',
        },
        overrides: {
            foo5: 'overrides',
        },
    };
    const expectedMergedConf = {
        foo1: 'default',
        foo2: 'environment',
        foo3: 'deployment',
        foo4: 'user',
        foo5: 'overrides',
    };

    // when
    const mergedConf = mergeConfs(confs);

    // then
    assert.equal(mergedConf, expectedMergedConf);

});

// eslint-disable-next-line max-lines-per-function
test('all conf sources should be merged in correct order (with loaders) ', (assert) => {

    // given
    const confs = {
        Default: {
            foo1: {
                '[foo1]': 'default',
            },
            foo2: {
                '[foo2]': 'default',
            },
            foo3: {
                '[foo3]': 'default',
            },
            foo4: {
                '[foo4]': 'default',
            },
            foo5: {
                '[foo5]': 'default',
            },
        },
        environment: {
            foo2: {
                '[foo2]': 'environment',
            },
            foo3: {
                '[foo3]': 'environment',
            },
            foo4: {
                '[foo4]': 'environment',
            },
            foo5: {
                '[foo5]': 'environment',
            },
        },
        deployment: {
            foo3: {
                '[foo3]': 'deployment',
            },
            foo4: {
                '[foo4]': 'deployment',
            },
            foo5: {
                '[foo5]': 'deployment',
            },
        },
        user: {
            foo4: {
                '[foo4]': 'user',
            },
            foo5: {
                '[foo5]': 'user',
            },
        },
        overrides: {
            foo5: {
                '[foo5]': 'overrides',
            },
        },
    };
    const expectedMergedConf = {
        foo1: {'[foo1]': 'default'},
        foo2: {'[foo2]': 'environment'},
        foo3: {'[foo3]': 'deployment'},
        foo4: {'[foo4]': 'user'},
        foo5: {'[foo5]': 'overrides'},
    };

    // when
    const mergedConf = mergeConfs(confs);

    // then
    assert.equal(mergedConf, expectedMergedConf);

});

// eslint-disable-next-line max-lines-per-function
test('properties of loaders should not be merged', (assert) => {

    // given
    const confs = {
        Default: {
            foo1: {
                '[foo1]': {
                    param1: 'default',
                    param2: 'default',
                },
            },
        },
        environment: {
            foo1: {
                '[foo1]': {
                    param1: 'environment',
                },
            },
        },
    };

    // when
    const mergedConf = mergeConfs(confs);

    // then
    assert.equal(mergedConf, confs.environment);

});

test('arrays should not be merged', (assert) => {

    // given
    const confs = {
        Default: {
            foo1: [1, 2, 3],
        },
        environment: {
            foo1: [4, 5, 6],
        },
    };

    // when
    const mergedConf = mergeConfs(confs);

    // then
    assert.equal(mergedConf, confs.environment);

});
