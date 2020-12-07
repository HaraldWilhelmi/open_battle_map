import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {updateSelectedMapSet} from './Tools';
import {NO_SUCH_MAP_SET, SelectedMapSet} from '../redux/SelectedMapSet';
import {AdminButton} from './AdminButton';
import './User.css'


export function User() {
    const dispatch: ReduxDispatch = useDispatch();

    useEffect(() => {
        let myPath = window.location.pathname;
        let uuid = myPath.substr(1);
        updateSelectedMapSet(dispatch, uuid);
        return undefined;
    });

    let mapSetData: SelectedMapSet = useSelector(
        (state: RootState) => state.selectedMapSet
    );

    if ( mapSetData === NO_SUCH_MAP_SET ) {
        return ( <AdminButton /> );
    }
    return (
        <div className="user-screen">
            <div className="map-box">
                <p>Todo</p>
            </div>
            <div className="menu-box">
                <div className="menu-item"><h3>{mapSetData.name}</h3></div>
                <div className="menu-item">Map: </div>
                <Tabs defaultActiveKey="play">
                    <Tab eventKey="play" title="Play">
                        <p className="menu-item">Todo</p>
                    </Tab>
                    <Tab eventKey="work" title="Work">
                        <AdminButton />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

export default User;