import {MapSetId} from './Types';
import {GenericDispatch} from '../redux/Types';
import {unpackCheckedResponse} from './UnpackResponse';


export async function uploadMapSetArchive(mapSetId: MapSetId, file: File, dispatch: GenericDispatch) {
    let body = new FormData();
    body.append('data', file);
    body.append('uuid', mapSetId.uuid);
    await unpackCheckedResponse(
        await fetch('/api/backup/', {
            method:'POST',
            body: body,
        })
    );
}
