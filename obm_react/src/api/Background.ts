import {BattleMapId} from './Types';
import {unpackCheckedResponse} from './UnpackResponse';
import {logRequest} from "../common/ApiLogs";


export async function postImageData(battleMapId: BattleMapId, file: File) {
    let body = new FormData();
    body.append('image_data', file);
    body.append('uuid', battleMapId.uuid);
    body.append('map_set_uuid', battleMapId.map_set_uuid);
    const url = '/api/image_data/';
    const response = await fetch(url, {
        method:'POST',
        body: body,
    });
    logRequest(
        "POST " + url + " FormData: uuid=" + battleMapId.uuid + " map_set_uuid=" + battleMapId.map_set_uuid
    );
    await unpackCheckedResponse(response);
}
