import {battleMapApi} from '../../api/BattleMap';
import {RootState} from '../Types';
import {createUpdatableSyncReducer} from '../ReduxTools';
import {BattleMapId} from "../../api/Types";

const setup = createUpdatableSyncReducer({
    name: 'battleMap',
    api: battleMapApi,
    syncPeriodInMs: 60 * 1000,
    getMyOwnState: (state: RootState) => state.battleMap,
    getInitialState: async (battleMapId: BattleMapId) => battleMapApi.get(battleMapId),
});

export const battleMapActions = setup.actions;
export default setup.reducer;
