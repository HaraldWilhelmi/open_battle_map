import {useEffect, useRef, WheelEvent, MouseEvent} from 'react';
import CSS from 'csstype';
import {useSelector, useDispatch} from 'react-redux';
import {BattleMap, Coordinate} from '../api/Types';
import {
    RootState, MapProperties, GenericDispatch, GeometryUpdate, MapZoom, MapMove,
    MouseMode, MouseState
} from '../redux/Types';
import {actions} from '../redux/Store';
import {ZOOM_INCREMENT, getMapPositionFromScaledPosition} from './tools/Map';


export function Map() {
    const dispatch: GenericDispatch = useDispatch();
    const mapFrameRef = useRef<HTMLImageElement>(null);
    const mapRef = useRef<HTMLImageElement>(null);

    const battleMap: BattleMap | null = useSelector(
        (state: RootState) => state.battleMap
    );

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const detectGeometryChange = () => {
        const map = mapRef.current;
        const frame = mapFrameRef.current;
        const widthAvailable = frame?.clientWidth ?? 0;
        const heightAvailable = frame?.clientHeight ?? 0;
        const naturalWidth = map?.naturalWidth ?? 0;
        const naturalHeight = map?.naturalHeight ?? 0;

        if ( widthAvailable === 0 || heightAvailable === 0 || naturalWidth === 0 || naturalHeight === 0 ) {
            return;
        }

        if (
            widthAvailable === mapProperties.widthAvailable && heightAvailable === mapProperties.heightAvailable &&
            naturalWidth === mapProperties.naturalWidth && naturalHeight === mapProperties.naturalHeight
        ) {
            return;
        }
        const geometryUpdate: GeometryUpdate = {widthAvailable, heightAvailable, naturalWidth, naturalHeight};
        dispatch(actions.mapProperties.updateGeometry(geometryUpdate));
    }

    const doZoom = (event: WheelEvent) => {
        const focusPoint = getMapPositionFromScaledPosition(
            mapProperties, {x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY}
        );
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const mapZoom: MapZoom = {focusPoint, zoomFactorRatio};
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

    useEffect(() => {
        window.addEventListener("resize", detectGeometryChange);
        return () => window.removeEventListener("resize", detectGeometryChange);
    });

    if ( battleMap === null ) {
        return ( <p>:-(</p> );
    }

    const style: CSS.Properties = {
        width: mapProperties.width + 'px',
        height: mapProperties.height + 'px',
        left: mapProperties.xOffset + 'px',
        top: mapProperties.yOffset + 'px',
    };

    // The query parameter is actually unused, but ensures a refresh/render of the image.
    const url = '/api/image_data/'
        + battleMap.map_set_uuid + '/'
        + battleMap.uuid
        + '?v=' + battleMap.background_revision;

    return (
        <div className="map-frame" ref={mapFrameRef}>
            <img
                src={url}
                style={style}
                alt="Battle Map Background"
                className="map-image"
                ref={mapRef}
                onLoad={detectGeometryChange}
                onWheel={doZoom}
                onMouseDown={enterMapMove}
                onMouseUp={leaveMapMove}
                onMouseLeave={leaveMapMove}
                onMouseMove={doMapMove}
            />
        </div>
    );
}

export default Map;
