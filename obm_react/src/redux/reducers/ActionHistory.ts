import {actionHistoryApi} from '../../api/ActionHistory';
import {GenericDispatch, RootState} from '../Types';
import {createReadonlySyncWithIdReducer} from "../Tools";
import {Operation, ActionHistoryId, TokenActionHistoryExpired} from "../../api/Types";
import {tokensActions} from './Tokens';


function errorHandler(
    error: Error, operation: Operation, id: ActionHistoryId|undefined, dispatch: GenericDispatch
) {
    if ( error instanceof TokenActionHistoryExpired ) {
        console.log("Warning: Requested token data was too old! Loading complete data from server!");
        dispatch(tokensActions.loadTokensFromServer());
    }
}


const setup = createReadonlySyncWithIdReducer({
    name: 'actionHistory',
    api: actionHistoryApi,
    getMyOwnState: (state: RootState) => state.actionHistory,
    syncPeriodInMs: 100,
    errorHandler
});

export const actionHistoryActions = setup.actions;
export default setup.reducer;
