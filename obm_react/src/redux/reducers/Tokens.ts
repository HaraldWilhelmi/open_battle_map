import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Coordinate, TokenAction, ActionHistoryId, TokenActionType, TokenState} from '../../api/Types';
import {getAllTokens, postTokenAction} from '../../api/ActionHistory';
import {ActingTokenState, FlyingToken, GenericDispatch, MouseMode, RootState, ThunkApi, Tokens} from '../Types';
import {
    endTokenAction,
    getFreeMarkForToken,
    pickupTokenFromBox,
    pickupTokenFromMap,
    startTokenAction
} from '../../user/tools/Token';
import {mouseActions} from "./Mouse";
import {localTokenActionTrackActions} from "./LocalTokenActionTrack";
import {actions} from "../Store";


const INITIAL_STATE: Tokens = {
    flyingToken: null,
    placedTokens: [],
    actingTokens: [],
};


export const slice = createSlice({
    name: 'tokens',
    initialState: INITIAL_STATE,
    reducers: {
        pickupFromMap: (state, action: PayloadAction<FlyingToken>) => pickupTokenFromMap(state, action.payload),
        pickupFromBox: (state, action: PayloadAction<FlyingToken>) => pickupTokenFromBox(state, action.payload),
        positionOnMapForAdjustment: (state, action: PayloadAction<Coordinate>) => {
            if ( state.flyingToken !== null ) {
                return {...state,
                    flyingToken: {...state.flyingToken,
                        position: action.payload
                    },
                };
            }
            return state;
        },
        placeOnMap: (state, action: PayloadAction<TokenState>) => {
            return {...state,
                flyingToken: null,
                placedTokens: [...state.placedTokens, action.payload],
            };
        },
        dropIntoBox: (state) => {
            return {...state, flyingToken: null, flyingTokenIsNew: false};
        },
        loadTokensFromServer: (state, action: PayloadAction<TokenState[]>) => {
            return {
                flyingToken: null,
                placedTokens: action.payload,
                actingTokens: [],
            };
        },
        startAction: (state, action: PayloadAction<TokenAction>) => startTokenAction(state, action.payload),
        endAction: (state, action: PayloadAction<ActingTokenState>) => endTokenAction(state, action.payload),
    },
});


const pickupFromMap = createAsyncThunk<void, FlyingToken, ThunkApi>(
    'tokens/pickupFromMap',
    async (token: FlyingToken, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        if ( state.mouse.mode !== MouseMode.Default ) {
            return;
        }
        dispatch(mouseActions.grabToken(token.position));
        dispatch(slice.actions.pickupFromMap(token));
    }
);

const pickupFromBox = createAsyncThunk<void, FlyingToken, ThunkApi>(
    'tokens/pickupFromBox',
    async (token: FlyingToken, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        dispatch(mouseActions.grabToken(null));
        dispatch(slice.actions.pickupFromBox(token));
    }
);

const positionOnMapForAdjustment = createAsyncThunk<void, Coordinate, ThunkApi>(
    'tokens/positionOnMapForAdjustment',
    async (position: Coordinate, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        if ( state.mouse.mode !== MouseMode.MoveToken ) {
            console.log("Warning: positionOnMapForAdjustment dispatched in wrong mouse mode!")
            return;
        }
        dispatch(mouseActions.placeToken());
        dispatch(slice.actions.positionOnMapForAdjustment(position));
    }
);

const loadTokensFromServer = createAsyncThunk<void, undefined, ThunkApi>(
    'tokens/loadTokensFromServer',
    async (_: undefined, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        const battleMap = state.battleMap;
        if ( battleMap !== null ) {
            const allTokenStatesResponse = await getAllTokens(battleMap);
            dispatch(localTokenActionTrackActions.reset());
            dispatch(slice.actions.loadTokensFromServer(allTokenStatesResponse.tokens));
            const tokenActionHistoryId: ActionHistoryId = {...battleMap, since: allTokenStatesResponse.next_action_index};
            dispatch(actions.actionHistory.get(tokenActionHistoryId));
            dispatch(mouseActions.releaseToken());
        }
    }
);


const placeOnMap = createAsyncThunk<void, number | null, ThunkApi>(
    'tokens/placeOnMap',
    async (newRotation, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        const token = state.tokens.flyingToken;
        if ( token === null ) {
            console.log("Warning: placeOnMap dispatched without token!")
            return;
        }

        let mark = token.mark;
        if ( token.action_type === TokenActionType.added ) {
            mark = getFreeMarkForToken(state.tokens.placedTokens, token);
        }
        const rotation = newRotation ?? token.rotation;
        const newToken: TokenState = {...token, rotation, mark};
        const action: TokenAction = {...token, rotation, mark};
        dispatch(slice.actions.placeOnMap(newToken));
        dispatch(mouseActions.releaseToken());
        await logAction(state, action, dispatch);
    }
);

async function logAction(state: RootState, action: TokenAction, dispatch: GenericDispatch) {
    try {
        await postTokenAction(state.battleMap, action);
        dispatch(localTokenActionTrackActions.log(action.uuid));
    } catch (e) {
        console.log("Warning: Failed to send token token_action - will reload everything from server!")
        dispatch(loadTokensFromServer());
    }
}

const dropIntoBox = createAsyncThunk<void, undefined, ThunkApi>(
    'tokens/dropIntoBox',
    async (_: undefined, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        const token = state.tokens.flyingToken;
        if (token === null) {
            throw new Error('This should never happen!')
        }
        dispatch(slice.actions.dropIntoBox());
        dispatch(mouseActions.releaseToken());
        if ( token.action_type === TokenActionType.moved ) {
            const action: TokenAction = {...token,
                action_type: TokenActionType.removed,
            };
            await logAction(state, action, dispatch);
        }
    }
);


export const tokensActions = {
    pickupFromMap, pickupFromBox, positionOnMapForAdjustment, placeOnMap, dropIntoBox, loadTokensFromServer,
    startMove: slice.actions.startAction,
    endMove: slice.actions.endAction,
};

export default slice.reducer;
