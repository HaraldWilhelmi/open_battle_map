import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button'
import {actions} from '../redux/Store';
import {Mode} from '../redux/Types';
import './Admin.css';


export function AdminLogout() {
    const dispatch = useDispatch();

    let myLogout = () => {
        dispatch(actions.mode.set(Mode.User));
        dispatch(actions.cookies.setAdminSecret(undefined));
    };
    return (
        <div className="logout">
            <Button onClick={myLogout}>Logout</Button>
        </div>
    );
}

export default AdminLogout;
