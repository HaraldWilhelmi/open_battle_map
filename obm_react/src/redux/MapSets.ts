import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface MapSetItem {
    uuid: string,
    name: string,
}

export type MapSetList = MapSetItem[];

const initialState: MapSetList = [];

export const slice = createSlice({
    name: 'mapSets',
    initialState: initialState,
    reducers: {
        loadMapSets: (state, action: PayloadAction<MapSetList>) => action.payload,
    },
})

export const {
    loadMapSets,
} = slice.actions;

export default slice.reducer;