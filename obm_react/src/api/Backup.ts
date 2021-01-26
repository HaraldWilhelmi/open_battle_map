import {MapSetId} from './Types';
import {unpackCheckedResponse} from './UnpackResponse';
import {logRequest} from "../common/ApiLogs";


export async function uploadMapSetArchive(mapSetId: MapSetId, file: File) {
    let body = new FormData();
    body.append('data', file);
    body.append('uuid', mapSetId.uuid);
    const url = '/api/backup/';
    const response = await fetch(url, {
        method:'POST',
        body: body,
    });
    logRequest("POST " + url + " FormData: uuid=" + mapSetId.uuid);
    await unpackCheckedResponse(response);
}
