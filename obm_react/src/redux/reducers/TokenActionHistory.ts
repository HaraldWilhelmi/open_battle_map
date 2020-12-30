import {tokenActionHistoryApi} from '../../api/Token';
import {GenericDispatch, RootState} from '../Types';
import {createReadonlySyncWithIdReducer} from "../Tools";
import {Operation, TokenActionHistoryId, TokenActionHistoryExpired} from "../../api/Types";
import {tokensActions} from './Tokens';


function errorHandler(
    error: Error, operation: Operation, id: TokenActionHistoryId|undefined, dispatch: GenericDispatch
) {
    if ( error instanceof TokenActionHistoryExpired ) {
        console.log("Warning: Requested token data was too old! Loading complete data from server!");
        dispatch(tokensActions.loadTokensFromServer());
    }
}


const setup = createReadonlySyncWithIdReducer({
    name: 'tokenActionHistory',
    api: tokenActionHistoryApi,
    getMyOwnState: (state: RootState) => state.tokenActionHistory,
    syncPeriodInMs: 1000,
    errorHandler
});

export const tokenActionHistoryActions = setup.actions;
export default setup.reducer;
