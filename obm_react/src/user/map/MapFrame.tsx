import {WheelEvent, MouseEvent} from 'react';
import CSS from 'csstype';
import {useSelector, useDispatch} from 'react-redux';
import {Coordinate} from '../../api/Types';
import {
    RootState, MapProperties, GenericDispatch, MapZoom, MapMove, MouseMode, MouseState, Tokens
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

    const enterMapMove = (event: MouseEvent) => {
        event.preventDefault();
        if ( mouse.mode === MouseMode.Default ) {
            const position: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            dispatch(actions.mouse.grabMap(position));
        }
    }

    const leaveMapMove = () => {
        if ( mouse.mode === MouseMode.MoveMap ) {
            dispatch(actions.mouse.releaseMap());
        }
    }

    const doMapMove = (event: MouseEvent) => {
        if ( mouse.mode === MouseMode.MoveMap ) {
            const oldX = mouse?.lastSeen?.x ?? -1;
            const oldY = mouse?.lastSeen?.y ?? -1;
            if ( oldX >= 0 && oldY >= 0 ) {
                const mapMove: MapMove = {
                    deltaX: event.nativeEvent.clientX - oldX,
                    deltaY: event.nativeEvent.clientY - oldY,
                };
                dispatch(actions.mapProperties.move(mapMove));
            } else {
                dispatch(actions.mouse.releaseMap());
            }
        }
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
            onMouseDown={enterMapMove}
            onMouseUp={leaveMapMove}
            onMouseLeave={leaveMapMove}
            onMouseMove={doMapMove}
            onClick={placeToken}
            onDragStart={placeToken}
        >
            {props.children}
        </div>
    );
}

export default MapFrame;
