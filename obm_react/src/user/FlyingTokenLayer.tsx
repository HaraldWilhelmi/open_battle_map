import {useState, useEffect, MouseEvent} from 'react';
import {useSelector} from 'react-redux';
import {MapSet, Coordinate} from '../api/Types';
import {RootState, MouseState, MouseMode} from '../redux/Types';
import {getTokenImageUrl} from './tools/Token';
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
                    if ( mouse.tokenId !== null ) {
                        const newTokenUrl = getTokenImageUrl(mapSet, mouse.tokenId);
                        if ( newTokenUrl !== tokenUrl ) {
                            setTokenUrl(newTokenUrl);
                            setTokenRotation(mouse.tokenRotation);
                            if ( mouse.lastSeen ) {
                                setTokenPosition(mouse.lastSeen);
                            }
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
                const deltaX = event.nativeEvent.clientX - tokenPosition.x;
                const deltaY = event.nativeEvent.clientY - tokenPosition.y;
                setTokenRotation(Math.atan2(deltaX, deltaY));
                break;
            }
            default: {break}
        }
    }

    const style: CSS.Properties = {
        position: 'relative',
        transform: 'rotate(' + tokenRotation + 'rad) translate(-50%, -50%)',
        left: tokenPosition.x + 'px',
        top: tokenPosition.y + 'px',
        zIndex: 1000,
        pointerEvents: 'none',
    };

    const token = tokenUrl === null ? <div /> : <img
        src={tokenUrl} style={style} alt="moving token"
    />;

    return <div className="flying-token-layer"
        onMouseMove={moveToken}
    >
        {token}
        {props.children}
    </div>;
}

export default FlyingTokenLayer;
