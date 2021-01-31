import {BattleMapId, BattleMapUpdate, BattleMapCreate, BattleMap, BattleMapNotFound} from './Types';
import {createUpdatableApi, Operation} from './ApiTools';
import {UnpackedResponse} from "./UnpackResponse";
import {Result} from "../common/Result";


function detectSpecialErrors(response: UnpackedResponse, _op: Operation, _id: BattleMapId|undefined): Result<void> {
    if ( response.status === 404 ) {
        return new BattleMapNotFound();
    }
}

function getUpdateRequestBody(battleMap: BattleMap): string {
    const request: BattleMapUpdate = {...battleMap};
    return JSON.stringify(request);
}


export const battleMapApi = createUpdatableApi<BattleMap, BattleMapId, BattleMapCreate>({
    name: 'Battle Map',
    baseUrl: '/api/battle_map',
    matchesContextOf: (id: BattleMapId, idLike: BattleMapId) =>
        id.uuid === idLike.uuid && id.map_set_uuid === idLike.map_set_uuid,
    getContextOf: (idLike: BattleMapId) => { return {uuid: idLike.uuid, map_set_uuid: idLike.map_set_uuid}; },
    getFetchUri: (id: BattleMapId) => '/' + id.map_set_uuid + '/' + id.uuid,
    detectSpecialErrors,
    getUpdateRequestBody,
});

export const NO_SUCH_BATTLE_MAP: BattleMap = {
    name: '* No Battle Map *',
    uuid: 'dummy',
    map_set_uuid: 'dummy',
    revision: 0,
    action_count: 0,
    background_pixels_per_meter: 100,
};
