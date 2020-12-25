import {useState, useEffect, useRef, MouseEvent} from 'react';
import {useSelector} from 'react-redux';
import {MapSet, Coordinate} from '../api/Types';
import {RootState, MouseState, MouseMode} from '../redux/Types';
import {getTokenImageUrl} from './tools/Token';
import {getRotationFromTarget} from './tools/Map';
import CSS from 'csstype';


const INITIAL_TOKEN_URL: string | null = null;
const INITIAL_TOKEN_POSITION: Coordinate = {x: 0, y: 0};


interface Props {
  children: JSX.Element[] | JSX.Element
}


export function FlyingTokenLayer(props: Props) {
    const [tokenUrl, setTokenUrl] = useState(INITIAL_TOKEN_URL);
    const [tokenRotation, setTokenRotation] = useState(0.0);
    const [tokenPosition, setTokenPosition] = useState(INITIAL_TOKEN_POSITION);

    const layerRef = useRef<HTMLDivElement>(null);

    const mapSet: MapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    useEffect(
        () => {
            switch ( mouse.mode ) {
                case MouseMode.MoveToken: {
                    if ( mouse.flyingToken !== null ) {
                        const newTokenUrl = getTokenImageUrl(mapSet, mouse.flyingToken);
                        if ( newTokenUrl !== tokenUrl ) {
                            setTokenUrl(newTokenUrl);
                            setTokenRotation(mouse.flyingToken.rotation);
                            setTokenPosition(mouse.flyingToken.position);
                        }
                    }
                    break;
                }
                case MouseMode.TurnToken: { break; }
                default: {
                    if ( tokenUrl !== null ) {
                        setTokenUrl(null);
                    }
                }
            }
        },
        [mouse, mapSet, tokenUrl]
    );

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
                const position: Coordinate = {
                    x: event.nativeEvent.clientX,
                    y: event.nativeEvent.clientY,
                };
                setTokenPosition(position);
                break;
            }
            case MouseMode.TurnToken: {
                event.stopPropagation();
                const target: Coordinate = {
                    x: event.nativeEvent.clientX,
                    y: event.nativeEvent.clientY,
                };
                const rotation = getRotationFromTarget(tokenPosition, target);
                setTokenRotation(rotation);
                break;
            }
            default: {break}
        }
    }

    const layerStyle: CSS.Properties = {
        cursor: mouse.cursorStyle,
    };

    const tokenStyle: CSS.Properties = {
        position: 'relative',
        transform: 'translate(-50%, -50%) rotate(' + tokenRotation + 'rad)',
        left: tokenPosition.x + 'px',
        top: tokenPosition.y + 'px',
        zIndex: 1000,
        pointerEvents: 'none',
    };

    const token = tokenUrl === null ? <div /> : <img
        src={tokenUrl} style={tokenStyle} alt="moving token"
    />;

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
