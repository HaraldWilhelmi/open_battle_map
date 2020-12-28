import {MouseEvent, useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {Coordinate} from '../api/Types';
import {MouseMode, MouseState, RootState, Tokens} from '../redux/Types';
import {getRotationFromTarget} from './tools/Map';
import Token from './components/Token';
import CSS from 'csstype';

const INITIAL_TOKEN_POSITION: Coordinate = {x: 0, y: 0};

interface Props {
  children: JSX.Element[] | JSX.Element
}


export function FlyingTokenLayer(props: Props) {
    const [rotation, setRotation] = useState(0.0);
    const [position, setPosition] = useState(INITIAL_TOKEN_POSITION);
    const layerRef = useRef<HTMLDivElement>(null);

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const tokens: Tokens = useSelector(
        (state: RootState) => state.tokens
    )

    useEffect(() => {
            const layer = layerRef.current;
            if ( layer?.style?.cursor ) {
                layer.style.cursor = mouse.cursorStyle;
            }
            return undefined;
        },
        [mouse]
    );

    const moveToken = (event: MouseEvent) => {
        switch ( mouse.mode ) {
            case MouseMode.MoveToken: {
                event.stopPropagation();
                const newPosition: Coordinate = {
                    x: event.nativeEvent.clientX,
                    y: event.nativeEvent.clientY,
                };
                setPosition(newPosition);
                break;
            }
            case MouseMode.TurnToken: {
                event.stopPropagation();
                const target: Coordinate = {
                    x: event.nativeEvent.clientX,
                    y: event.nativeEvent.clientY,
                };
                const rotation = getRotationFromTarget(position, target);
                setRotation(rotation);
                break;
            }
            default: {break}
        }
    }

    const layerStyle: CSS.Properties = {
        cursor: mouse.cursorStyle,
    };

    function doNothing(event: MouseEvent|WheelEvent) {}

    let token = <div />;

    if ( tokens.flyingToken !== null ) {
        const divStyle: CSS.Properties = {
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            left: position.x + 'px',
            top: position.y + 'px',
            zIndex: 1000,
            pointerEvents: 'none',
        };
        token = <div style={divStyle}>
            <Token
                tokenId={tokens.flyingToken}
                width={75}
                rotation={rotation}
                onClick={doNothing}
                onWheel={doNothing}
                pointerEvents={false}
            />
        </div>
    }

    return <div className="flying-token-layer"
        onMouseMove={moveToken}
        style={layerStyle}
        ref={layerRef}
    >
        {token}
        {props.children}
    </div>;
}

export default FlyingTokenLayer;
