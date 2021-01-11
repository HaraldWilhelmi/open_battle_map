import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button'
import {actions} from '../redux/Store';
import {Mode} from '../redux/Types';
import './Admin.css';
import {handleUserAction} from "../common/Tools";


export function AdminLogout() {
    const dispatch = useDispatch();

    let myLogout = () => {
        handleUserAction( async () => {
            dispatch(actions.mode.set(Mode.User));
            dispatch(actions.cookies.setAdminSecret(undefined));
        }, dispatch);
    };
    return (
        <div className="logout">
            <Button onClick={myLogout}>Logout</Button>
        </div>
    );
}

export default AdminLogout;
