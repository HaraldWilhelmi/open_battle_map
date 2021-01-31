import {MapSetList, AdminSecretRequired} from './Types';
import {createReadOnlyApi} from './ApiTools';
import {UnpackedResponse} from "./UnpackResponse";
import {Result} from "../common/Result";


function detectSpecialErrors(response: UnpackedResponse): Result<void> {
    if ( response.status === 401 ) {
        return new AdminSecretRequired();
    }
}

export const mapSetListApi = createReadOnlyApi<MapSetList, undefined>({
    name: 'Map Set List',
    baseUrl: '/api/map_set_list/',
    getContextOf: (_) => undefined,
    getFetchUri: (_) => '',
    matchesContextOf: (_, _data: MapSetList) => false,
    detectSpecialErrors
});
