import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import Button from 'react-bootstrap/Button'
import Messages from '../common/Messages';
import {GenericDispatch, Mode} from '../redux/Types';
import {actions} from '../redux/Store';
import './Admin.css';
import {handleUserAction} from "../common/Tools";


export function AdminLogin() {
    let [secret, setSecret] = useState('');
    const dispatch: GenericDispatch = useDispatch();

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSecret(event.target.value);
    };

    let myLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        await handleUserAction( () => {
            dispatch(actions.cookies.setAdminSecret(secret));
            dispatch(actions.mode.set(Mode.Admin));
        }, dispatch);
    };

    let myCancel = async () => {
        await handleUserAction( () => {
            dispatch(actions.mode.set(Mode.User));
        }, dispatch);
    };

    return (
        <div>
            <Messages />
            <div className="App-header">
                <header className="App-header">
                    <h1>Open Battle Map</h1>
                </header>
            </div>
            <form onSubmit={myLogin}>
                <div className="AdminLogin">
                    <label className="AdminLogin">Please enter admin secret:</label>
                    <input maxLength={128} value={secret} onChange={onChange} />
                    <Button className="AdminLogin" type="submit">Login</Button>
                    <div className="help">
                        (In doubt check .open_battle_map_rc in the home directory of the application user ...)
                    </div>
                    <Button className="AdminLogin" onClick={myCancel}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}

export default AdminLogin;