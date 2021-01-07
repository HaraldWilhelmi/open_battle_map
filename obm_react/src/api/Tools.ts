import {
    ApiWithIdDescriptor,
    Operation,
    ReadonlyApi,
    ReadonlyApiDescriptor,
    ReadonlyApiWithId,
    UpdatableApiWithId
} from './Types';
import {unpackCheckedResponse, UnpackedResponse} from "./UnpackResponse";


export function createReadonlyApi<DATA>(
    descriptor: ReadonlyApiDescriptor
): ReadonlyApi<DATA> {

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

    async function get(): Promise<DATA> {
        const response = await myCheckedUnpack(
            await fetch(descriptor.baseUrl + '/'),
            Operation.GET
        );
        return response.json;
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
        const response = await myCheckedUnpack(
            await fetch(url),
            Operation.GET,
            id
        );
        return response.json;
    }

    return {...descriptor, get, myCheckedUnpack};
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
    const myCheckedUnpack = readOnlyApi.myCheckedUnpack;

    const create: (body: CREATE) => Promise<DATA> = async (body) => {
        const response = await myCheckedUnpack(
            await fetch(descriptor.baseUrl + '/', {
                method:'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            }),
            Operation.PUT,
            undefined
        );
        return response.json;
    };

    const update: (body: UPDATE) => Promise<void> = async (body) => {
        await myCheckedUnpack(
            await fetch(descriptor.baseUrl + '/', {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            }),
            Operation.POST,
            descriptor.getIdOf(body)
        );
    };

    const remove: (id: ID) => Promise<void> = async (id) => {
        await myCheckedUnpack(
            await fetch(descriptor.baseUrl + '/', {
                method:'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(id),
            }),
            Operation.DELETE,
            id
        );
    };

    return {...readOnlyApi, create, update, remove};
}
