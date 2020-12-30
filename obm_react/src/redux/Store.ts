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
import tokensReducer, {tokensActions} from './reducers/Tokens';
import defaultTokenSetReducer, {defaultTokenSetActions} from "./reducers/DefaultTokenSet";
import localTokenActionTrackReducer, {localTokenActionTrackActions} from "./reducers/LocalTokenActionTrack";
import tokenActionHistoryReducer, {tokenActionHistoryActions} from "./reducers/TokenActionHistory";

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
        tokens: tokensReducer,
        defaultTokenSet: defaultTokenSetReducer,
        localTokenActionTrack: localTokenActionTrackReducer,
        tokenActionHistory: tokenActionHistoryReducer,
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
    tokens: tokensActions,
    defaultTokenSet: defaultTokenSetActions,
    localTokenActionTrack: localTokenActionTrackActions,
    tokenActionHistory: tokenActionHistoryActions,
};

export default store;
