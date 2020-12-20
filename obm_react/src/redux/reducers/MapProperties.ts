import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MapProperties} from '../Types';

export const INITIAL_STATE: MapProperties = {
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
    scale: 0,
};

export const slice = createSlice({
    name: 'mapProperties',
    initialState: INITIAL_STATE,
    reducers: {
        set: (state, action: PayloadAction<MapProperties>) => action.payload,
    },
});

export const mapPropertiesActions = slice.actions;

export default slice.reducer;