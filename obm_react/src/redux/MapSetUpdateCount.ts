import {createSlice} from '@reduxjs/toolkit';


const initialState: number = 0;

export const slice = createSlice({
    name: 'mapSetUpdateCount',
    initialState: initialState,
    reducers: {
        increaseMapSetUpdateCount: (state) => state + 1,
    },
})

export const {
    increaseMapSetUpdateCount,
} = slice.actions;

export default slice.reducer;