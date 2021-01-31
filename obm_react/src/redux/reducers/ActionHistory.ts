import {actionHistoryApi} from '../../api/ActionHistory';
import {GenericDispatch, RootState} from '../Types';
import {createReadonlySyncReducer} from "../ReduxTools";
import {ActionHistoryId, TokenActionHistoryExpired, ActionHistory, BattleMap} from "../../api/Types";
import {Operation} from "../../api/ApiTools";
import {tokensActions} from './Tokens';


async function getInitialState(battleMap: BattleMap): Promise<ActionHistory> {
    return {
        map_set_uuid: battleMap.map_set_uuid,
        uuid: battleMap.uuid,
        battle_map_revision: battleMap.revision,
        last_action_index: battleMap.action_count - 1,
        since: battleMap.action_count,
        pointer_actions: [],
        token_actions: []
    };
}

function errorHandler(
    error: Error, operation: Operation, id: ActionHistoryId|undefined, dispatch: GenericDispatch
) {
    if ( error instanceof TokenActionHistoryExpired ) {
        console.log("Warning: Requested token data was too old! Loading complete data from server!");
        dispatch(tokensActions.loadTokensFromServer());
    }
}

const setup = createReadonlySyncReducer({
    name: 'actionHistory',
    api: actionHistoryApi,
    getMyOwnState: (state: RootState) => state.actionHistory,
    syncPeriodInMs: 20,
    getInitialState,
    errorHandler
});

export const actionHistoryActions = setup.actions;
export default setup.reducer;
