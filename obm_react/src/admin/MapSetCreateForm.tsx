import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import {MapSetCreate} from '../api/Types';
import {mapSetApi} from '../api/MapSet';
import {GenericDispatch} from '../redux/Types';
import {actions} from '../redux/Store';

export function MapSetCreateForm() {
    let [name, setName] = useState('');
    const dispatch: GenericDispatch = useDispatch();

    let updateMapSetList = () => dispatch(actions.mapSetList.get());

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    let myCreate = (event: React.FormEvent) => {
        let request: MapSetCreate = {name};
        mapSetApi.create(request);
        updateMapSetList();
        setName('');
        event.preventDefault();
    };

    return (
        <Form onSubmit={myCreate}>
            <InputGroup size="sm" className="mb-3">
                <FormControl value={name} onChange={onChange} placeholder="new map set name" size="sm" />
                <InputGroup.Append>
                    <Button type="submit" size="sm">Create</Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

export default MapSetCreateForm;