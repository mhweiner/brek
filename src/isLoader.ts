/**
 * Check if the given object is a loader. An object is considered a loader if it has
 * only one key, which is wrapped in square brackets.
 */
export function isLoader(prop: {[key: string]: object}): boolean {

    const keys = Object.keys(prop);

    return keys.length === 1 && /^\[.*\]$/.test(keys[0]);

}
