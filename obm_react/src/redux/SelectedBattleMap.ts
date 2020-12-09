import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface BattleMap {
    uuid: string,
    name: string,
    mapSetUuid: string,
}

export const NO_SUCH_BATTLE_MAP: BattleMap = {
    uuid: 'NO_SUCH_MAP',
    name: 'NO_SUCH_MAP',
    mapSetUuid: 'NO_SUCH_MAP_SET',
};

export const slice = createSlice({
    name: 'selectedBattleMap',
    initialState: NO_SUCH_BATTLE_MAP,
    reducers: {
        setSelectedBattleMap: (state, action: PayloadAction<BattleMap>) => action.payload,
    },
})

export const {
    setSelectedBattleMap,
} = slice.actions;

export default slice.reducer;
