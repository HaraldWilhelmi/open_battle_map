import {MapSetId, MapSetCreate, MapSet, AdminSecretRequired} from '../../api/Types';
import {mapSetApi} from '../../api/MapSet';
import {Operation} from "../../api/ApiTools";
import {GenericDispatch, Mode, RootState} from '../Types';
import {createUpdatableSyncReducer} from '../ReduxTools';
import {modeActions} from './Mode';

function errorHandler(
    error: Error,
    _op: Operation,
    _id: MapSetId | undefined,
    dispatch: GenericDispatch
): void {
    if ( error instanceof AdminSecretRequired  ) {
        dispatch(modeActions.set(Mode.AdminLogin));
    }
}

const setup = createUpdatableSyncReducer<MapSet, MapSetId, MapSetId, MapSetCreate>({
    name: 'mapSet',
    syncPeriodInMs: 60 * 1000,
    api: mapSetApi,
    getInitialState: (id: MapSetId) => mapSetApi.get(id),
    getMyOwnState: (state: RootState) => state.mapSet,
    errorHandler,
});

export const mapSetActions = setup.actions;
export default setup.reducer;
