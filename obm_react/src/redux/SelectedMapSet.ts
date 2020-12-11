import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface BattleMapItem {
    uuid: string,
    name: string,
}

export interface MapSet {
    uuid: string,
    name: string,
    battle_maps: BattleMapItem[],
    is_refreshing?: boolean,
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
        setSelectedMapSet: (state, action: PayloadAction<MapSet>) => {
            return {...action.payload, is_refreshing: false };
        },
        startMapSetRefresh: (state) => {
            if ( state.uuid === NO_SUCH_MAP_SET.uuid ) {
                return state;
            } else {
                return {...state, is_refreshing: true};
            }
        },
        finishMapSetRefresh: (state, action: PayloadAction<MapSet>) => {
            if ( state.is_refreshing === true ) {
                return {...action.payload, is_refreshing: false};
            } else {
                return state;
            }
        },
        abortMapSetRefresh: (state) => {
            if ( state.uuid === NO_SUCH_MAP_SET.uuid ) {
                return state;
            } else {
                return {...state, is_refreshing: false};
            }
        },
    },
})

export const {
    setSelectedMapSet,
    startMapSetRefresh,
    finishMapSetRefresh,
    abortMapSetRefresh,
} = slice.actions;

export default slice.reducer;
