import {useState, useEffect, MouseEvent} from 'react';
import {useSelector} from 'react-redux';
import {Coordinate} from '../api/Types';
import {
    RootState, MapProperties, MouseState, MouseMode
} from '../redux/Types';
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

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    useEffect(
        () => {
            switch ( mouse.mode ) {
                case MouseMode.MoveToken: {
                    if ( mouse.tokenId !== null ) {
                        const newTokenUrl = getTokenImageUrl(mouse.tokenId);
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
        [mouse, tokenUrl]
    );

    const moveToken = (event: MouseEvent) => {
        switch ( mouse.mode ) {
            case MouseMode.MoveToken: {
                const position: Coordinate = {
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                };
                setTokenPosition(position);
                break;
            }
            case MouseMode.TurnToken: {
                const deltaX = event.nativeEvent.offsetX - tokenPosition.x;
                const deltaY = event.nativeEvent.offsetY - tokenPosition.y;
                setTokenRotation(Math.atan2(deltaX, deltaY));
                break;
            }
            default: {break}
        }
    }

    const style: CSS.Properties = {
        position: 'relative',
        transform: 'rotation: ' + tokenRotation + 'rad',
        left: tokenPosition.x + 'px',
        top: tokenPosition.y + 'px',
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
