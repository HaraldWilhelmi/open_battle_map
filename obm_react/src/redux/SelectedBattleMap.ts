import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export interface BattleMap {
    uuid: string,
    name: string,
    map_set_uuid: string,
    background_revision: number,
    is_refreshing?: boolean,
}

export const NO_SUCH_BATTLE_MAP: BattleMap = {
    uuid: 'NO_SUCH_BATTLE_MAP',
    name: 'NO_SUCH_BATTLE_MAP',
    map_set_uuid: 'NO_SUCH_MAP_SET',
    background_revision: 0,
}

export const slice = createSlice({
    name: 'selectedBattleMap',
    initialState: NO_SUCH_BATTLE_MAP,
    reducers: {
        setSelectedBattleMap: (state, action: PayloadAction<BattleMap>) => {
            return {...action.payload, is_refreshing: false};
        },
        startBattleMapRefresh: (state) => {
            if ( state.uuid === NO_SUCH_BATTLE_MAP.uuid ) {
                return state;
            } else {
                return {...state, is_refreshing: true};
            }
        },
        finishBattleMapRefresh: (state, action: PayloadAction<BattleMap>) => {
            if ( state.is_refreshing === true ) {
                return {...action.payload, is_refreshing: false};
            } else {
                return state;
            }
        },
        abortBattleMapRefresh: (state) => {
            if ( state.uuid === NO_SUCH_BATTLE_MAP.uuid ) {
                return state;
            } else {
                return {...state, is_refreshing: false};
            }
        }
    },
})

export const {
    setSelectedBattleMap,
    startBattleMapRefresh,
    finishBattleMapRefresh,
    abortBattleMapRefresh,
} = slice.actions;

export default slice.reducer;
