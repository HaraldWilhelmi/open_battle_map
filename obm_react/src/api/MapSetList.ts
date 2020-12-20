import {MapSetList, Operation, AdminSecretRequired} from './Types';
import {createReadonlyApi} from './Tools';


function detectSpecialErrors(response: Response, operation: Operation) {
    if ( response.status === 401 ) {
        throw new AdminSecretRequired();
    }
}

export const mapSetListApi = createReadonlyApi<MapSetList>({
    name: 'Map Set List',
    baseUrl: '/api/map_set_list',
    detectSpecialErrors: detectSpecialErrors,
});
