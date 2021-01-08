import {useEffect, useState} from "react";
import {useDispatch, useSelector} from 'react-redux';
import CSS from 'csstype';
import {GenericDispatch, MapProperties, RootState, ActingTokenState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {getMapFramePositionFromMapPosition} from '../tools/Map';
import Token from './Token';
import {TokenActionType, Coordinate} from "../../api/Types";
import {getTokenIdAsKeyframesName, getTokenType} from "../tools/Token";


function getKeyFrames(token: ActingTokenState): string {
    switch (token.action_type) {
        case TokenActionType.added: {
            return `0% { transform: scale(3); opacity: 50%; }
                    100% { transform: scale(1); opacity: 100%; }`;
        }
        case TokenActionType.moved: {
            const fromPosition: Coordinate = token.fromPosition ?? {x: 0, y: 0};
            const dx = fromPosition.x - token.position.x;
            const dy = fromPosition.y - token.position.y;
            return `0% { transform: translate(${dx}px, ${dy}px); };
                    100% { transform: translate(0, 0); }`;
        }
        case TokenActionType.removed: {
           return `0% { transform: scale(1); opacity: 100%;}
                   100% { transform: scale(3); opacity: 50%;}`;
        }
    }
}

interface Props {
    token: ActingTokenState,
}

export function MovingToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const [keyframesName, setKeyFramesName] = useState('');

    useEffect(
        () => {
            const newName = 'animation-' + getTokenIdAsKeyframesName(props.token);
            setKeyFramesName(newName);
            const newSheet: HTMLStyleElement = document.createElement('style');
            document.head.appendChild(newSheet);
            if ( newSheet.sheet !== null ) {
                newSheet.sheet.insertRule("@keyframes " + newName + " { " +
                    getKeyFrames(props.token)
                + " }");
            }

            return () => {
                if ( newSheet !== null ) {
                    document.head.childNodes.forEach(
                        (node) => {
                            if (newSheet.isSameNode(node)) {
                                document.head.removeChild(node);
                            }
                        }
                    );
                }
            }
        },
        [setKeyFramesName, props.token]
    );

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    const defaultTokenSet = useSelector(
        (state: RootState) => state.defaultTokenSet
    );

    if ( keyframesName === '' ) { return <div />; }

    function noop() {}

    function endAnimation() {
        dispatch(actions.tokens.endMove(props.token));
    }

    let positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);
    const tokenType = getTokenType(defaultTokenSet, props.token);
    const width = 1.1 * Math.max(
        tokenType.width_in_m * battleMap.background_pixels_per_meter * mapProperties.totalZoomFactor,
        30
    );

    const positionerStyle: CSS.Properties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        left: positionOnScreen.x + 'px',
        top: positionOnScreen.y + 'px',
        pointerEvents: 'none',
    };

    const animatorStyle: CSS.Properties = {
        pointerEvents: 'none',
        animation: keyframesName + ' 0.5s linear',
    };

    return <div style={positionerStyle} >
        <div style={animatorStyle} onAnimationEnd={endAnimation}>
            <Token
                tokenId={props.token}
                width={width}
                rotation={props.token.rotation}
                onClick={noop}
                onWheel={noop}
                pointerEvents={false}
            />
        </div>
    </div>
}

export default MovingToken;