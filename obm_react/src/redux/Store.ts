import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import messagesReducer, {messagesActions} from './reducers/Messages';
import syncerReducer, {syncerActions} from './reducers/Syncer';
import cookiesReducer, {cookiesActions} from './reducers/Cookies';
import modeReducer, {modeActions} from './reducers/Mode';
import mapSetReducer, {mapSetActions} from './reducers/MapSet';
import battleMapReducer, {battleMapActions} from './reducers/BattleMap';
import mapSetListReducer, {mapSetListActions} from './reducers/MapSetList';
import mapPropertiesReducer, {mapPropertiesActions} from './reducers/MapProperties';
import mouseReducer, {mouseActions} from './reducers/Mouse';
import placedTokensReducer, {placedTokensActions} from './reducers/PlacedTokens';
import defaultTokenSetReducer, {defaultTokenSetActions} from "./reducers/DefaultTokenSet";

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
        mouse: mouseReducer,
        placedTokens: placedTokensReducer,
        defaultTokenSet: defaultTokenSetReducer,
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
    mouse: mouseActions,
    placedTokens: placedTokensActions,
    defaultTokenSet: defaultTokenSetActions,
};

export default store;
