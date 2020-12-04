import React, {Component} from 'react';
import {MapSetItem, GlobalActionDirectory} from '../common/Types';


export interface MapSetItemRowProps {
    item: MapSetItem,
    globalActionDirectory: GlobalActionDirectory,
}

export class MapSetItemRow extends Component<MapSetItemRowProps> {
    constructor(props: MapSetItemRowProps) {
        super(props);

        this.goto = this.goto.bind(this);
    }

    render() {
        let item: MapSetItem = this.props.item;
        return (
            <tr>
                <td><button onClick={this.goto}>{item.name}</button></td>
                <td className="help">({item.uuid})</td>
            </tr>
        );
    }

    goto() {
        this.props.globalActionDirectory.selectMapSet(this.props.item.uuid);
    }
}

export default MapSetItemRow;
