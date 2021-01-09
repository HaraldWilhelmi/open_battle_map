import {MouseEvent, WheelEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import CSS from 'csstype';
import {Coordinate, TokenState} from '../../api/Types';
import {FlyingToken, GenericDispatch, MapZoom, MouseMode, RootState} from '../../redux/Types';
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

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    function pickupToken(event: MouseEvent) {
        if ( mouse.mode === MouseMode.Default ) {
            event.stopPropagation();
            event.preventDefault();
            const positionOverGround: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const flyingToken: FlyingToken = {...props.token,
                positionOverGround
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

    const positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);
    const tokeDescriptor = mapSet.token_set[props.token.token_type];
    const width = Math.max(
        tokeDescriptor.width_in_m * battleMap.background_pixels_per_meter * mapProperties.totalZoomFactor,
        25
    );

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
            width={width}
            rotation={props.token.rotation}
            onClick={pickupToken}
            onWheel={doZoom}
            pointerEvents={mouse.mode === MouseMode.Default}
        />
    </div>
}

export default PlacedToken;