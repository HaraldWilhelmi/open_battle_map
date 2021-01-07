import {
    TokenAction,
    BattleMapId,
    AllTokenStatesResponse,
    TokenActionHistory,
    TokenActionHistoryId,
    Operation,
    TokenActionHistoryExpired
} from './Types';
import {GenericDispatch} from '../redux/Types';
import {createReadonlyApiWithId} from "./Tools";
import {UnpackedResponse, unpackCheckedResponse} from "./UnpackResponse";


interface Request extends TokenAction {
    map_set_uuid: string,
    battle_map_uuid: string,
}


export async function postTokenAction(battleMapId: BattleMapId, action: TokenAction) {
    const body: Request = {...action,
        map_set_uuid: battleMapId.map_set_uuid,
        battle_map_uuid: battleMapId.uuid,
    };
    await unpackCheckedResponse(
        await fetch('/api/token/action', {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    )
}

export async function getAllTokens(battleMapId: BattleMapId, dispatch: GenericDispatch): Promise<AllTokenStatesResponse> {
    const url = '/api/token/all/' + battleMapId.map_set_uuid + '/' + battleMapId.uuid;
    const response = await unpackCheckedResponse(
        await fetch(url, {method:'GET'})
    )
    return response.json
}


function detectSpecialErrors(response: UnpackedResponse, _operation: Operation, _id: TokenActionHistoryId|undefined): void {
    if ( response.status === 410 ) {
        throw new TokenActionHistoryExpired();
    }
}


export const tokenActionHistoryApi = createReadonlyApiWithId<TokenActionHistoryId, TokenActionHistory, TokenActionHistory>({
    name: 'Token Action History',
    baseUrl: '/api/token/history',
    isIdOf: (id: TokenActionHistoryId, idLike: TokenActionHistoryId) =>
        id.uuid === idLike.uuid && id.map_set_uuid === idLike.map_set_uuid,
    getIdOf: (idLike: TokenActionHistory) => {
        return {uuid: idLike.uuid, map_set_uuid: idLike.map_set_uuid, since: idLike.last_action_index + 1};
    },
    getFetchUri: (id: TokenActionHistoryId) => '/' + id.map_set_uuid + '/' + id.uuid + '/' + id.since,
    detectSpecialErrors,
});
