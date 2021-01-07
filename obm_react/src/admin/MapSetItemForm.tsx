import {ChangeEvent, FormEvent, useState} from 'react';
import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import {MapSet, MapSetId, MapSetListItem} from '../api/Types';
import {mapSetApi} from '../api/MapSet';
import {GenericDispatch, Mode} from '../redux/Types';
import {actions} from '../redux/Store';
import {handleUserAction} from "../common/Tools";


interface Props {
    item: MapSetListItem,
}

export function MapSetItemRow(props: Props) {
    let item: MapSetListItem = props.item;
    let [name, setName] = useState(item.name);
    const dispatch: GenericDispatch = useDispatch();

    let updateMapSetList = async () => await dispatch(actions.mapSetList.get());

    let onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    let myRename = async (event: FormEvent) => {
        event.preventDefault();
        await handleUserAction( async () => {
            const id: MapSetId = {uuid: props.item.uuid};
            let mapSet: MapSet = await mapSetApi.get(id);
            mapSet = {...mapSet, name};
            await mapSetApi.update(mapSet);
            await updateMapSetList();
        }, dispatch);
    };

    let myDelete = async () => {
        let warning = 'Really delete Background Set "' + item.name + '" ('
            + item.uuid + ')?'
        if (window.confirm(warning)) {
            await handleUserAction( async () => {
                const id: MapSetId = {uuid: props.item.uuid};
                await mapSetApi.remove(id);
                await updateMapSetList();
            }, dispatch);
        }
    };

    let myOpen = async () => {
        await handleUserAction( async () => {
            dispatch(actions.mode.set(Mode.User));
            window.location.href = '/' + item.uuid;
        }, dispatch);
    }

    return (
        <Form onSubmit={myRename}>
        <InputGroup size="sm" className="mb-3">
            <FormControl value={name} onChange={onChange} size="sm" />
            <InputGroup.Append>
                <Button type="submit" variant="outline-secondary" size="sm">Rename</Button>
                <Button onClick={myOpen} variant="outline-secondary" size="sm">Open</Button>
                <Button onClick={myDelete} variant="outline-secondary" size="sm">Delete</Button>
                <span className="input-group-text" id="basic-addon1">{item.uuid}</span>
            </InputGroup.Append>
        </InputGroup>
        </Form>
    );
}

export default MapSetItemRow;
