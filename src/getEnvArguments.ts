import {getEnvOverrides} from './getEnvOverrides';

export function getEnvArguments(): {
    environment: string
    deployment: string
    user: string
    overrides: Record<string, any>
} {

    return {
        environment: process.env.ENVIRONMENT || process.env.NODE_ENV || '',
        deployment: process.env.DEPLOYMENT || '',
        user: process.env.USER || '',
        overrides: getEnvOverrides(),
    };

}
