import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MapSetItemRow from './MapSetItemRow';
import {MapSetCreateForm} from './MapSetCreateForm';
import AdminLogout from './AdminLogout';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {fetchAllMapSets} from './Tools';
import {MapSetList} from './Types';
import './Admin.css';


const INITIAL_MAP_SET_LIST: MapSetList = [];


function Admin() {
    const [mapSets, setMapSets] = useState(INITIAL_MAP_SET_LIST);
    const mapSetUpdateCount = useSelector((state: RootState) => state.mapSetUpdateCount);
    const dispatch: ReduxDispatch = useDispatch();

    useEffect(
        () => {
            let timer: any;

            async function updateMapSets() {
                try {
                    setMapSets(await fetchAllMapSets(dispatch));
                }
                finally {
                    timer = setTimeout(updateMapSets, 60000);
                }
            }

            updateMapSets();
            return () => clearTimeout(timer);
        },
        [mapSetUpdateCount, dispatch]
    );

    const mapSetItems = mapSets.map(
        (item) => ( <MapSetItemRow
                        key={item.uuid}
                        item={item}
        /> )
    )
    return (
        <div>
            <div className="App-header">
                <header className="App-header">
                    <h1>Open Battle Map</h1>
                </header>
            </div>
            <div className="Admin">
                <table className="Admin">
                    <tbody>
                        <tr>
                            <td colSpan={2}><MapSetCreateForm /></td>
                            <td><AdminLogout /></td>
                        </tr>
                        {mapSetItems}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Admin;
