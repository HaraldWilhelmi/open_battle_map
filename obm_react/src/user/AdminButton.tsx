import React, {Component} from 'react';
import {GlobalActionDirectory, Mode} from '../common/Types';


export interface AdminButtonProps {
    globalActionDirectory: GlobalActionDirectory,
}

export class AdminButton extends Component<AdminButtonProps> {
    constructor(props: AdminButtonProps) {
        super(props);

        this.login = this.login.bind(this);
    }

    render() {
        return (
            <button onClick={this.login}>Administrator</button>
        );
    }

    login() {
        this.props.globalActionDirectory.setMode(Mode.Admin);
    }
}

export default AdminButton;
