import React, {Component} from 'react';
import {GlobalActionDirectory} from '../common/Types';
import './Admin.css';


export interface AdminLoginProps {
    globalActionDirectory: GlobalActionDirectory,
}

interface AdminLoginState {
    adminSecret: string,
}


export class AdminLogin extends Component<AdminLoginProps, AdminLoginState> {
    constructor(props: AdminLoginProps) {
        super(props);
        this.state = {
            adminSecret: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({adminSecret: event.target.value});
    }

    handleSubmit(event: React.FormEvent) {
        this.props.globalActionDirectory.loginAdmin(this.state.adminSecret);
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <div className="App-header">
                    <header className="App-header">
                        <h1>Open Battle Map</h1>
                    </header>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className="AdminLogin">
                        <label className="AdminLogin">Please enter admin secret:</label>
                        <input maxLength={128} value={this.state.adminSecret} onChange={this.handleChange} />
                        <button className="AdminLogin" type="submit">Login</button>
                        <div className="help">
                            (In doubt check .open_battle_map_rc in the application users home ...)
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

export default AdminLogin;