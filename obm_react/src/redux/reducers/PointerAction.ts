import {pointerActionApi} from '../../api/ActionHistory';
import {RootState} from '../Types';
import {createPushSyncReducer, ImpossibleMerge} from '../Tools';
import {Coordinate, PostPointerActionRequest} from "../../api/Types";


function getDataFromUpdate(position: Coordinate, state: RootState): PostPointerActionRequest {
    return {
        map_set_uuid: state.battleMap.map_set_uuid,
        battle_map_uuid: state.battleMap.uuid,
        color: state.mouse.pointerColor ?? 'Black',
        uuid: state.mouse.pointerUuid ?? 'x',
        position
    };
}


function merge(a: PostPointerActionRequest, b: PostPointerActionRequest): PostPointerActionRequest {
    if (
        a.map_set_uuid !== b.map_set_uuid
        || a.battle_map_uuid !== b.battle_map_uuid
        || a.uuid !== b.uuid
    ) {
        throw new ImpossibleMerge();
    }
    return b;
}


const setup = createPushSyncReducer<PostPointerActionRequest, Coordinate>({
    name: 'pointerAction',
    api: pointerActionApi,
    getMyOwnState: (state: RootState) => state.pointerAction,
    syncPeriodInMs: 20,
    getDataFromUpdate,
    merge,
});

export const pointerActionActions = setup.actions;
export default setup.reducer;
