import {useSelector} from 'react-redux';
import {MapProperties, RootState} from '../../redux/Types';
import {getMapFramePositionFromMapPosition} from '../tools/Map';
import {Coordinate, PointerAction} from "../../api/Types";
import Positioner from "./Positioner";
import Animator from "./Animator";
import Pointer from './Pointer';


export interface PointerMove extends PointerAction {
    fromPosition: Coordinate,
}


function getKeyFrames(move: PointerMove): string {
    const dx = move.fromPosition.x - move.position.x;
    const dy = move.fromPosition.y - move.position.y;
    return `
        0% { transform: translate(${dx}px, ${dy}px); };
        100% { transform: translate(0, 0); }`;
}

interface Props {
    move: PointerMove,
    finish: () => void,
}

export function MovingPointer(props: Props) {
    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const keyframes = getKeyFrames(props.move);

    let positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.move.position);
    return <Positioner position={positionOnScreen}>
        <Animator
            id={'pointer-' + props.move.uuid}
            animation="0.05s linear"
            keyframes={keyframes}
        >
            <Pointer color={props.move.color} fades={true} onAnimationEnd={props.finish} />
        </Animator>
    </Positioner>;
}

export default MovingPointer;