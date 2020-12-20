import {BattleMapId} from './Types';
import {GenericDispatch} from '../redux/Types'
import {handleResponse} from '../common/Tools';


export async function postImageData(battleMapId: BattleMapId, file: File, dispatch: GenericDispatch) {
    let body = new FormData();
    body.append('image_data', file);
    body.append('uuid', battleMapId.uuid);
    body.append('map_set_uuid', battleMapId.map_set_uuid);
    let response = await(
        fetch('/api/image_data/', {
            method:'POST',
            body: body,
        })
    )
    handleResponse(dispatch, response, 'to upload background image');
}
