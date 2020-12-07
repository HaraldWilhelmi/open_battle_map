import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import Cookies from 'universal-cookie';
import {ReduxDispatch} from '../redux/Store';
import {setAdminSecret, CookieNames} from '../redux/Cookies';
import {setMode, Mode} from '../redux/Mode';
import {resetMessages} from '../redux/Messages';
import './Admin.css';

const cookies = new Cookies();

export function AdminLogin() {
    let [secret, setSecret] = useState('');
    const dispatch: ReduxDispatch = useDispatch();

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSecret(event.target.value);
    };

    let myLogin = (event: React.FormEvent) => {
        dispatch(resetMessages());
        cookies.set(CookieNames.obm_admin_secret, secret, {maxAge: 31622400});
        dispatch(setAdminSecret(secret));
        dispatch(setMode(Mode.Admin));
        event.preventDefault();
    };

    let myCancel = () => {
        dispatch(setMode(Mode.User));
    };

    return (
        <div>
            <div className="App-header">
                <header className="App-header">
                    <h1>Open Battle Map</h1>
                </header>
            </div>
            <form onSubmit={myLogin}>
                <div className="AdminLogin">
                    <label className="AdminLogin">Please enter admin secret:</label>
                    <input maxLength={128} value={secret} onChange={onChange} />
                    <button className="AdminLogin" type="submit">Login</button>
                    <div className="help">
                        (In doubt check .open_battle_map_rc in the application users home ...)
                    </div>
                    <button className="AdminLogin" onClick={myCancel}>Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default AdminLogin;