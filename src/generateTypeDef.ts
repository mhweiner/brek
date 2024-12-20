// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const indent = (depth: number) => Array(depth * 4).fill(' ').join('');

// TODO: If loaders are present, they will be inferred as string.

/**
 * Generate a TypeScript type definition file for the given configuration object.
 */
export function generateTypeDef(config: Record<string, any>): string {

    return `
import {Conf} from "brek";
declare module "brek" {
    export interface Conf {
${props(config)}
    }
}`;

}

export function props(obj: {[key: string]: any}, depth: number = 2): string {

    return Object.keys(obj).map((key) => {

        switch (typeof obj[key]) {

            case 'object':

                if (Array.isArray(obj[key])) {

                    const type = typeof obj[key][0];

                    return `${indent(depth)}'${key}': ${type === 'undefined' ? 'any' : type}[]`;

                } else {

                    return `${indent(depth)}'${key}': {\n${props(obj[key], depth + 1)}\n${indent(depth)}}`;

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
