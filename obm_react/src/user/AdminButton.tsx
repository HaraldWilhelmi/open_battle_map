import {useDispatch} from 'react-redux';
import {Mode,setMode} from '../redux/Mode';
import {resetMessages} from '../redux/Messages';

export function AdminButton() {
    const dispatch = useDispatch();

    let switchAdmin = () => {
        dispatch(resetMessages());
        dispatch(setMode(Mode.Admin));
    }

    return (
        <button onClick={switchAdmin} className="menu-item">Administrator</button>
    );
}

export default AdminButton;
