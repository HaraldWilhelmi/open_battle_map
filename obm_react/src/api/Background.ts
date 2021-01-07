import {BattleMapId} from './Types';
import {GenericDispatch} from '../redux/Types'
import {unpackCheckedResponse} from './UnpackResponse';


export async function postImageData(battleMapId: BattleMapId, file: File, dispatch: GenericDispatch) {
    let body = new FormData();
    body.append('image_data', file);
    body.append('uuid', battleMapId.uuid);
    body.append('map_set_uuid', battleMapId.map_set_uuid);
    await unpackCheckedResponse(
        await fetch('/api/image_data/', {
            method:'POST',
            body: body,
        })
    );
}
