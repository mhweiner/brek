import {loadConfFile} from './loadConfFile';

export function loadConfFromFiles(p: {
    environment?: string
    deployment?: string
    user?: string
}): {
        Default: Record<string, any>
        environment: Record<string, any>
        deployment: Record<string, any>
        user: Record<string, any>
    } {

    return {
        Default: loadConfFile(['default.json']),
        environment: p.environment ? loadConfFile(['environments', `${p.environment}.json`]) : {},
        deployment: p.deployment ? loadConfFile(['deployments', `${p.deployment}.json`]) : {},
        user: p.user ? loadConfFile(['users', `${p.user}.json`]) : {},
    };

}
