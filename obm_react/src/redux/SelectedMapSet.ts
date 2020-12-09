import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface BattleMapItem {
    uuid: string,
    name: string,
}

export interface MapSet {
    uuid: string,
    name: string,
    battle_maps: BattleMapItem[],
}

export const NO_SUCH_MAP_SET: MapSet = {
    uuid: 'NO_SUCH_MAP_SET',
    name: 'NO_SUCH_MAP_SET',
    battle_maps: [],
};

export const slice = createSlice({
    name: 'selectedMapSet',
    initialState: NO_SUCH_MAP_SET,
    reducers: {
        setSelectedMapSet: (state, action: PayloadAction<MapSet>) => action.payload,
    },
})

export const {
    setSelectedMapSet,
} = slice.actions;

export default slice.reducer;
