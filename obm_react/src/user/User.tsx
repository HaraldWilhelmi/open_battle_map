import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Button from 'react-bootstrap/Button';
import {BattleMapId, TokenActionHistoryId} from '../api/Types';
import {RootState, GenericDispatch, Mode} from '../redux/Types';
import {actions} from '../redux/Store';
import Messages from '../common/Messages';
import Map from './map/Map';
import FlyingTokenLayer from './FlyingTokenLayer';
import Menu from './menu/Menu';
import './User.css'


export function User() {
    const dispatch: GenericDispatch = useDispatch();
    const uuidFromPath = window.location.pathname.substr(1);

    let mapSet = useSelector(
        (state: RootState) => state.mapSet
    );
    let battleMap = useSelector(
        (state: RootState) => state.battleMap
    );
    let defaultTokenSet = useSelector(
        (state: RootState) => state.defaultTokenSet
    );

    let tokenActionHistory = useSelector(
        (state: RootState) => state.tokenActionHistory
    );

    useEffect( // Initial load of MapSet
        () => {
            if ( uuidFromPath.length < 10 ) {
                dispatch(actions.mapSet.invalidate());
            } else {
                dispatch(actions.mapSet.get({uuid: uuidFromPath}));
                dispatch(actions.mapProperties.reset());
            }
            return undefined;
        },
        [uuidFromPath, dispatch]
    );

    useEffect( // Load Battle Background if needed and possible
        () => {
            if ( mapSet === null || mapSet.battle_maps.length === 0) {
                if ( battleMap !== null ) {
                    dispatch(actions.battleMap.invalidate());
                }
                return undefined;
            }

            if ( battleMap !== null ) {
                if ( battleMap.map_set_uuid === mapSet.uuid ) {
                    return undefined;
                }
            }

            const battleMapId: BattleMapId = {
                uuid: mapSet.battle_maps[0].uuid,
                map_set_uuid: mapSet.uuid,
            }
            dispatch(actions.battleMap.get(battleMapId));
            dispatch(actions.tokens.loadTokensFromServer());
            return undefined;
        },
        [mapSet, battleMap, dispatch]
    );

    useEffect( // Load Token History
        () => {
            if (battleMap === null) {
                if (tokenActionHistory !== null) {
                    dispatch(actions.tokenActionHistory.invalidate());
                }
            } else {
                if (
                    tokenActionHistory === null
                    || tokenActionHistory.map_set_uuid !== battleMap.map_set_uuid
                    || tokenActionHistory.uuid !== battleMap.uuid
                ) {
                    const tokenActionHistoryId: TokenActionHistoryId = {
                        ...battleMap,
                        since: battleMap.token_action_count
                    };
                    dispatch(actions.tokenActionHistory.get(tokenActionHistoryId));
                }
            }
            return undefined;
        },
        [battleMap, tokenActionHistory, dispatch]
    );

    useEffect(() => {
            if ( defaultTokenSet === null ) {
                dispatch(actions.defaultTokenSet.get());
            }
            return undefined;
        },
        [defaultTokenSet, dispatch]
    );

    useEffect( () => {
        if ( mapSet !== null && defaultTokenSet !== null && ( battleMap !== null || mapSet.battle_maps.length === 0 ) ) {
            dispatch(actions.mapSet.startSync());
            dispatch(actions.battleMap.startSync());
            dispatch(actions.defaultTokenSet.startSync());
            dispatch(actions.tokenActionHistory.startSync());
        }
        return () => {
            dispatch(actions.mapSet.stopSync());
            dispatch(actions.battleMap.stopSync());
            dispatch(actions.defaultTokenSet.stopSync());
            dispatch(actions.tokenActionHistory.stopSync());
        };
    });

    let mySwitchAdmin = () => {
        dispatch(actions.messages.reset());
        dispatch(actions.mode.set(Mode.Admin));
    };

    if ( mapSet === null ) {
        return (
            <div>
                <h1>No such Map Set</h1>
                <p>Please either supply a correct URL or login as
                &nbsp;
                <Button onClick={mySwitchAdmin}>Administrator</Button>
                </p>
            </div>
        );
    }
    return (
        <div>
            <FlyingTokenLayer>
                <div className="main-layer">
                    <Map />
                    <div className="menu-box-vertical-ruler" />
                    <Menu />
                </div>
            </FlyingTokenLayer>
            <Messages />
        </div>
    );
}

export default User;