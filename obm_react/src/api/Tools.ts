import {
    GenericApiWithIdDescriptor,
    Operation,
    ReadonlyApi,
    GenericApiWithoutIdDescriptor,
    ReadonlyApiWithId,
    UpdatableApiWithId, GenericApiWithoutId, WriteOnlyApi
} from './Types';
import {unpackCheckedResponse, UnpackedResponse} from "./UnpackResponse";
import {logRequest} from "../common/ApiLogs";


function createGenericApiWithoutId(
    descriptor: GenericApiWithoutIdDescriptor
): GenericApiWithoutId {
    async function myCheckedUnpack(
        response: Response, operation: Operation
    ): Promise<UnpackedResponse> {
        const context = operation + ' ' + descriptor.name;
        const errorHandler = (r: UnpackedResponse, context: any) => {
              if ( descriptor.detectSpecialErrors !== undefined ) {
                  descriptor.detectSpecialErrors(r, context);
              }
        };
        return unpackCheckedResponse(response, context, errorHandler);
    }

    return {...descriptor, myCheckedUnpack};
}


export function createReadonlyApi<DATA>(
    descriptor: GenericApiWithoutIdDescriptor
): ReadonlyApi<DATA> {
    let api = createGenericApiWithoutId(descriptor);

    async function get(): Promise<DATA> {
        const url = descriptor.baseUrl + '/';
        const response = await fetch(url);
        logRequest("GET: " + url);
        const unpackedResponse = await api.myCheckedUnpack(response, Operation.GET);
        return unpackedResponse.json;
    }

    return {...api, get};
}


export function createWriteOnlyApi<CREATE>(
    descriptor: GenericApiWithoutIdDescriptor
): WriteOnlyApi<CREATE> {
    let api = createGenericApiWithoutId(descriptor);

    async function create(data: CREATE): Promise<void> {
        const url = descriptor.baseUrl;
        const body = JSON.stringify(data);
        const response = await fetch(url, {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body
        });
        logRequest("PUT: " + url + " - " + body);
        await api.myCheckedUnpack(
            response,
            Operation.PUT
        );
    }

    return {...api, create};
}


export function createReadonlyApiWithId<
    ID,
    ID_LIKE extends ID,
    DATA extends ID_LIKE
>(
    descriptor: GenericApiWithIdDescriptor<ID, ID_LIKE>
): ReadonlyApiWithId<ID, ID_LIKE, DATA> {
    async function myCheckedUnpack(
        response: Response, operation: Operation, id: ID|undefined
    ): Promise<UnpackedResponse> {
        const context = operation + ' ' + descriptor.name;
        const errorHandler = (r: UnpackedResponse, context: any) => {
              if ( descriptor.detectSpecialErrors !== undefined ) {
                  descriptor.detectSpecialErrors(r, context ,id);
              }
        };
        return unpackCheckedResponse(response, context, errorHandler);
    }

    async function get(id: ID): Promise<DATA> {
        const url = descriptor.baseUrl + descriptor.getFetchUri(id);
        const response = await fetch(url);
        logRequest("GET: " + url);
        const unpackedResponse = await myCheckedUnpack(
            response,
            Operation.GET,
            id
        );
        return unpackedResponse.json;
    }

    return {...descriptor, get, myCheckedUnpack};
}


export function createUpdatableApiWithId<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends ID & UPDATE & CREATE
>(
    descriptor: GenericApiWithIdDescriptor<ID, UPDATE>
): UpdatableApiWithId<ID, UPDATE, CREATE, DATA> {
    const readOnlyApi = createReadonlyApiWithId<ID, UPDATE, DATA>(descriptor);
    const myCheckedUnpack = readOnlyApi.myCheckedUnpack;

    const create: (body: CREATE) => Promise<DATA> = async (create) => {
        const url = descriptor.baseUrl + '/';
        const body = JSON.stringify(create);
        const response = await fetch(url, {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body
        });
        logRequest("PUT: " + url + " - " + body);
        const unpackedResponse = await myCheckedUnpack(
            response,
            Operation.PUT,
            undefined
        );
        return unpackedResponse.json;
    };

    const update: (body: UPDATE) => Promise<void> = async (update) => {
        const url = descriptor.baseUrl + '/';
        const body = JSON.stringify(update);
        const response = await fetch(descriptor.baseUrl + '/', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        });
        logRequest("POST: " + url + " - " + body);
        await myCheckedUnpack(
            response,
            Operation.POST,
            descriptor.getIdOf(update)
        );
    };

    const remove: (id: ID) => Promise<void> = async (id) => {
        const url = descriptor.baseUrl + '/';
        const body = JSON.stringify(id);
        const response = await fetch(descriptor.baseUrl + '/', {
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body,
        });
        logRequest("DELETE: " + url + " - " + body);
        await myCheckedUnpack(
            response,
            Operation.DELETE,
            id
        );
    };

    return {...readOnlyApi, create, update, remove};
}
