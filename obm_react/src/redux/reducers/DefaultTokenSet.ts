import {defaultTokenSetApi} from '../../api/DefaultTokenSet';
import {RootState} from '../Types';
import {createReadonlySyncReducer} from '../Tools';

const setup = createReadonlySyncReducer({
    name: 'defaultTokenSet',
    api: defaultTokenSetApi,
    getMyOwnState: (state: RootState) => state.defaultTokenSet,
    syncPeriodInMs: 60 * 60 * 1000,
});

export const defaultTokenSetActions = setup.actions;
export default setup.reducer;
