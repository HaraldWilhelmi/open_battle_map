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

const initialState: State = [];

export const slice = createSlice({
    name: 'messages',
    initialState: initialState,
    reducers: {
        reportError: (state, action: PayloadAction<string>) => state.concat([
            {category: MessageCategory.Error, content: action.payload}
        ]),
        reportSuccess: (state, action: PayloadAction<string>) => state.concat([
            {category: MessageCategory.Success, content: action.payload}
        ]),
        reportRequestResult: (state, action: PayloadAction<RequestResult>) => {
            let oldMessages: Message[] = [];
            if ( ! action.payload.resetMessages ) {
                oldMessages = state;
            }
            let newMessage = action.payload.message;
            return newMessage == null
                ? oldMessages
                : oldMessages.concat([newMessage]);
        },
        resetMessages: () => [],
    },
})

export const {
    reportError,
    reportSuccess,
    reportRequestResult,
    resetMessages,
} = slice.actions;

export default slice.reducer;
