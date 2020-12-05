import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {createMapSet} from './Tools';
import {ReduxDispatch} from '../redux/Store';

export function MapSetCreateForm() {
    let [name, setName] = useState('');
    const dispatch: ReduxDispatch = useDispatch();

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    let myCreate = (event: React.FormEvent) => {
        createMapSet(dispatch, name);
        event.preventDefault();
    };

    return (
        <form onSubmit={myCreate}>
            <input placeholder="new map set name" value={name} onChange={onChange} />
            <button type="submit">Create</button>
        </form>
    );
}

export default MapSetCreateForm;