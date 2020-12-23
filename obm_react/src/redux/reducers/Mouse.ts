import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MouseState, MouseMode, Coordinate} from '../Types';
import {mapPropertiesActions} from './MapProperties';

const INITIAL_STATE: MouseState = {
    mode: MouseMode.Default,
    lastSeen: null,
    token: null,
}

export const slice = createSlice({
    name: 'mouse',
    initialState: INITIAL_STATE,
    reducers: {
        grabMap: (state, action: PayloadAction<Coordinate>) => {
            return {mode: MouseMode.MoveMap, token: null, lastSeen: action.payload}
        },
        releaseMap: (state) => {
            return {mode: MouseMode.Default, token: null, lastSeen: null}
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
