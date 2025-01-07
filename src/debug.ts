export function debug(...args: any[]): void {

    if (process.env.LAMBDACONF_DEBUG || process.env.BREK_DEBUG) {

        console.log('[BREK][DEBUG]', ...args);

    }

}
