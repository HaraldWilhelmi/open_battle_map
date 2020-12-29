import {WheelEvent, MouseEvent} from 'react';
import CSS from 'csstype';
import {useSelector, useDispatch} from 'react-redux';
import {Coordinate} from '../../api/Types';
import {
    RootState, MapProperties, GenericDispatch, MapZoom, MouseMode, MouseState, Tokens
} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {ZOOM_INCREMENT, getMapPositionFromPhysicalPosition, calculateMapFrame, getRotationFromTarget} from '../tools/Map';

interface Props {
  children: JSX.Element[] | JSX.Element
}

export function MapFrame(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const tokens: Tokens = useSelector(
        (state: RootState) => state.tokens
    );

    const doZoom = (event: WheelEvent) => {
        const physicalFocusPoint: Coordinate = {x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY}
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const mapZoom: MapZoom = {physicalFocusPoint, zoomFactorRatio};
        dispatch(actions.mapProperties.zoom(mapZoom));
    }

    const placeToken = (event: MouseEvent) => {
        switch ( mouse.mode ) {
            case MouseMode.MoveToken: {
                event.stopPropagation();
                const physicalPosition: Coordinate = {
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                };
                const position = getMapPositionFromPhysicalPosition(mapProperties, physicalPosition);
                dispatch(actions.tokens.positionOnMapForAdjustment(position));
                break;
            }
            case MouseMode.TurnToken: {
                event.stopPropagation();
                let token = tokens.flyingToken;
                if ( token !== null ) {  // Always true
                    const target: Coordinate = getMapPositionFromPhysicalPosition(mapProperties, {
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                    });
                    const rotation = getRotationFromTarget(token.position, target);
                    token = {...token, rotation};
                    dispatch(actions.tokens.placeOnMap(rotation));
                }
                dispatch(actions.mouse.releaseToken());
                break;
            }
            default: {break}
        }
    }


    const geometry = calculateMapFrame(mapProperties);

    const style: CSS.Properties = {
        position: 'absolute',
        left: geometry.leftTopCorner.x + 'px',
        top: geometry.leftTopCorner.y + 'px',
        width: geometry.width + 'px',
        height: geometry.height + 'px',
        overflow: 'hidden',
    };

    return (
        <div
            style={style}
            onWheel={doZoom}
            onClick={placeToken}
            onDragStart={placeToken}
        >
            {props.children}
        </div>
    );
}

export default MapFrame;
