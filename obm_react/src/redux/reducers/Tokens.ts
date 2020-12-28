import {Coordinate, TokenAction, TokenActionType, TokenState} from '../../api/Types';
import {postTokenAction} from '../../api/TokenAction';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MouseMode, ThunkApi, Tokens} from '../Types';
import {getFreeMarkForToken, getTokensWithout} from '../../user/tools/Token';
import {v4 as uuidV4} from "uuid";
import {mouseActions} from "./Mouse";


const INITIAL_STATE: Tokens = {
    flyingToken: null,
    flyingTokenIsNew: false,
    placedTokens: [],
};


export const slice = createSlice({
    name: 'tokens',
    initialState: INITIAL_STATE,
    reducers: {
        pickupFromMap: (state, action: PayloadAction<TokenState>) => {
            const placedTokens = getTokensWithout(state.placedTokens, action.payload);
            return {...state, placedTokens, flyingToken: action.payload, flyingTokenIsNew: false};
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
            return {
                flyingToken: null,
                flyingTokenIsNew: false,
                placedTokens: [...state.placedTokens, action.payload]
            }
        },
        dropIntoBox: (state) => {
            return {...state, flyingToken: null, flyingTokenIsNew: false};
        },
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
        // TODO: Error handling!
        await postTokenAction(state.battleMap, action, dispatch);
    }
);

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
            // TODO: Error handling!
            await postTokenAction(state.battleMap, action, dispatch);
        }
    }
);


export const tokensActions = {
    pickupFromMap, pickupFromBox, positionOnMapForAdjustment, placeOnMap, dropIntoBox
};

export default slice.reducer;
