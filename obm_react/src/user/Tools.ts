import {ReduxDispatch} from '../redux/Store';
import {handleResponse} from '../common/Tools';
import {setSelectedMapSet, MapSet, NO_SUCH_MAP_SET} from '../redux/SelectedMapSet';
import {setSelectedBattleMap, BattleMap, NO_SUCH_BATTLE_MAP} from '../redux/SelectedBattleMap';
import {reportError} from '../redux/Messages';


export async function fetchMapSet(dispatch: ReduxDispatch, uuid: string): Promise<MapSet> {
    let response = await(
        fetch('/api/map_set/' + uuid)
    );
    if (response.ok) {
        return await(response.json());
    } else {
        if (response.status === 404) {
            dispatch(reportError('Map Set not found!'));
        } else {
            handleResponse(dispatch, response, '', false);
        }
        return NO_SUCH_MAP_SET;
    }
}

export async function updateSelectedBattleMap(dispatch: ReduxDispatch, mapSetUuid: string, battleMapUuid: string | undefined) {
    if ( battleMapUuid === undefined || battleMapUuid === NO_SUCH_BATTLE_MAP.uuid ) {
        dispatch(setSelectedBattleMap(NO_SUCH_BATTLE_MAP));
        return;
    }
    let response = await(
        fetch('/api/battle_map/' + mapSetUuid + '/' + battleMapUuid)
    );
    if (response.ok) {
        let battleMap: BattleMap = await(response.json());
        dispatch(setSelectedBattleMap(battleMap));
    } else {
        dispatch(setSelectedBattleMap(NO_SUCH_BATTLE_MAP));
        if (response.status === 404) {
            dispatch(reportError('Battle Map not found!'));
        } else {
            handleResponse(dispatch, response, '', false);
        }
    }
}
