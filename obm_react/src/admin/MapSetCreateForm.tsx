import React, {Component} from 'react';
import {GlobalActionDirectory} from '../common/Types';


export interface MapSetCreateFormProps {
    globalActionDirectory: GlobalActionDirectory,
}

interface MapSetCreateFormState {
    name: string,
}

export class MapSetCreateForm extends Component<MapSetCreateFormProps, MapSetCreateFormState> {
    constructor(props: MapSetCreateFormProps) {
        super(props);
        this.state = { name: '' };
        this.create = this.create.bind(this);
        this.change = this.change.bind(this);
    }

    change(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({name: event.target.value});
    }

    async create(event: React.FormEvent) {
        let response = await(
            fetch('/map_set/', {
                method:'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(this.state),
            })
        );
        event.preventDefault();
        this.props.globalActionDirectory.handleResponse(response);
    }

    render() {
        return (
            <form onSubmit={this.create}>
                <input placeholder="new map set name" name="map_set_name" onChange={this.change} />
                <button type="submit">Create</button>
            </form>
        );
    }
}

export default MapSetCreateForm;