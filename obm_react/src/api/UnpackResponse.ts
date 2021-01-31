import {logResponseJson, logResponseMeta, logResponseText} from "../common/ApiLogs";
import {isError, Result} from "../common/Result";

export interface UnpackedResponse{
    ok: boolean,
    status: number,
    statusText: string,
    detail?: string,
    json: any,
}

interface Detail {
    detail?: string;
}

export class ApiError extends Error {}

export async function unpackResponse(response: Response): Promise<UnpackedResponse> {
    logResponseMeta(response);
    const text: string = await response.text();
    logResponseText(text);
    const json: any = JSON.parse(text);
    logResponseJson(json);
    const jsonAsDetail: Detail = json;
    return  {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        detail: jsonAsDetail?.detail ?? undefined,
        json,
    };
}

export async function unpackCheckedResponse(
    response: Response,
    context?: any,
    errorhandler?: (r: UnpackedResponse, context?: any) => Result<void>
): Promise<UnpackedResponse> {
    const unpackedResponse = await unpackResponse(response);
    if ( unpackedResponse.ok ) {
        return unpackedResponse;
    }
    if ( errorhandler ) {
        const result = errorhandler(unpackedResponse, context);
        if ( isError(result) ) {
            return Promise.reject(result);
        }
    }

    let message = response.status + ' ' + response.statusText;
    try {
        if (unpackedResponse?.detail !== undefined) {
            message += ' - ' + unpackedResponse.detail;
        }
    }
    catch (e) {}
    if ( context !== undefined ) {
        message = 'Failed to ' + context.toString() + ': ' + message;
    }
    return Promise.reject(new ApiError(message));
}
