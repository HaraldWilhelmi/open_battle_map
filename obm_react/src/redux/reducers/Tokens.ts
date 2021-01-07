import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Coordinate, TokenAction, TokenActionHistoryId, TokenActionType, TokenState} from '../../api/Types';
import {postTokenAction, getAllTokens} from '../../api/Token';
import {GenericDispatch, MouseMode, ActingTokenState, RootState, ThunkApi, Tokens} from '../Types';
import {getFreeMarkForToken, getTokensWithout, startTokenAction, endTokenAction} from '../../user/tools/Token';
import {v4 as uuidV4} from "uuid";
import {mouseActions} from "./Mouse";
import {localTokenActionTrackActions} from "./LocalTokenActionTrack";
import {actions} from "../Store";


const INITIAL_STATE: Tokens = {
    flyingToken: null,
    flyingTokenIsNew: false,
    placedTokens: [],
    actingTokens: [],
};


export const slice = createSlice({
    name: 'tokens',
    initialState: INITIAL_STATE,
    reducers: {
        pickupFromMap: (state, action: PayloadAction<TokenState>) => {
            const placedTokens = getTokensWithout(state.placedTokens, action.payload);
            const flyingToken: TokenState = {...action.payload};
            return {...state, placedTokens, flyingToken, flyingTokenIsNew: false};
        },
        pickupFromBox: (state, action: PayloadAction<TokenState>) => {
            return {...state, flyingToken: action.payload, flyingTokenIsNew: true};
        },
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
                flyingTokenIsNew: false,
                placedTokens: [...state.placedTokens, action.payload],
            };
        },
        dropIntoBox: (state) => {
            return {...state, flyingToken: null, flyingTokenIsNew: false};
        },
        loadTokensFromServer: (state, action: PayloadAction<TokenState[]>) => {
            return {
                flyingToken: null,
                flyingTokenIsNew: false,
                placedTokens: action.payload,
                actingTokens: [],
            };
        },
        startAction: (state, action: PayloadAction<TokenAction>) => startTokenAction(state, action.payload),
        endAction: (state, action: PayloadAction<ActingTokenState>) => endTokenAction(state, action.payload),
    },
});


const pickupFromMap = createAsyncThunk<void, TokenState, ThunkApi>(
    'tokens/pickupFromMap',
    async (token: TokenState, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        if ( state.mouse.mode !== MouseMode.Default ) {
            return;
        }
        dispatch(mouseActions.grabToken());
        dispatch(slice.actions.pickupFromMap(token));
    }
);

const pickupFromBox = createAsyncThunk<void, TokenState, ThunkApi>(
    'tokens/pickupFromBox',
    async (token: TokenState, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        if ( state.mouse.mode !== MouseMode.Default ) {
            return;
        }
        dispatch(mouseActions.grabToken());
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
            const allTokenStatesResponse = await getAllTokens(battleMap, dispatch);
            dispatch(localTokenActionTrackActions.reset());
            dispatch(slice.actions.loadTokensFromServer(allTokenStatesResponse.tokens));
            const tokenActionHistoryId: TokenActionHistoryId = {...battleMap, since: allTokenStatesResponse.next_action_index};
            dispatch(actions.tokenActionHistory.get(tokenActionHistoryId));
            dispatch(mouseActions.releaseToken());
        }
    }
);


const placeOnMap = createAsyncThunk<void, number | null, ThunkApi>(
    'tokens/placeOnMap',
    async (rotation, thunkApi) => {
        const getState = thunkApi.getState;
        const dispatch = thunkApi.dispatch;
        const state = getState();
        const token = state.tokens.flyingToken;
        if ( token === null ) {
            console.log("Warning: placeOnMap dispatched without token!")
            return;
        }

        let actionType = TokenActionType.moved;
        let mark = token.mark;
        if ( state.tokens.flyingTokenIsNew ) {
            actionType = TokenActionType.added;
            mark = getFreeMarkForToken(state.tokens.placedTokens, token);
        }
        const uuid = uuidV4();
        const newRotation = rotation === null ? token.rotation : rotation;
        const newToken: TokenState = {...token, mark, rotation: newRotation};
        const action: TokenAction = {...newToken, action_type: actionType, uuid};
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
        console.log("Warning: Failed to send token action - will reload everything from server!")
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
        if (!state.tokens.flyingTokenIsNew) {
            const action: TokenAction = {
                ...token,
                action_type: TokenActionType.removed,
                uuid: uuidV4(),
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
