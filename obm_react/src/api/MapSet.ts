import {MapSetId, MapSetUpdate, MapSetCreate, MapSet, AdminSecretRequired, MapSetNotFound} from './Types';
import {createUpdatableApi, Operation} from './ApiTools';
import {UnpackedResponse} from "./UnpackResponse";
import {Result} from "../common/Result";


function detectSpecialErrors(response: UnpackedResponse, _op: Operation, _id: MapSetId|undefined): Result<void> {
    if ( response.status === 404 ) {
        return  new MapSetNotFound();
    }
    if ( response.status === 401 ) {
        return new AdminSecretRequired();
    }
}


function getUpdateRequestBody(mapSet: MapSet): string {
    const request: MapSetUpdate = {...mapSet};
    return JSON.stringify(request);
}


export const mapSetApi = createUpdatableApi<MapSet, MapSetId, MapSetCreate>({
    name: 'Map Set',
    baseUrl: '/api/map_set',
    matchesContextOf: (id: MapSetId, idLike: MapSetId) => id.uuid === idLike.uuid,
    getContextOf: (idLike: MapSetId) => { return {uuid: idLike.uuid}; },
    getFetchUri: (id: MapSetId) => '/' + id.uuid,
    detectSpecialErrors,
    getUpdateRequestBody,
});
