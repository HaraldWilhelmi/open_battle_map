import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {TokenState, Coordinate} from '../../api/Types';
import {MouseState, MouseMode} from '../Types';
import {mapPropertiesActions} from './MapProperties';

const INITIAL_STATE: MouseState = {
    mode: MouseMode.Default,
    lastSeen: null,
    flyingToken: null,
    cursorStyle: 'default',
}

export const slice = createSlice({
    name: 'mouse',
    initialState: INITIAL_STATE,
    reducers: {
        grabMap: (state, action: PayloadAction<Coordinate>) => {
            return {...state,
                mode: MouseMode.MoveMap, lastSeen: action.payload,
                cursorStyle: 'move',
            };
        },
        releaseMap: (state) => {
            return {...state,
                mode: MouseMode.Default, lastSeen: null,
                cursorStyle: 'default',
            };
        },

        grabToken: (state, action: PayloadAction<TokenState>) => {
            return {...state,
                mode: MouseMode.MoveToken, flyingToken: action.payload,
                cursorStyle: 'move',
            };
        },
        placeToken: (state, action: PayloadAction<Coordinate>) => {
            let flyingToken = state.flyingToken;
            if ( flyingToken !== null ) { // This should always be true
                flyingToken = {...flyingToken, position: action.payload};
            }
            return {...state,
                mode: MouseMode.TurnToken, flyingToken,
                cursorStyle: 'crosshair',
            };
        },
        releaseToken: (state) => {
            return {...state,
                mode: MouseMode.Default, flyingToken: null,
                cursorStyle: 'default',
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
