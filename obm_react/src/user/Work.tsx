import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {AdminButton} from './AdminButton';
import './User.css'


export function Work() {
    const dispatch: ReduxDispatch = useDispatch();

    return (
        <div>
            <AdminButton />

            <h4 className="menu-item">Map Set</h4>
            <button className="menu-item">Download</button>
            <button className="menu-item">Upload</button>

            <h4 className="menu-item">Battle Map</h4>
            <button className="menu-item">Upload Image</button>
            <div className="menu-item">
                <button className="menu-label">Create</button>
                <input className="menu-field" placeholder="name" />
            </div>
            <div className="menu-item">
                <button className="menu-label">Rename</button>
                <input className="menu-field" placeholder="name" />
            </div>
            <button className="menu-item">Delete</button>
        </div>
    );
}

export default Work;