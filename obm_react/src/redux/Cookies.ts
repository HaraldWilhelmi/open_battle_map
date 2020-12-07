import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';

export enum CookieNames {
    obm_admin_secret = 'obm_admin_secret',
    obm_known_map_sets = 'obm_known_map_sets',
}

export interface CookieData {
    adminSecret?: string,
    knownMapSets: string[],
}

const cookies = new Cookies();

function getCookieData(): CookieData {
    return {
        adminSecret: getAdminSecretFromCookie(),
        knownMapSets: getKnownMapSetsFromCookie(),
    };
}

function copyCookieData(x: CookieData): CookieData {
    return {
        adminSecret: x.adminSecret,
        knownMapSets: [...x.knownMapSets],
    };
}

function getAdminSecretFromCookie(): string | undefined {
    return cookies.get(CookieNames.obm_admin_secret);
}

function getKnownMapSetsFromCookie(): string[] {
    const value: string = cookies.get('obm_known_map_sets');
    if ( value == null ) {
        return [];
    }
    return value.split(',');
}

const initialState: CookieData = getCookieData();

export const slice = createSlice({
    name: 'cookies',
    initialState: initialState,
    reducers: {
        setAdminSecret: (state, action: PayloadAction<string|undefined>) => {
            let newState = copyCookieData(state);
            newState.adminSecret = action.payload;
            return newState;
        },
        setKnownMapSets: (state, action: PayloadAction<string[]>) => {
            let newState = copyCookieData(state);
            newState.knownMapSets = action.payload;
            return newState;
        },
    },
})

export const {
    setAdminSecret,
    setKnownMapSets,
} = slice.actions;

export default slice.reducer;