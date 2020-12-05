import {ReduxDispatch} from '../redux/Store';
import {MapSetList, loadMapSets} from '../redux/MapSets';
import {handleResponse} from '../common/Tools';
import {setMode, Mode} from '../redux/Cookies';

export async function updateMapSets(dispatch: ReduxDispatch) {
    let response = await(fetch('/map_set/list_all'));
    if (response.ok) {
        let mapSetList: MapSetList = await(response.json());
        dispatch(loadMapSets(mapSetList));
    } else {
        if (response.status === 401) {
            dispatch(setMode(Mode.AdminLogin));
        }
    }
    handleResponse(dispatch, response, '', false);
}

interface UpdateRequest {
    uuid: string,
    name: string,
}

export async function renameMapSet(dispatch: ReduxDispatch, uuid: string, name: string) {
    let body: UpdateRequest = { uuid, name };
    let response = await(
        fetch('/map_set/', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to rename Map Set');
    updateMapSets(dispatch);
}

interface DeleteRequest {
    uuid: string,
}

export async function deleteMapSet(dispatch: ReduxDispatch, uuid: string) {
    let body: DeleteRequest = { uuid };
    let response = await(
        fetch('/map_set/', {
            method:'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to delete Map Set');
    updateMapSets(dispatch);
}

interface CreateRequest {
    name: string,
}

export async function createMapSet(dispatch: ReduxDispatch, name: string) {
    let body: CreateRequest = { name };
    let response = await(
        fetch('/map_set/', {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    );
    handleResponse(dispatch, response, 'to create Map Set');
    updateMapSets(dispatch);
}
