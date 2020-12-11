import {ReduxDispatch} from '../redux/Store';
import {
    setSelectedMapSet, NO_SUCH_MAP_SET, MapSet,
    startMapSetRefresh, finishMapSetRefresh, abortMapSetRefresh,
} from '../redux/SelectedMapSet';
import {
    setSelectedBattleMap, NO_SUCH_BATTLE_MAP, BattleMap,
    startBattleMapRefresh, finishBattleMapRefresh, abortBattleMapRefresh,
} from '../redux/SelectedBattleMap';
import {resetMessages} from '../redux/Messages';
import {setMode, Mode} from '../redux/Mode';
import {fetchMapSet} from './api/MapSet';
import {fetchBattleMap, postImageData} from './api/BattleMap';


export async function switchMapSet(
    dispatch: ReduxDispatch, uuid: string
): Promise<void> {
    let mapSet: MapSet | undefined = NO_SUCH_MAP_SET;
    if ( uuid.length > 10 ) {
         mapSet = await loadSelectedMapSet(dispatch, uuid);
         if ( mapSet === undefined ) {
            return;
         }
    }
    if ( mapSet.battle_maps.length > 0 ) {
        await loadSelectedBattleMap(dispatch, mapSet.uuid, mapSet.battle_maps[0].uuid);
    } else {
        dispatch(setSelectedBattleMap(NO_SUCH_BATTLE_MAP));
    }
}

// *Refresh* operations are designed to run in the background triggered by DataRefresher.tsx
// The redux reducers will ensure that they will never overwrite data loaded/reloaded
// by request triggered by a *later* user operations, which is processed out-of-order.
// In case of failure they leave the old data untouched.

export async function refreshSelectedData(
    dispatch: ReduxDispatch, mapSet: MapSet, battleMap: BattleMap
): Promise<void> {
    await refreshMapSet(dispatch, mapSet);
    await refreshBattleMap(dispatch, battleMap);
}

export async function refreshMapSet(dispatch: ReduxDispatch, mapSet: MapSet): Promise<void> {
    if ( mapSet === NO_SUCH_MAP_SET ) {
        return;
    }
    dispatch(startMapSetRefresh());
    let newMapSet = await fetchMapSet(dispatch, mapSet.uuid);
    if ( newMapSet === undefined ) {  // Gracefully ignore temporary network issues
        dispatch(abortMapSetRefresh());
    } else {
        dispatch(finishMapSetRefresh(newMapSet));
    }
}

export async function refreshBattleMap(dispatch: ReduxDispatch, battleMap: BattleMap): Promise<void> {
    if ( battleMap === NO_SUCH_BATTLE_MAP ) {
        return;
    }
    dispatch(startBattleMapRefresh());
    let newBattleMap = await fetchBattleMap(dispatch, battleMap.map_set_uuid, battleMap.uuid);
    if ( newBattleMap === undefined ) {
        dispatch(abortBattleMapRefresh());
    } else {
        dispatch(finishBattleMapRefresh(newBattleMap));
    }
}

// The load operations are always triggered by user operations.
// Failures are always forwarded to the user by invalidating the cached data
// (e.g. ... NO_SUCH_MAP_SET)

export async function loadSelectedMapSet(
    dispatch: ReduxDispatch, uuid: string,
): Promise<MapSet> {
    let newMapSet = await fetchMapSet(dispatch, uuid);
    if ( newMapSet === undefined ) {
        newMapSet = NO_SUCH_MAP_SET;
    }
    dispatch(setSelectedMapSet(newMapSet));
    return newMapSet;
}

export async function loadSelectedBattleMap(
    dispatch: ReduxDispatch, mapSetUuid: string, uuid: string
): Promise<BattleMap> {
    let newBattleMap = await fetchBattleMap(dispatch, mapSetUuid, uuid);
    if ( newBattleMap === undefined ) {
        newBattleMap = NO_SUCH_BATTLE_MAP;
    }
    dispatch(setSelectedBattleMap(newBattleMap));
    return newBattleMap;
}

export function switchAdmin(dispatch: ReduxDispatch): void {
    dispatch(resetMessages());
    dispatch(setMode(Mode.Admin));
}

export async function uploadBackgroundImage(dispatch: ReduxDispatch, battleMap: BattleMap, image: File): Promise<void> {
    await postImageData(dispatch, battleMap, image);
    // This will implicitly trigger a reload of the image based on the background_revision
    await loadSelectedBattleMap(dispatch, battleMap.map_set_uuid, battleMap.uuid);
}
