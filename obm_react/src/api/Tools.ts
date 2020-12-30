import {
    Operation, ReadonlyApiDescriptor, ReadonlyApi, ApiWithIdDescriptor, UpdatableApiWithId, ReadonlyApiWithId
} from './Types';


export function createReadonlyApi<DATA>(
    descriptor: ReadonlyApiDescriptor
): ReadonlyApi<DATA> {

    function checkForErrors(
        response: Response, operation: Operation
    ): void {
        if ( descriptor.detectSpecialErrors !== undefined ) {
            descriptor.detectSpecialErrors(response, operation);
        }
        if (! response.ok) {
            throw new Error(
                'Failed to ' + operation + ' ' + descriptor.name + ': '
                + response.status + ' ' + response.statusText
            );
        }
    }

    async function get(): Promise<DATA> {
        let response = await(fetch(descriptor.baseUrl + '/'));
        checkForErrors(response, Operation.GET);
        return response.json();
    }

    return {...descriptor, get}
}


export function createReadonlyApiWithId<
    ID,
    ID_LIKE extends ID,
    DATA extends ID_LIKE
>(
    descriptor: ApiWithIdDescriptor<ID, ID_LIKE>
): ReadonlyApiWithId<ID, ID_LIKE, DATA> {

    function checkForErrors(
        response: Response, operation: Operation, id: ID|undefined
    ): void {
        if ( descriptor.detectSpecialErrors !== undefined ) {
            descriptor.detectSpecialErrors(response, operation, id);
        }
        if (! response.ok) {
            const what = id === undefined ? descriptor.name : descriptor.name + ' ' + id;
            throw new Error('Failed to ' + operation + ' ' + what + ': ' + response.status + ' ' + response.statusText);
        }
    }

    async function get(id: ID): Promise<DATA> {
        const url = descriptor.baseUrl + descriptor.getFetchUri(id);
        let response = await(fetch(url));
        checkForErrors(response, Operation.GET, id);
        return response.json();
    }

    return {...descriptor, get, checkForErrors};
}


export function createUpdatableApiWithId<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends ID & UPDATE & CREATE
>(
    descriptor: ApiWithIdDescriptor<ID, UPDATE>
): UpdatableApiWithId<ID, UPDATE, CREATE, DATA> {
    const readOnlyApi = createReadonlyApiWithId<ID, UPDATE, DATA>(descriptor);
    const checkForErrors = readOnlyApi.checkForErrors;

    const create: (body: CREATE) => Promise<DATA> = async (body) => {
        const response = await(
            fetch(descriptor.baseUrl + '/', {
                method:'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })
        );
        checkForErrors(response, Operation.PUT, undefined);
        return response.json();
    };

    const update: (body: UPDATE) => Promise<void> = async (body) => {
        const response = await(
            fetch(descriptor.baseUrl + '/', {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })
        );
        const id = descriptor.getIdOf(body);
        checkForErrors(response, Operation.POST, id);
    };

    const remove: (id: ID) => Promise<void> = async (id) => {
        const response = await(
            fetch(descriptor.baseUrl + '/', {
                method:'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(id),
            })
        );
        checkForErrors(response, Operation.DELETE, id);
    };

    return {...readOnlyApi, create, update, remove};
}
