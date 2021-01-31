import {
    TokenAction,
    BattleMapId,
    AllTokenStatesResponse,
    ActionHistory,
    ActionHistoryId,
    TokenActionHistoryExpired,
} from './Types';
import {createReadOnlyApi, createWriteOnlyApi} from "./ApiTools";
import {unpackCheckedResponse} from "./UnpackResponse";
import {logRequest} from "../common/ApiLogs";


interface PostTokenActionRequest extends TokenAction {
    map_set_uuid: string,
    battle_map_uuid: string,
}


export async function postTokenAction(battleMapId: BattleMapId, action: TokenAction) {
    const putRequest: PostTokenActionRequest = {...action,
        map_set_uuid: battleMapId.map_set_uuid,
        battle_map_uuid: battleMapId.uuid,
    };
    const url = '/api/action_history/log_token_action';
    const body = JSON.stringify(putRequest);
    const response = await fetch(url, {
        method:'PUT',
        headers: {'Content-Type': 'application/json'},
        body,
    });
    logRequest("PUT: " + url + " - " + body);
    await unpackCheckedResponse(response);
}


export const pointerActionApi = createWriteOnlyApi({
    name: 'Pointer Action',
    baseUrl: '/api/action_history/log_pointer_action',
    getContextOf: () => undefined,
});


export async function getAllTokens(battleMapId: BattleMapId): Promise<AllTokenStatesResponse> {
    const url = '/api/action_history/all_tokens/' + battleMapId.map_set_uuid + '/' + battleMapId.uuid;
    const response = await fetch(url, {method:'GET'});
    logRequest("GET: " + url);
    const unpackedResponse = await unpackCheckedResponse(response);
    return unpackedResponse.json
}


export const actionHistoryApi = createReadOnlyApi<ActionHistory, ActionHistoryId>({
    name: 'Action History',
    baseUrl: '/api/action_history/log',

    matchesContextOf: (id, data) =>
        id.uuid === data.uuid && id.map_set_uuid === data.map_set_uuid,
    getContextOf: (data) =>
        ({uuid: data.uuid, map_set_uuid: data.map_set_uuid, since: data.last_action_index + 1}),
    getFetchUri: (id: ActionHistoryId) =>
        '/' + id.map_set_uuid + '/' + id.uuid + '/' + id.since,
    detectSpecialErrors: (response, _operation, _id) => {
        if (response.status === 410) {
            return new TokenActionHistoryExpired();
        }
    }
});
