import {MouseEvent, WheelEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import CSS from 'csstype';
import {TokenState, Coordinate} from '../../api/Types';
import {RootState, GenericDispatch, MouseMode, MouseState, MapProperties, MapZoom} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {getPhysicalPositionFromMapPosition, ZOOM_INCREMENT} from '../tools/Map';
import Token from './Token';


const MAP_BORDER_PIXELS = 1;


interface Props {
    token: TokenState,
}

export function PlacedToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    function pickupToken(event: MouseEvent) {
        if ( mouse.mode === MouseMode.Default ) {
            event.stopPropagation();
            event.preventDefault();
            const position: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const flyingToken: TokenState = {...props.token,
                position
            };
            dispatch(actions.mouse.grabToken(flyingToken));
            dispatch(actions.placedTokens.remove(props.token));
        }
    }

    function doZoom (event: WheelEvent) {
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const focusPoint = props.token.position;
        const mapZoom: MapZoom = {focusPoint, zoomFactorRatio};
        dispatch(actions.mapProperties.zoom(mapZoom));
    }

    let positionOnScreen = getPhysicalPositionFromMapPosition(mapProperties, props.token.position);
    positionOnScreen.x += MAP_BORDER_PIXELS;
    positionOnScreen.y += MAP_BORDER_PIXELS;

    const style: CSS.Properties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        left: positionOnScreen.x + 'px',
        top: positionOnScreen.y + 'px',
    };

    return <div style={style}>
        <Token
            tokenId={props.token}
            width={70}
            rotation={props.token.rotation}
            onClick={pickupToken}
            onWheel={doZoom}
        />
    </div>
}

export default PlacedToken;