import React, {Component} from 'react';
import {GlobalActionDirectory} from '../common/Types';
import './Admin.css';


export interface AdminLogoutProps {
    globalActionDirectory: GlobalActionDirectory,
}

export class AdminLogout extends Component<AdminLogoutProps> {
    constructor(props: AdminLogoutProps) {
        super(props);

        this.logout = this.logout.bind(this);
    }

    render() {
        return (
            <button onClick={this.logout}>Logout</button>
        );
    }

    logout() {
        this.props.globalActionDirectory.logoutAdmin();
    }
}

export default AdminLogout;
