import {ReduxDispatch} from '../redux/Store';
import {increaseMapSetUpdateCount} from '../redux/MapSetUpdateCount';
import {handleResponse} from '../common/Tools';
import {setMode, Mode} from '../redux/Mode';
import {MapSetList} from './Types';

export async function fetchAllMapSets(dispatch: ReduxDispatch): Promise<MapSetList> {
    let response = await(fetch('/api/map_set/list_all'));
    if (response.ok) {
        return await(response.json());
    } else {
        if (response.status === 401) {
            dispatch(setMode(Mode.AdminLogin));
        }
    }
    handleResponse(dispatch, response, '', false);
    return [];
}

interface UpdateRequest {
    uuid: string,
    name: string,
}

export async function renameMapSet(dispatch: ReduxDispatch, uuid: string, name: string) {
    let body: UpdateRequest = { uuid, name };
    let response = await(
        fetch('/api/map_set/', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to rename Map Set');
    dispatch(increaseMapSetUpdateCount());
}

interface DeleteRequest {
    uuid: string,
}

export async function deleteMapSet(dispatch: ReduxDispatch, uuid: string) {
    let body: DeleteRequest = { uuid };
    let response = await(
        fetch('/api/map_set/', {
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to delete Map Set');
    dispatch(increaseMapSetUpdateCount());
}

interface CreateRequest {
    name: string,
}

export async function createMapSet(dispatch: ReduxDispatch, name: string) {
    let body: CreateRequest = { name };
    let response = await(
        fetch('/api/map_set/', {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to create Map Set');
    dispatch(increaseMapSetUpdateCount());
}
