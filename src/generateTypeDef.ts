import {isLoader} from './isLoader';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const indent = (depth: number) => Array(depth * 4).fill(' ').join('');

/**
 * Generate a TypeScript type definition file for the given configuration object.
 * If loaders are present, they will be inferred as string.
 */
export function generateTypeDef(config: Record<string, any>): string {

    return `
import {Config} from "brek";
declare module "brek" {
    export interface Config {
${props(config)}
    }
}`;

}

export function props(obj: {[key: string]: any}, depth: number = 2): string {

    return Object.keys(obj).map((key) => {

        const value = obj[key];

        switch (typeof value) {

            case 'object':

                if (Array.isArray(value)) {

                    const type = typeof value[0];

                    return `${indent(depth)}'${key}': ${type === 'undefined' ? 'any' : type}[]`;

                } else if (isLoader(value)) {

                    return `${indent(depth)}'${key}': string`;

                } else {

                    return `${indent(depth)}'${key}': {\n${props(value, depth + 1)}\n${indent(depth)}}`;

                }


            case 'boolean':

                return `${indent(depth)}'${key}': boolean`;

            case 'number':

                return `${indent(depth)}'${key}': number`;

            default:

                return `${indent(depth)}'${key}': string`;

        }

    }).join('\n');

}
