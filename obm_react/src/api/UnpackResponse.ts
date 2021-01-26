import {logResponseJson, logResponseMeta} from "../common/ApiLogs";

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
    const json: any = response.json();
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
    errorhandler?: (r: UnpackedResponse, context?: any) => void
): Promise<UnpackedResponse> {
    const unpackedResponse = await unpackResponse(response);
    if ( unpackedResponse.ok ) {
        return unpackedResponse;
    } else {
        if ( errorhandler !== undefined ) {
            errorhandler(unpackedResponse, context);
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
}
