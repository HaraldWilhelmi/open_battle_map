import {MapSetId} from './Types';
import {GenericDispatch} from '../redux/Types';
import {handleResponse} from '../common/Tools';


export async function uploadMapSetArchive(mapSetId: MapSetId, file: File, dispatch: GenericDispatch) {
    let body = new FormData();
    body.append('data', file);
    body.append('uuid', mapSetId.uuid);
    let response = await(
        fetch('/api/backup/', {
            method:'POST',
            body: body,
        })
    )
    handleResponse(dispatch, response, 'to upload Background Set "' + mapSetId.uuid + '"');
}
