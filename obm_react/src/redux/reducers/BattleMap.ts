import {battleMapApi} from '../../api/BattleMap';
import {RootState} from '../Types';
import {createUpdatableSyncWithIdReducer} from '../Tools';

const setup = createUpdatableSyncWithIdReducer({
    name: 'battleMap',
    api: battleMapApi,
    getMyOwnState: (state: RootState) => state.battleMap,
    syncPeriodInMs: 60 * 1000,
});

export const battleMapActions = setup.actions;
export default setup.reducer;
