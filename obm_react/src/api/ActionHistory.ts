import {
    TokenAction,
    BattleMapId,
    AllTokenStatesResponse,
    ActionHistory,
    ActionHistoryId,
    Operation,
    TokenActionHistoryExpired,
    PostPointerActionRequest
} from './Types';
import {createReadonlyApiWithId, createWriteOnlyApi} from "./Tools";
import {UnpackedResponse, unpackCheckedResponse} from "./UnpackResponse";
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


export const pointerActionApi = createWriteOnlyApi<PostPointerActionRequest>({
    name: 'Pointer Action',
    baseUrl: '/api/action_history/log_pointer_action',
});


export async function getAllTokens(battleMapId: BattleMapId): Promise<AllTokenStatesResponse> {
    const url = '/api/action_history/all_tokens/' + battleMapId.map_set_uuid + '/' + battleMapId.uuid;
    const response = await fetch(url, {method:'GET'});
    logRequest("GET: " + url);
    const unpackedResponse = await unpackCheckedResponse(response);
    return unpackedResponse.json
}


function detectSpecialErrors(response: UnpackedResponse, _operation: Operation, _id: ActionHistoryId|undefined): void {
    if ( response.status === 410 ) {
        throw new TokenActionHistoryExpired();
    }
}


export const actionHistoryApi = createReadonlyApiWithId<ActionHistoryId, ActionHistory, ActionHistory>({
    name: 'Action History',
    baseUrl: '/api/action_history/log',
    isIdOf: (id: ActionHistoryId, idLike: ActionHistoryId) =>
        id.uuid === idLike.uuid && id.map_set_uuid === idLike.map_set_uuid,
    getIdOf: (idLike: ActionHistory) => {
        return {uuid: idLike.uuid, map_set_uuid: idLike.map_set_uuid, since: idLike.last_action_index + 1};
    },
    getFetchUri: (id: ActionHistoryId) => '/' + id.map_set_uuid + '/' + id.uuid + '/' + id.since,
    detectSpecialErrors,
});
