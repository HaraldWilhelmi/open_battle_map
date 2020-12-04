import React, {Component} from 'react';
import {Mode, GlobalActionDirectory} from '../common/Types';
import {MapSetItem} from '../common/Types';
import {MapSetItemRow} from './MapSetItemRow';
import {MapSetCreateForm} from './MapSetCreateForm';
import AdminLogout from './AdminLogout';
import './Admin.css';


export interface AdminProps {
    globalActionDirectory: GlobalActionDirectory,
}

interface AdminState {
    mapSets: MapSetItem[],
    message?: string,
}


export class Admin extends Component<AdminProps, AdminState> {
    state: AdminState = {
        mapSets: [],
        message: undefined,
    };

    render() {
        let message = <div />;
        if ( this.state.message != null ) {
            message = <div className="App-message">{this.state.message}</div>
        }
        let mapSetList = this.state.mapSets.map(
            (item) => ( <MapSetItemRow
                            key={item.uuid}
                            item={item}
                            globalActionDirectory={this.props.globalActionDirectory}
            /> )
        )
        return (
            <div>
                <div className="App-header">
                    <header className="App-header">
                        <h1>Open Battle Map</h1>
                    </header>
                </div>
                {message}
                <div className="Admin">
                    <table className="Admin">
                        <tbody>
                            <tr>
                                <td><MapSetCreateForm globalActionDirectory={this.props.globalActionDirectory} /></td>
                                <td><AdminLogout globalActionDirectory={this.props.globalActionDirectory} /></td>
                            </tr>
                            {mapSetList}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.update();
    }

    async update() {
        let response = await(fetch('/map_set/list_all'));
        if (response.ok) {
            let mapSets = await(response.json());
            this.setState({mapSets: mapSets})
        } else {
            this.handleError(response);
        }
        this.props.globalActionDirectory.handleResponse(response);
    }

    handleError(response: Response) {
        if (response.status === 401) {
            this.props.globalActionDirectory.setMode(Mode.AdminLogin);
        }
    }
}

export default Admin;
