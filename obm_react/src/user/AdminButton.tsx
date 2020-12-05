import {useDispatch} from 'react-redux';
import {Mode,setMode} from '../redux/Cookies';

export function AdminButton() {
    const dispatch = useDispatch();

    let switchAdmin = () => {
        dispatch(setMode(Mode.Admin));
    }

    return (
        <button onClick={switchAdmin}>Administrator</button>
    );
}

export default AdminButton;
