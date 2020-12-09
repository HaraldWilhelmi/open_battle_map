import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {NO_SUCH_MAP_SET, MapSet, setSelectedMapSet} from '../redux/SelectedMapSet';
import {fetchMapSet} from './Tools';
import Work from './Work';
import AdminButton from './AdminButton';
import BattleMapSelector from './BattleMapSelector';
import './User.css'


export function User() {
    const dispatch: ReduxDispatch = useDispatch();
    const uuidByPath = window.location.pathname.substr(1);

    useEffect(
        () => {
            let timer: any;

            async function updateMapSet() {
                try {
                    let newMapSet = await fetchMapSet(dispatch, uuidByPath);
                    if ( newMapSet !== NO_SUCH_MAP_SET ) {
                        dispatch(setSelectedMapSet(newMapSet));
                    }
                }
                finally {
                    timer = setTimeout(updateMapSet, 60000);
                }
            }

            updateMapSet();
            return () => clearTimeout(timer);
        },
        [uuidByPath, dispatch]
    );

    let mapSetData: MapSet = useSelector(
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
                <div className="section">
                    <div className="menu-item"><h3>{mapSetData.name}</h3></div>
                    <div className="menu-item">
                        <label className="menu-label">Map:</label>
                        <div className="menu-field"><BattleMapSelector /></div>
                    </div>
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