import {MapSetList, Operation, AdminSecretRequired} from './Types';
import {createReadonlyApi} from './Tools';
import {UnpackedResponse} from "./UnpackResponse";


function detectSpecialErrors(response: UnpackedResponse, operation: Operation) {
    if ( response.status === 401 ) {
        throw new AdminSecretRequired();
    }
}

export const mapSetListApi = createReadonlyApi<MapSetList>({
    name: 'Map Set List',
    baseUrl: '/api/map_set_list',
    detectSpecialErrors: detectSpecialErrors,
});
