import {
    MapSetId, MapSetUpdate, MapSetCreate, MapSet, Operation,
    AdminSecretRequired, MapSetNotFound
} from './Types';
import {createUpdatableApiWithId} from './Tools';
import {UnpackedResponse} from "./UnpackResponse";


function detectSpecialErrors(response: UnpackedResponse, _op: Operation, _id: MapSetId|undefined) {
    if ( response.status === 404 ) {
        throw new MapSetNotFound();
    }
    if ( response.status === 401 ) {
        throw new AdminSecretRequired();
    }
}


export const mapSetApi = createUpdatableApiWithId<MapSetId, MapSetUpdate, MapSetCreate, MapSet>({
    name: 'Map Set',
    baseUrl: '/api/map_set',
    isIdOf: (id: MapSetId, idLike: MapSetId) => id.uuid === idLike.uuid,
    getIdOf: (idLike: MapSetId) => { return {uuid: idLike.uuid}; },
    getFetchUri: (id: MapSetId) => '/' + id.uuid,
    detectSpecialErrors: detectSpecialErrors,
});
