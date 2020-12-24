import {TokenId, TokenState} from '../../api/Types';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {placeToken, removeToken} from '../../user/tools/Token';

const INITIAL_STATE: TokenState[] = [];

export const slice = createSlice({
    name: 'placedTokens',
    initialState: INITIAL_STATE,
    reducers: {
        place: (state, action: PayloadAction<TokenState>) => placeToken(state, action.payload),
        remove: (state, action: PayloadAction<TokenId>) => removeToken(state, action.payload),
    },
});

export const placedTokensActions = slice.actions;

export default slice.reducer;

