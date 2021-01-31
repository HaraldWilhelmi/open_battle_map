import {AdminSecretRequired} from '../../api/Types';
import {mapSetListApi} from '../../api/MapSetList';
import {Operation} from "../../api/ApiTools";
import {GenericDispatch, Mode} from '../Types';
import {createReadonlySyncReducer} from '../ReduxTools';
import {modeActions} from './Mode';

function errorHandler(
    error: Error,
    operation: Operation,
    _: undefined,
    dispatch: GenericDispatch
): void {
    if ( error instanceof AdminSecretRequired ) {
        dispatch(modeActions.set(Mode.AdminLogin));
    }
}

const setup = createReadonlySyncReducer({
    name: 'mapSetList',
    syncPeriodInMs: 60 * 1000,
    api: mapSetListApi,
    getInitialState: () => mapSetListApi.get(undefined),
    getMyOwnState: (state) => state.mapSetList,
    errorHandler,
});

export const mapSetListActions = setup.actions;
export default setup.reducer;
