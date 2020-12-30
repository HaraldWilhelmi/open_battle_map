import {MouseEvent, WheelEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CSS from 'csstype';
import {Coordinate, TokenState} from '../../api/Types';
import {GenericDispatch, MapProperties, MapZoom, MouseMode, MouseState, RootState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {
    getMapFramePositionFromMapPosition,
    getScaledBackgroundPositionFromMapPosition,
    ZOOM_INCREMENT
} from '../tools/Map';
import Token from './Token';


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
            dispatch(actions.tokens.pickupFromMap(flyingToken));
        }
    }

    function doZoom (event: WheelEvent) {
        event.stopPropagation();
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const physicalFocusPoint = getScaledBackgroundPositionFromMapPosition(mapProperties, props.token.position);
        const mapZoom: MapZoom = {physicalFocusPoint, zoomFactorRatio};
        dispatch(actions.mapProperties.zoom(mapZoom));
    }

    let positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);

    const style: CSS.Properties = {
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        left: positionOnScreen.x + 'px',
        top: positionOnScreen.y + 'px',
        pointerEvents: 'none',
    };

    return <div style={style}>
        <Token
            tokenId={props.token}
            width={70}
            rotation={props.token.rotation}
            onClick={pickupToken}
            onWheel={doZoom}
            pointerEvents={mouse.mode === MouseMode.Default}
        />
    </div>
}

export default PlacedToken;