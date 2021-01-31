import {unpackCheckedResponse, UnpackedResponse} from "./UnpackResponse";
import {logRequest} from "../common/ApiLogs";
import {isError, Result} from "../common/Result";

export enum Operation {
    GET = 'fetch',
    PUT = 'create',
    POST = 'update',
    DELETE = 'delete',
}

export interface GenericApiDescriptor<DATA, CONTEXT> {
    name: string,
    baseUrl: string,
    getContextOf(data: DATA): CONTEXT,
}

export interface ReadOnlyApiDescriptor<DATA, CONTEXT> extends GenericApiDescriptor<DATA, CONTEXT>{
    matchesContextOf(context: CONTEXT, data: DATA): boolean,
    getFetchUri(context: CONTEXT): string,
    detectSpecialErrors?(response: UnpackedResponse, operation: Operation, context: CONTEXT | undefined): Result<void>,
}

export interface ReadOnlyApi<DATA, CONTEXT>
    extends ReadOnlyApiDescriptor<DATA, CONTEXT>
{
    myCheckedUnpack(response: Response, operation: Operation, context: CONTEXT|undefined): Promise<UnpackedResponse>,
    get(context: CONTEXT): Promise<DATA>,
}

export interface UpdatableApiDescriptor<DATA, CONTEXT> extends ReadOnlyApiDescriptor<DATA, CONTEXT>{
    getUpdateRequestBody?(data: DATA): string,
}

export interface UpdatableApi<DATA, CONTEXT, CREATE>
    extends ReadOnlyApi<DATA, CONTEXT>
{
    create(createRequest: CREATE): Promise<DATA>,
    update(updateRequest: DATA): Promise<void>,
    remove(contextRequest: CONTEXT): Promise<void>,
}

export interface WriteOnlyApi<DATA, CONTEXT> extends GenericApiDescriptor<DATA, CONTEXT> {
    create(data: DATA): Promise<void>,
}


export function createReadOnlyApi<DATA, CONTEXT>(
    descriptor: ReadOnlyApiDescriptor<DATA, CONTEXT>
): ReadOnlyApi<DATA, CONTEXT> {
    async function myCheckedUnpack(
        response: Response, operation: Operation, context: CONTEXT|undefined
    ): Promise<UnpackedResponse> {
        const errorHandler = (unpackedResponse: UnpackedResponse, context: CONTEXT) => {
            if ( descriptor.detectSpecialErrors ) {
              const result = descriptor.detectSpecialErrors(unpackedResponse, operation, context);
              if ( isError(result) ) {
                  return result;
              }
            }
        };
        return unpackCheckedResponse(response, context, errorHandler);
    }

    async function get(context: CONTEXT): Promise<DATA> {
        const url = descriptor.baseUrl + descriptor.getFetchUri(context);
        const response = await fetch(url);
        logRequest("GET: " + url);
        const unpackedResponse = await myCheckedUnpack(
            response,
            Operation.GET,
            context
        );
        return unpackedResponse.json;
    }

    return {...descriptor, get, myCheckedUnpack};
}


export function createUpdatableApi<DATA, CONTEXT, CREATE>(
    descriptor: UpdatableApiDescriptor<DATA, CONTEXT>
): UpdatableApi<DATA, CONTEXT, CREATE> {
    const readOnlyApi = createReadOnlyApi<DATA, CONTEXT>(descriptor);
    const myCheckedUnpack = readOnlyApi.myCheckedUnpack;

    async function create(createRequest: CREATE): Promise<DATA> {
        const url = descriptor.baseUrl + '/';
        const body = JSON.stringify(createRequest);
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
    }

    async function update(data: DATA): Promise<void> {
        const url = descriptor.baseUrl + '/';
        const body = descriptor.getUpdateRequestBody ? descriptor.getUpdateRequestBody(data) : JSON.stringify(data);
        const response = await fetch(descriptor.baseUrl + '/', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body,
        });
        logRequest("POST: " + url + " - " + body);
        await myCheckedUnpack(
            response,
            Operation.POST,
            descriptor.getContextOf(data),
        );
    }

    async function remove(context: CONTEXT): Promise<void> {
        const url = descriptor.baseUrl + '/';
        const body = JSON.stringify(context);
        const response = await fetch(descriptor.baseUrl + '/', {
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body,
        });
        logRequest("DELETE: " + url + " - " + body);
        await myCheckedUnpack(
            response,
            Operation.DELETE,
            context,
        );
    }

    return {...readOnlyApi, create, update, remove};
}


export function createWriteOnlyApi<DATA, CONTEXT>(
    descriptor: GenericApiDescriptor<DATA, CONTEXT>
): WriteOnlyApi<DATA, CONTEXT> {
    async function create(data: DATA): Promise<void> {
        const url = descriptor.baseUrl;
        const body = JSON.stringify(data);
        const response = await fetch(url, {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body
        });
        logRequest("PUT: " + url + " - " + body);
        await unpackCheckedResponse(
            response,
            undefined,
            undefined,
        );
    }

    return {...descriptor, create};
}
