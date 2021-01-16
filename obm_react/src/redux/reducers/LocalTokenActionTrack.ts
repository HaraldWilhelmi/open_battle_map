import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export const INITIAL_STATE: string[] = [];

export const slice = createSlice({
    name: 'localTokenActionTrack',
    initialState: INITIAL_STATE,
    reducers: {
        log: (state, action: PayloadAction<string>) => [...state, action.payload],
        forget: (state, action: PayloadAction<string>) => {
            for ( let i = 0; i < state.length; i++ ) {
                if ( state[i] === action.payload ) {
                    return [
                        ...state.slice(0, i),
                        ...state.slice(i+1, state.length),
                    ];
                }
            }
            console.log('LocalTokenActionTrack failed to forget unknown Token Action ' + action.payload);
        },
        reset: () => INITIAL_STATE,
    },
});

export const localTokenActionTrackActions = slice.actions;

export default slice.reducer;
