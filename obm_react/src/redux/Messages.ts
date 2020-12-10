import {createSlice, PayloadAction} from '@reduxjs/toolkit';


export enum MessageCategory {
    Error,
    Success,
}

export interface Message {
    category: MessageCategory,
    content: string,
}

export interface RequestResult {
    resetMessages: boolean,
    message?: Message,
}

type State = Message[];

function mergeMessage(state: State, category: MessageCategory, content: string): State {
    let message: Message = { category, content };
    let newState: State = state.concat([message]);
    if ( newState.length > 5 ) {
        newState = newState.slice(-5);
    }
    return newState;
}

const initialState: State = [];

export const slice = createSlice({
    name: 'messages',
    initialState: initialState,
    reducers: {
        reportError: (state, action: PayloadAction<string>) =>
            mergeMessage(state, MessageCategory.Error, action.payload),
        reportSuccess: (state, action: PayloadAction<string>) =>
            mergeMessage(state, MessageCategory.Success, action.payload),
        resetMessages: () => [],
    },
})

export const {
    reportError,
    reportSuccess,
    resetMessages,
} = slice.actions;

export default slice.reducer;
