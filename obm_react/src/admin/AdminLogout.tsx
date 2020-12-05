import {useDispatch} from 'react-redux';
import Cookies from 'universal-cookie';
import {Mode, CookieNames, setMode, setAdminSecret} from '../redux/Cookies';
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
