import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';

export enum CookieNames {
    obm_mode = 'obm_mode',
    obm_admin_secret = 'obm_admin_secret',
    obm_selected_map_set = 'obm_selected_map_set',
    obm_known_map_sets = 'obm_known_map_sets',
}

export enum Mode {
    Admin = 'Admin',
    AdminLogin = 'AdminLogin',
    User = 'User',
}

export interface CookieData {
    mode: Mode,
    adminSecret?: string,
    selectedMapSet?: string,
    knownMapSets: string[],
}

const cookies = new Cookies();

function getCookieData(): CookieData {
    return {
        mode: getModeFromCookie(),
        adminSecret: getAdminSecretFromCookie(),
        selectedMapSet: getSelectedMapSetFromCookie(),
        knownMapSets: getKnownMapSetsFromCookie(),
    };
}

function copyCookieData(x: CookieData): CookieData {
    return {
        mode: x.mode,
        adminSecret: x.adminSecret,
        selectedMapSet: x.selectedMapSet,
        knownMapSets: [...x.knownMapSets],
    };
}

function getModeFromCookie(): Mode {
    const value: Mode | undefined = cookies.get(CookieNames.obm_mode);
    if ( value === Mode.Admin ) {
        return Mode.Admin;
    } else {
        return Mode.User;
    }
}

function getAdminSecretFromCookie(): string | undefined {
    return cookies.get(CookieNames.obm_admin_secret);
}

function getSelectedMapSetFromCookie(): string | undefined {
    return cookies.get(CookieNames.obm_selected_map_set);
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
        setMode: (state, action: PayloadAction<Mode>) => {
            let newState = copyCookieData(state);
            newState.mode = action.payload;
            return newState;
        },
        setAdminSecret: (state, action: PayloadAction<string|undefined>) => {
            let newState = copyCookieData(state);
            newState.adminSecret = action.payload;
            return newState;
        },
        setSelectedMapSet: (state, action: PayloadAction<string>) => {
            let newState = copyCookieData(state);
            newState.selectedMapSet = action.payload;
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
    setMode,
    setAdminSecret,
    setSelectedMapSet,
    setKnownMapSets,
} = slice.actions;

export default slice.reducer;