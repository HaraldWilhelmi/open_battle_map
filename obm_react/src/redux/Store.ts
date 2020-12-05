import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import messagesReducer from './Messages';
import mapSetsReducer from './MapSets';
import cookiesReducer from './Cookies'

export const store = configureStore({
    reducer: combineReducers({
        messages: messagesReducer,
        mapSets: mapSetsReducer,
        cookies: cookiesReducer,
    })
});

export default store;

export type ReduxDispatch = typeof store.dispatch;
