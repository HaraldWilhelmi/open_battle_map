import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {NO_SUCH_MAP_SET, MapSet} from '../redux/SelectedMapSet';
import {switchAdmin, switchMapSet} from './Tools';
import Map from './Map';
import Work from './Work';
import BattleMapSelector from './BattleMapSelector';
import DataRefresher from './DataRefresher';
import './User.css'


export function User() {
    const dispatch: ReduxDispatch = useDispatch();
    const uuidFromPath = window.location.pathname.substr(1);

    let mapSet: MapSet = useSelector(
        (state: RootState) => state.selectedMapSet
    );

    useEffect(
        () => {
            switchMapSet(dispatch, uuidFromPath);
            return undefined;
        },
        [uuidFromPath, dispatch]
    );

    let mySwitchAdmin = () => switchAdmin(dispatch);

    if ( mapSet.uuid === NO_SUCH_MAP_SET.uuid ) {
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
        <div className="user-screen">
            <DataRefresher />
            <div className="map-box">
                <Map />
            </div>
            <div className="menu-box">
                <div className="section">
                    <div className="menu-item"><h3>{mapSet.name}</h3></div>
                    <BattleMapSelector />
                </div>
                <div className="section">
                    <Tabs defaultActiveKey="play">
                        <Tab eventKey="play" title="Play">
                            <p className="menu-item">Todo</p>
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