import {useDispatch, useSelector} from 'react-redux';
import styled, {keyframes, css} from 'styled-components';
import {GenericDispatch, MapProperties, RootState, MovingTokenState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {getMapFramePositionFromMapPosition} from '../tools/Map';
import Token from './Token';
import {Coordinate} from "../../api/Types";


interface PositionerProps {
    readonly from: Coordinate;
    readonly to: Coordinate;
}

function move(from: Coordinate, to: Coordinate) {
    return keyframes`
        0% { left: ${from.x}px; top: ${from.y} };
        100% { left: ${to.x}px; top: ${to.y} }
    `;
}

const Positioner = styled.div<PositionerProps>`
    position: absolute;
    transform: translate(-50%, -50%);
    left: ${props => props.to.x}px;
    top: ${props => props.to.y}px;
    pointer-events: none;
    animation: ${props => move(props.from, props.to)} 0.5s linear;
`;


interface Props {
    token: MovingTokenState,
}

export function MovingToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    function noop() {}

    function endAnimation() {
        dispatch(actions.tokens.endMove(props.token));
    }

    let fromPositionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);
    let toPositionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.toPosition);

    const move = keyframes`
        0% { transform: rotate(${props.token.rotation}rad); };
        100% { transform: rotate(${props.token.toRotation}rad); }
    `;

    const animation = css`${move} 0.5s linear;`;

    return <Positioner from={fromPositionOnScreen} to={toPositionOnScreen} onAnimationEnd={endAnimation}>
        <Token
            tokenId={props.token}
            width={70}
            rotation={props.token.toRotation}
            onClick={noop}
            onWheel={noop}
            pointerEvents={false}
            animation={animation}
        />
    </Positioner>
}

export default MovingToken;