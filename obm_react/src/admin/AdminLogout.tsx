import {useDispatch} from 'react-redux';
import Cookies from 'universal-cookie';
import {CookieNames, setAdminSecret} from '../redux/Cookies';
import {Mode, setMode} from '../redux/Mode';
import './Admin.css';

const cookies = new Cookies();

export function AdminLogout() {
    const dispatch = useDispatch();

    let myLogout = () => {
        dispatch(setMode(Mode.User));
        dispatch(setAdminSecret(undefined));
        cookies.remove(CookieNames.obm_admin_secret);
    };
    return (
        <button onClick={myLogout}>Logout</button>
    );
}

export default AdminLogout;
