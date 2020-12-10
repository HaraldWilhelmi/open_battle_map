import {ReduxDispatch} from '../../redux/Store';
import {BattleMap, NO_SUCH_BATTLE_MAP} from '../../redux/SelectedBattleMap';
import {reportError} from '../../redux/Messages';
import {handleResponse} from '../../common/Tools';


export async function fetchBattleMap(dispatch: ReduxDispatch, mapSetUuid: string, battleMapUuid: string): Promise<BattleMap|undefined> {
    let response = await(
        fetch('/api/battle_map/' + mapSetUuid + '/' + battleMapUuid)
    );
    if (response.ok) {
        return await(response.json());
    } else {
        if (response.status === 404) {
            dispatch(reportError('Battle Map not found!'));
            return NO_SUCH_BATTLE_MAP;
        } else {
            handleResponse(dispatch, response, '', false);
            return undefined;
        }
    }
}

interface CreateRequest {
    name: string,
    map_set_uuid: string,
}

export async function createBattleMap(
    dispatch: ReduxDispatch, mapSetUuid: string, name: string
): Promise<BattleMap | undefined> {
    let body: CreateRequest = {
        name,
        map_set_uuid: mapSetUuid,
    };
    let response = await(
        fetch('/api/battle_map/', {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to create Battle Map "' + name + '"');
    if ( response.ok ) {
        return response.json();
    } else {
        return undefined;
    }
}

export async function updateBattleMap(dispatch: ReduxDispatch, battleMap: BattleMap) {
    let response = await(
        fetch('/api/battle_map/', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(battleMap),
        })
    );
    handleResponse(dispatch, response, 'to update Battle Map "' + battleMap.name + '"');
}

interface DeleteRequest {
    uuid: string,
    map_set_uuid: string,
}

export async function deleteBattleMap(dispatch: ReduxDispatch, battleMap: BattleMap) {
    let body: DeleteRequest = {
        uuid: battleMap.uuid,
        map_set_uuid: battleMap.map_set_uuid,
    };
    let response = await(
        fetch('/api/battle_map/', {
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to delete Battle Map "' + battleMap.name + '"');
}
