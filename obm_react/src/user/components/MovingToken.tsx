import {useDispatch, useSelector} from 'react-redux';
import {GenericDispatch, MapProperties, RootState, ActingTokenState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {getMapFramePositionFromMapPosition} from '../tools/Map';
import {TokenActionType, Coordinate} from "../../api/Types";
import {getTokenIdAsKeyframesName, getTokenWidthOnMap} from "../tools/Token";
import Positioner from "./Positioner";
import Animator from "./Animator";
import Token from './Token';


function getKeyFrames(token: ActingTokenState): string {
    switch (token.action_type) {
        case TokenActionType.added: {
            return `0% { transform: scale(3); opacity: 0.5; }
                    100% { transform: scale(1); opacity: 1; }`;
        }
        case TokenActionType.moved: {
            const fromPosition: Coordinate = token.fromPosition ?? {x: 0, y: 0};
            const dx = fromPosition.x - token.position.x;
            const dy = fromPosition.y - token.position.y;
            return `0% { transform: translate(${dx}px, ${dy}px); };
                    100% { transform: translate(0, 0); }`;
        }
        case TokenActionType.removed: {
           return `0% { transform: scale(1); opacity: 1;}
                   100% { transform: scale(3); opacity: 0.5;}`;
        }
    }
}


function noop() {}


interface Props {
    token: ActingTokenState,
}

export function MovingToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    function endAnimation() {
        dispatch(actions.tokens.endMove(props.token));
    }

    let positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);
    const tokenDescriptor = mapSet.token_set[props.token.token_type];
    const width = 1.1 * getTokenWidthOnMap(tokenDescriptor, battleMap, mapProperties);

    const animationId = 'animation-' + getTokenIdAsKeyframesName(props.token);
    const keyFrames = getKeyFrames(props.token)

    return <Positioner position={positionOnScreen}>
        <Animator id={animationId} animation="0.5s linear" keyframes={keyFrames} onAnimationEnd={endAnimation}>
            <Token
                tokenId={props.token}
                width={width}
                rotation={props.token.rotation}
                onClick={noop}
                onWheel={noop}
                pointerEvents={false}
            />
        </Animator>
    </Positioner>
}

export default MovingToken;