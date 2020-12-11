import {useState} from 'react';
import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import {ReduxDispatch} from '../redux/Store';
import {MapSetItem} from './Types';
import {setMode, Mode} from '../redux/Mode';
import {resetMessages} from '../redux/Messages';
import {renameMapSet, deleteMapSet} from './Tools';

interface Props {
    item: MapSetItem,
}

export function MapSetItemRow(props: Props) {
    let item: MapSetItem = props.item;
    let [name, setName] = useState(item.name);
    const dispatch: ReduxDispatch = useDispatch();

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    let myRename = (event: React.FormEvent) => {
        renameMapSet(dispatch, props.item.uuid, name);
        event.preventDefault();
    };

    let myDelete = () => {
        let warning = 'Really delete Map Set "' + item.name + '" ('
            + item.uuid + ')?'
        if (window.confirm(warning)) {
            deleteMapSet(dispatch, props.item.uuid);
        }
    };

    let myOpen = () => {
        dispatch(resetMessages());
        dispatch(setMode(Mode.User));
        window.location.href = '/' + item.uuid;
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
