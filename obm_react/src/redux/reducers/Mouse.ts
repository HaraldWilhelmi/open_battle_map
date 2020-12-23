import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TokenId, TokenState, Coordinate} from '../../api/Types';
import {MouseState, MouseMode} from '../Types';
import {mapPropertiesActions} from './MapProperties';

const INITIAL_STATE: MouseState = {
    mode: MouseMode.Default,
    lastSeen: null,
    tokenId: null,
    tokenRotation: 0.0,
}

export const slice = createSlice({
    name: 'mouse',
    initialState: INITIAL_STATE,
    reducers: {
        grabMap: (state, action: PayloadAction<Coordinate>) => {
            return {
                mode: MouseMode.MoveMap,
                lastSeen: action.payload,
                tokenId: null,
                tokenRotation: 0.0,
            };
        },
        releaseMap: (state) => {
            return {...state, mode: MouseMode.Default, lastSeen: null};
        },
        grabToken: (state, action: PayloadAction<TokenState>) => {
            const tokenId: TokenId = {...action.payload};
            return {...state,
                mode: MouseMode.MoveToken,
                lastSeen: action.payload.position,
                tokenId,
                tokenRotation: action.payload.rotation,
            };
        },
        placeToken: (state, action: PayloadAction<Coordinate>) => {
            return {...state,
                mode: MouseMode.TurnToken,
                lastSeen: action.payload,
            };
        },
        releaseToken: (state) => {
            return {...state,
                mode: MouseMode.Default, tokenId: null, lastSeen: null
            };
        },
    },
    extraReducers: builder => {
        builder.addCase(
            mapPropertiesActions.move, (state, action) => {
                if ( state.mode === MouseMode.MoveMap && state.lastSeen !== null ) {
                    return {...state,
                        lastSeen: {
                            x: state.lastSeen.x + action.payload.deltaX,
                            y: state.lastSeen.y + action.payload.deltaY,
                        }
                    }
                } else {
                    return state;
                }
            }
        )
    },
})

export const mouseActions = slice.actions;

export default slice.reducer;
