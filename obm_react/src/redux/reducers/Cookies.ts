import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';
import {CookieData, CookieNames} from '../Types';


const cookies = new Cookies();

function getCookieData(): CookieData {
    return {
        adminSecret: cookies.get(CookieNames.obm_admin_secret) ?? undefined,
    };
}

const initialState: CookieData = getCookieData();

export const slice = createSlice({
    name: 'cookies',
    initialState: initialState,
    reducers: {
        setAdminSecret: (state, action: PayloadAction<string|undefined>) => {
            const adminSecret = action.payload;
            const newState = {...state, adminSecret};
            if ( adminSecret === undefined ) {
                cookies.remove(CookieNames.obm_admin_secret);
            } else {
                cookies.set(
                    CookieNames.obm_admin_secret,
                    action.payload,
                    {maxAge: 31622400, sameSite: 'strict'}
                );
            }
            return newState;
        },
    },
})

export const cookiesActions = slice.actions;

export default slice.reducer;
