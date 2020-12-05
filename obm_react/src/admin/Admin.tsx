import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MapSetItemRow from './MapSetItemRow';
import {MapSetCreateForm} from './MapSetCreateForm';
import AdminLogout from './AdminLogout';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSetList} from '../redux/MapSets';
import {updateMapSets} from './Tools';
import './Admin.css';


function Admin() {
    const mapSets: MapSetList = useSelector(
        (state: RootState) => state.mapSets
    );
    const dispatch: ReduxDispatch = useDispatch();

    useEffect(() => {
        updateMapSets(dispatch);
        return undefined;
    });

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
