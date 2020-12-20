import {MapSetId, MapSetUpdate, MapSetCreate, MapSet, Operation, AdminSecretRequired} from '../../api/Types';
import {mapSetApi} from '../../api/MapSet';
import {GenericDispatch, Mode, RootState} from '../Types';
import {createUpdatableSyncWithIdReducer} from '../Tools';
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

const setup = createUpdatableSyncWithIdReducer<MapSetId, MapSetUpdate, MapSetCreate, MapSet>({
    name: 'mapSet',
    api: mapSetApi,
    getMyOwnState: (state: RootState) => state.mapSet,
    errorHandler,
    syncPeriodInMs: 3 * 1000,
});

export const mapSetActions = setup.actions;
export default setup.reducer;
