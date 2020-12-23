import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import {BattleMapId} from '../api/Types';
import {RootState, GenericDispatch, Mode} from '../redux/Types';
import {actions} from '../redux/Store';
import Map from './Map';
import Work from './Work';
import Play from './Play';
import BattleMapSelector from './BattleMapSelector';
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

    useEffect( // Load Battle Map if needed and possible
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
            return undefined;
        },
        [mapSet, battleMap, dispatch]
    );

    useEffect( () => {
        dispatch(actions.mapSet.startSync());
        dispatch(actions.battleMap.startSync());
        return () => {
            dispatch(actions.mapSet.stopSync());
            dispatch(actions.battleMap.stopSync());
        };
    })

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
        <div className="user-screen max-height">
            <Map />
            <div className="menu-box">
                <div className="section">
                    <div className="menu-item"><h3>{mapSet.name}</h3></div>
                    <BattleMapSelector />
                </div>
                <div className="section">
                    <Tabs defaultActiveKey="play">
                        <Tab eventKey="play" title="Play">
                            <Play />
                        </Tab>
                        <Tab eventKey="work" title="Work">
                            <Work />
                        </Tab>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

export default User;