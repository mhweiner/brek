import {LoaderDict} from './index';

export class InvalidConf extends Error {

    validationErrors: string[];

    constructor(validationErrors: string[]) {

        super('INVALID_CONF');
        Error.captureStackTrace(this, InvalidConf);
        this.validationErrors = validationErrors;

    }

    toString(): string {

        return `${this.name}: ${this.validationErrors.join(', ')}`;

    }

}

export class ConfNotLoaded extends Error {

    constructor() {

        super('CONF_NOT_LOADED');
        Error.captureStackTrace(this, ConfNotLoaded);

    }

}

export class LoaderNotFound extends Error {

    constructor(loaderName: string, availableLoaders: LoaderDict) {

        const availArr = Object.keys(availableLoaders);
        const availStr = availArr.length ? availArr.join(', ') : 'none';
        const errMsg = `LOADER_NOT_FOUND: "${loaderName}". Available loaders: ${availStr}`;

        super(errMsg);
        Error.captureStackTrace(this, LoaderNotFound);

    }

}
