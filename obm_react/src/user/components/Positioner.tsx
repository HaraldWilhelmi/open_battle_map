import CSS from 'csstype';
import {Coordinate} from "../../api/Types";


interface Props {
    position: Coordinate,
    children: JSX.Element[] | JSX.Element
}

export function Positioner(props: Props) {
    const style: CSS.Properties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        left: props.position.x + 'px',
        top: props.position.y + 'px',
        pointerEvents: 'none',
    };

    return <div style={style}>
        {props.children}
    </div>
}

export default Positioner;