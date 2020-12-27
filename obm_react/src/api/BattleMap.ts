import {
    BattleMapId, BattleMapUpdate, BattleMapCreate, BattleMap, Operation,
    BattleMapNotFound,
} from './Types';
import {createUpdatableApiWithId} from './Tools';


function detectSpecialErrors(response: Response, _op: Operation, _id: BattleMapId|undefined) {
    if ( response.status === 404 ) {
        throw new BattleMapNotFound();
    }
}


export const battleMapApi = createUpdatableApiWithId<BattleMapId, BattleMapUpdate, BattleMapCreate, BattleMap>({
    name: 'Background Set',
    baseUrl: '/api/battle_map',
    isIdOf: (id: BattleMapId, idLike: BattleMapId) =>
        id.uuid === idLike.uuid && id.map_set_uuid === idLike.map_set_uuid,
    getIdOf: (idLike: BattleMapId) => { return {uuid: idLike.uuid, map_set_uuid: idLike.map_set_uuid}; },
    getFetchUri: (id: BattleMapId) => '/' + id.map_set_uuid + '/' + id.uuid,
    detectSpecialErrors: detectSpecialErrors,
});

export const NO_SUCH_BATTLE_MAP: BattleMap = {
    name: '* No Background *',
    uuid: 'dummy',
    map_set_uuid: 'dummy',
    revision: 0,
};
