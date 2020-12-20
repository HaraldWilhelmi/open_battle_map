import {AdminSecretRequired, Operation} from '../../api/Types';
import {mapSetListApi} from '../../api/MapSetList';
import {GenericDispatch, Mode} from '../Types';
import {createReadonlySyncReducer} from '../Tools';
import {modeActions} from './Mode';

function errorHandler(
    error: Error,
    operation: Operation,
    dispatch: GenericDispatch
): void {
    if ( error instanceof AdminSecretRequired  ) {
        dispatch(modeActions.set(Mode.AdminLogin));
    }
}

const setup = createReadonlySyncReducer({
    name: 'mapSetList',
    api: mapSetListApi,
    getMyOwnState: (state) => state.mapSetList,
    errorHandler,
    syncPeriodInMs: 60 * 1000,
});

export const mapSetListActions = setup.actions;
export default setup.reducer;
