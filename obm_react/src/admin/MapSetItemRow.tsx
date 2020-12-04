import React, {Component} from 'react';
import {MapSetItem, GlobalActionDirectory} from '../common/Types';


export interface MapSetItemRowProps {
    item: MapSetItem,
    globalActionDirectory: GlobalActionDirectory,
}

interface State {
    name: string,
}

interface UpdateRequest {
    uuid: string,
    name: string,
}

interface DeleteRequest {
    uuid: string,
}

export class MapSetItemRow extends Component<MapSetItemRowProps, State> {
    constructor(props: MapSetItemRowProps) {
        super(props);
        this.state = { name: props.item.name }
        this.open = this.open.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.rename = this.rename.bind(this);
        this.delete = this.delete.bind(this);
    }

    render() {
        let item: MapSetItem = this.props.item;
        return (
            <tr>
                <td>
                    <form onSubmit={this.rename}>
                        <input value={this.state.name} onChange={this.handleChange} />
                        <button type="submit">Rename</button>
                    </form>
                </td>
                <td>
                    <button onClick={this.open}>Open</button>
                    <button onClick={this.delete}>Delete</button>
                </td>
                <td className="help">
                    ({item.uuid})
                </td>
            </tr>
        );
    }

    handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({name: event.target.value});
    }

    async rename(event: React.FormEvent) {
        let body: UpdateRequest = {
            uuid: this.props.item.uuid,
            name: this.state.name,
        }
        let response = await(
            fetch('/map_set/', {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })
        );
        this.props.globalActionDirectory.handleResponse(response);
        event.preventDefault();
    }

    open() {
        this.props.globalActionDirectory.selectMapSet(this.props.item.uuid);
    }

    async delete() {
        let body: DeleteRequest = {
            uuid: this.props.item.uuid,
        }
        let response = await(
            fetch('/map_set/', {
                method:'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(body),
            })
        );
        this.props.globalActionDirectory.handleResponse(response);
    }
}

export default MapSetItemRow;
