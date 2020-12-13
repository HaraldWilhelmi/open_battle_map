import {ReduxDispatch} from '../../redux/Store';
import {MapSet, NO_SUCH_MAP_SET} from '../../redux/SelectedMapSet';
import {reportError} from '../../redux/Messages';
import {handleResponse} from '../../common/Tools';


export async function fetchMapSet(dispatch: ReduxDispatch, uuid: string): Promise<MapSet|undefined> {
    let response = await(
        fetch('/api/map_set/' + uuid)
    );
    if (response.ok) {
        return await(response.json());
    } else {
        if (response.status === 404) {
            dispatch(reportError('Map Set not found!'));
            return NO_SUCH_MAP_SET;
        } else {
            handleResponse(dispatch, response, '', false);
            return undefined;
        }
    }
}

export async function uploadMapSetArchive(dispatch: ReduxDispatch, uuid: string, file: File) {
    let body = new FormData();
    body.append('data', file);
    body.append('uuid', uuid);
    let response = await(
        fetch('/api/map_set/upload', {
            method:'POST',
            body: body,
        })
    )
    handleResponse(dispatch, response, 'to upload Map Set "' + uuid + '"');
}
