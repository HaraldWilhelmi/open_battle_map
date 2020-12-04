import React, {Component} from 'react';
import {GlobalActionDirectory} from '../common/Types';
import {AdminButton} from './AdminButton';


export interface UserProps {
    globalActionDirectory: GlobalActionDirectory,
}


export class User extends Component<UserProps> {
    render() {
        return (
            <div className="User">
                <header className="App-header">
                    <h1>Open Battle Map - User</h1>
                </header>
                <AdminButton globalActionDirectory={this.props.globalActionDirectory} />
            </div>
        );
    }
}

export default User;