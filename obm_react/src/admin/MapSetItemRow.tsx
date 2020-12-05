import {useState} from 'react';
import {useDispatch} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {MapSetItem} from '../redux/MapSets';
import {setMode, Mode, setSelectedMapSet} from '../redux/Cookies';
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
        dispatch(setSelectedMapSet(item.uuid));
        dispatch(setMode(Mode.User));
    }

    return (
        <tr>
            <td>
                <form onSubmit={myRename}>
                    <input value={name} onChange={onChange} />
                    <button type="submit">Rename</button>
                </form>
            </td>
            <td>
                <button onClick={myOpen}>Open</button>
                <button onClick={myDelete}>Delete</button>
            </td>
            <td className="help">
                ({item.uuid})
            </td>
        </tr>
    );
}

export default MapSetItemRow;
