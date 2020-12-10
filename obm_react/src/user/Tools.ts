import {ReduxDispatch} from '../redux/Store';
import {setSelectedMapSet, NO_SUCH_MAP_SET, MapSet} from '../redux/SelectedMapSet';
import {setSelectedBattleMap, NO_SUCH_BATTLE_MAP, BattleMap} from '../redux/SelectedBattleMap';
import {resetMessages} from '../redux/Messages';
import {setMode, Mode} from '../redux/Mode';
import {fetchMapSet} from './api/MapSet';
import {fetchBattleMap} from './api/BattleMap';


export async function switchMapSet(
    dispatch: ReduxDispatch, uuid: string
): Promise<void> {
    let mapSet: MapSet | undefined = NO_SUCH_MAP_SET;
    if ( uuid.length > 10 ) {
         mapSet = await fetchMapSet(dispatch, uuid);
         if ( mapSet === undefined ) {
            return;
         }
    }
    dispatch(setSelectedMapSet(mapSet));
    let battleMapUuid: string | undefined = undefined;
    if ( mapSet.battle_maps.length > 0 ) {
        battleMapUuid = mapSet.battle_maps[0].uuid;
    }
    updateSelectedBattleMap(dispatch, mapSet.uuid, battleMapUuid);
}

export async function updateSelectedBattleMap(
    dispatch: ReduxDispatch, mapSetUuid: string, battleMapUuid: string | undefined
): Promise<void> {
    let battleMap: BattleMap | undefined = NO_SUCH_BATTLE_MAP;
    if ( battleMapUuid !== undefined && battleMapUuid !== NO_SUCH_BATTLE_MAP.uuid ) {
        battleMap = await fetchBattleMap(dispatch, mapSetUuid, battleMapUuid);
    }
    if ( battleMap !== undefined ) {
        dispatch(setSelectedBattleMap(battleMap));
    }
}

export async function refreshSelectedData(
    dispatch: ReduxDispatch, mapSet: MapSet, battleMap: BattleMap
): Promise<void> {
    if ( mapSet !== NO_SUCH_MAP_SET ) {
        let newMapSet = await fetchMapSet(dispatch, mapSet.uuid);
        if ( newMapSet !== undefined ) {  // Gracefully ignore temporary network issues
            dispatch(setSelectedMapSet(newMapSet));
        }
    }
    if ( battleMap !== NO_SUCH_BATTLE_MAP ) {
        let newBattleMap = await fetchBattleMap(dispatch, mapSet.uuid, battleMap.uuid);
        if ( newBattleMap !== undefined ) {
            dispatch(setSelectedBattleMap(newBattleMap));
        }
    }
}

export async function refreshSelectedDataAfterDelete(
    dispatch: ReduxDispatch, mapSet: MapSet
): Promise<void> {
    let newMapSet = await fetchMapSet(dispatch, mapSet.uuid);
    if ( newMapSet === undefined || newMapSet === NO_SUCH_MAP_SET ) {
        dispatch(setSelectedMapSet(NO_SUCH_MAP_SET));
        dispatch(setSelectedBattleMap(NO_SUCH_BATTLE_MAP));
    } else {
        dispatch(setSelectedMapSet(newMapSet));
        let newBattleMap: BattleMap | undefined = NO_SUCH_BATTLE_MAP;
        if ( newMapSet.battle_maps.length > 0 ) {
            newBattleMap = await fetchBattleMap(dispatch, newMapSet.uuid, newMapSet.battle_maps[0].uuid);
            if ( newBattleMap === undefined ) {
                newBattleMap = NO_SUCH_BATTLE_MAP;
            }
        }
        dispatch(setSelectedBattleMap(newBattleMap));
    }
}


export function switchAdmin(dispatch: ReduxDispatch): void {
    dispatch(resetMessages());
    dispatch(setMode(Mode.Admin));
}
