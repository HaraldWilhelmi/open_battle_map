import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface BattleMapItem {
    uuid: string,
    name: string,
}

export interface SelectedMapSet {
    uuid: string,
    name: string,
    battleMaps: BattleMapItem[],
}

export const NO_SUCH_MAP_SET: SelectedMapSet = {
    uuid: 'NO_SUCH_MAP_SET',
    name: 'NO_SUCH_MAP_SET',
    battleMaps: [],
};

export const slice = createSlice({
    name: 'selectedMapSet',
    initialState: NO_SUCH_MAP_SET,
    reducers: {
        setSelectedMapSet: (state, action: PayloadAction<SelectedMapSet>) => action.payload,
    },
})

export const {
    setSelectedMapSet,
} = slice.actions;

export default slice.reducer;