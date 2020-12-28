import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Message, MessageCategory} from '../Types';


type State = Message[];

function mergeMessage(state: State, category: MessageCategory, content: string): State {
    let message: Message = { category, content };
    console.log(category + ' ' + content);
    let newState: State = state.concat([message]);
    if ( newState.length > 3 ) {
        newState = newState.slice(-3);
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
        reset: () => [],
    },
});

export const messagesActions = slice.actions;

export default slice.reducer;
