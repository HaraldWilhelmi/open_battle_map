import {useDispatch} from 'react-redux';
import Cookies from 'universal-cookie';
import Button from 'react-bootstrap/Button'
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
        <div className="logout">
            <Button onClick={myLogout}>Logout</Button>
        </div>
    );
}

export default AdminLogout;
