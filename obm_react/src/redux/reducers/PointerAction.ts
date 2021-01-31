import {pointerActionApi} from '../../api/ActionHistory';
import {RootState} from '../Types';
import {createPushSyncReducer, ImpossibleMerge} from '../ReduxTools';
import {Coordinate, OFF_MAP_POSITION, PostPointerActionRequest} from "../../api/Types";
import {Result} from "../../common/Result";


function getDataFromUpdate(position: Coordinate, state: RootState): PostPointerActionRequest {
    return {
        map_set_uuid: state.battleMap.map_set_uuid,
        battle_map_uuid: state.battleMap.uuid,
        color: state.mouse.pointerColor ?? 'Black',
        uuid: state.mouse.pointerUuid ?? 'x',
        position
    };
}


function merge(a: PostPointerActionRequest, b: PostPointerActionRequest): Result<PostPointerActionRequest> {
    if (
        a.map_set_uuid !== b.map_set_uuid
        || a.battle_map_uuid !== b.battle_map_uuid
        || a.uuid !== b.uuid
    ) {
        return new ImpossibleMerge();
    }
    return b;
}


function isSame(a: PostPointerActionRequest | null, b: PostPointerActionRequest | null): boolean {
    if ( a === b ) {
        return true;
    }
    return a?.map_set_uuid === b?.map_set_uuid
        && a?.battle_map_uuid === b?.battle_map_uuid
        && a?.uuid === b?.uuid
        && a?.position.x === b?.position.x
        && a?.position.y === b?.position.y;
}


const setup = createPushSyncReducer({
    name: 'pointerAction',
    syncPeriodInMs: 20,
    api: pointerActionApi,
    getInitialState: async () => null,
    getMyOwnState: (state: RootState) => state.pointerAction,
    getFlushData: (state: RootState) => getDataFromUpdate(OFF_MAP_POSITION, state),
    getDataFromUpdate,
    merge,
    isSame,
});

export const pointerActionActions = setup.actions;
export default setup.reducer;
