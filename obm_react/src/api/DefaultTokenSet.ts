import {TokenSet} from './Types';
import {createReadonlyApi} from './Tools';

export const defaultTokenSetApi = createReadonlyApi<TokenSet>({
    name: 'Default Token Set',
    baseUrl: '/api/token_set/default',
});
