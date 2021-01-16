import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {v4 as uuidV4} from 'uuid';
import {Coordinate} from '../../api/Types';
import {MouseState, MouseMode} from '../Types';
import {mapPropertiesActions} from './MapProperties';

const INITIAL_STATE: MouseState = {
    mode: MouseMode.Default,
    lastSeen: null,
    cursorStyle: 'default',
    pointerColor: null,
    pointerUuid: null,
}

export const slice = createSlice({
    name: 'mouse',
    initialState: INITIAL_STATE,
    reducers: {
        grabMap: (state, action: PayloadAction<Coordinate>) => ({
            ...state, mode: MouseMode.MoveMap, lastSeen: action.payload, cursorStyle: 'move',
        }),
        releaseMap: (state) => ({
            ...state, mode: MouseMode.Default, cursorStyle: 'default',
        }),
        grabToken: (state, action: PayloadAction<Coordinate | null>) => ({
            ...state, mode: MouseMode.MoveToken, cursorStyle: 'move', lastSeen: action.payload,
        }),
        placeToken: (state) => ({
            ...state, mode: MouseMode.TurnToken, cursorStyle: 'crosshair'
        }),
        releaseToken: (state) => ({
            ...state, mode: MouseMode.Default, cursorStyle: 'default', lastSeen: null,
        }),
        startMeasurement: (state) => ({
            ...state, mode: MouseMode.MeasureFrom, cursorStyle: 'crosshair', lastSeen: null
        }),
        selectMeasurementPostion: (state, action: PayloadAction<Coordinate>) => ({
            ...state, mode: MouseMode.MeasureTo, lastSeen: action.payload
        }),
        stopMeasurement: (state) => ({
            ...state, mode: MouseMode.Default, cursorStyle: 'default', lastSeen: null
        }),
        startPointer: (state, action: PayloadAction<string>) => ({
            ...state, mode: MouseMode.Pointer, cursorStyle: 'pointer',
            pointerColor: action.payload, pointerUuid: uuidV4()
        }),
        stopPointer: (state) => ({
            ...state, mode: MouseMode.Default, cursorStyle: 'default',
            pointerColor: null
        }),
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
