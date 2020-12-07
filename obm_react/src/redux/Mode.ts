import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export enum Mode {
    Admin = 'Admin',
    AdminLogin = 'AdminLogin',
    User = 'User',
}

export const slice = createSlice({
    name: 'cookies',
    initialState: Mode.User,
    reducers: {
        setMode: (state, action: PayloadAction<Mode>) => action.payload,
    },
})

export const {
    setMode,
} = slice.actions;

export default slice.reducer;