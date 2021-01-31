import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Mode} from '../Types';

export const slice = createSlice({
    name: 'mode',
    initialState: Mode.User,
    reducers: {
        set: (state, action: PayloadAction<Mode>) => action.payload,
    },
})

export const modeActions = slice.actions;

export default slice.reducer;
