import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Button from 'react-bootstrap/Button';
import {BattleMapId} from '../api/Types';
import {RootState, GenericDispatch, Mode} from '../redux/Types';
import {actions} from '../redux/Store';
import Messages from '../common/Messages';
import Map from './map/Map';
import Menu from './menu/Menu';
import FlyingTokenLayer from './FlyingTokenLayer';
import TokenImages from './TokenImages';
import Keyboard from './Keybooard';
import './User.css';


export function User() {
    const dispatch: GenericDispatch = useDispatch();
    const uuidFromPath = window.location.pathname.substr(1);

    let mapSet = useSelector(
        (state: RootState) => state.mapSet
    );
    let battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    useEffect( // Initial load of MapSet
        () => {
            dispatch(actions.mapSet.startSync({uuid: uuidFromPath}));
            dispatch(actions.mapProperties.reset());
            return () => { dispatch(actions.mapSet.stopSync()) };
        },
        [uuidFromPath, dispatch]
    );

    useEffect( // Load Battle Map if needed and possible
        () => {
            if ( mapSet === null || mapSet.battle_maps.length === 0) {
                if ( battleMap !== null ) {
                    dispatch(actions.battleMap.invalidate());
                    dispatch(actions.actionHistory.invalidate());
                    return undefined;
                }
            } else if ( battleMap === null || battleMap.map_set_uuid !== mapSet.uuid ) {
                const battleMapId: BattleMapId = {
                    uuid: mapSet.battle_maps[0].uuid,
                    map_set_uuid: mapSet.uuid,
                }
                dispatch(actions.battleMap.startSync(battleMapId));
                dispatch(actions.tokens.loadTokensFromServer());
                return () => { dispatch(actions.battleMap.stopSync()) };
            }
            return undefined;
        },
        [mapSet, battleMap, dispatch]
    );

    useEffect( // Load Token History
        () => {
            if (battleMap === null) {
                return undefined;
            }
            dispatch(actions.actionHistory.startSync(battleMap));
            return () => { dispatch(actions.actionHistory.stopSync()) };
        },
        [battleMap, dispatch]
    );

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
            <Keyboard />
            <TokenImages />
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
