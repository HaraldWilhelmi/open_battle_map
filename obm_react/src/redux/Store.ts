import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import messagesReducer from './Messages';
import mapSetUpdateCountReducer from './MapSetUpdateCount';
import cookiesReducer from './Cookies';
import modeReducer from './Mode';
import selectedMapSetReducer from './SelectedMapSet';

export const store = configureStore({
    reducer: combineReducers({
        messages: messagesReducer,
        mapSetUpdateCount: mapSetUpdateCountReducer,
        cookies: cookiesReducer,
        mode: modeReducer,
        selectedMapSet: selectedMapSetReducer,
    })
});

export default store;

export type ReduxDispatch = typeof store.dispatch;
