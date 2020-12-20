import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import messagesReducer, {messagesActions} from './reducers/Messages';
import syncerReducer, {syncerActions} from './reducers/Syncer';
import cookiesReducer, {cookiesActions} from './reducers/Cookies';
import modeReducer, {modeActions} from './reducers/Mode';
import mapSetReducer, {mapSetActions} from './reducers/MapSet';
import battleMapReducer, {battleMapActions} from './reducers/BattleMap';
import mapSetListReducer, {mapSetListActions} from './reducers/MapSetList';
import mapPropertiesReducer, {mapPropertiesActions} from './reducers/MapProperties'

export const store = configureStore({
    reducer: combineReducers({
        messages: messagesReducer,
        syncer: syncerReducer,
        cookies: cookiesReducer,
        mode: modeReducer,
        mapSet: mapSetReducer,
        battleMap: battleMapReducer,
        mapSetList: mapSetListReducer,
        mapProperties: mapPropertiesReducer,
    })
});

export const actions = {
    messages: messagesActions,
    syncer: syncerActions,
    cookies: cookiesActions,
    mode: modeActions,
    mapSet: mapSetActions,
    battleMap: battleMapActions,
    mapSetList: mapSetListActions,
    mapProperties: mapPropertiesActions,
};

export default store;
