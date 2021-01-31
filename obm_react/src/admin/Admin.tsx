import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MapSetItemForm from './MapSetItemForm';
import MapSetCreateForm from './MapSetCreateForm';
import AdminLogout from './AdminLogout';
import {MapSetList} from '../api/Types';
import {RootState, GenericDispatch} from '../redux/Types';
import {actions} from '../redux/Store';
import Messages from '../common/Messages';
import './Admin.css';


function Admin() {
    const dispatch: GenericDispatch = useDispatch();
    const mapSetList: MapSetList | null = useSelector(
        (state: RootState) => state.mapSetList
    );

    useEffect(
        () => {
            dispatch(actions.mapSetList.startSync(undefined));
            return () => {
                dispatch(actions.mapSetList.stopSync());
            };
        },
        [dispatch]
    );

    if ( mapSetList === null ) {
        return <div>No Map Sets loaded yet.</div>
    }

    const mapSetItems = mapSetList.map(
        (item) => (
            <div className="box-item" key={item.uuid}>
                <MapSetItemForm
                        item={item}
                />
            </div>
        )
    )
    return (
        <div>
            <Messages />
            <div className="App-header">
                <header className="App-header">
                    <h1>Open Battle Map</h1>
                </header>
            </div>
            <AdminLogout />
            <div className="item-box">
                <div className="box-item">
                    <MapSetCreateForm />
                </div>
                {mapSetItems}
            </div>
        </div>
    );
}

export default Admin;
