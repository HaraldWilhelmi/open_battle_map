import {useEffect, useRef, WheelEvent} from 'react';
import CSS from 'csstype';
import {useSelector, useDispatch} from 'react-redux';
import {BattleMap} from '../api/Types';
import {
    RootState, MapProperties, GenericDispatch, GeometryUpdate, MapZoom
} from '../redux/Types';
import {actions} from '../redux/Store';


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

    console.log("Map Properties: " + JSON.stringify(mapProperties));

    const detectGeometryChange = () => {
        const map = mapRef.current;
        const frame = mapFrameRef.current;
        const widthAvailable = frame?.clientWidth ?? 0;
        const heightAvailable = frame?.clientHeight ?? 0;
        const naturalWidth = map?.naturalWidth ?? 0;
        const naturalHeight = map?.naturalHeight ?? 0;

        if ( widthAvailable === 0 || heightAvailable === 0 || naturalWidth === 0 || naturalHeight === 0 ) {
            console.log('detectGeometryChange: Essential data not present!');
            return;
        }

        if (
            widthAvailable === mapProperties.widthAvailable && heightAvailable === mapProperties.heightAvailable &&
            naturalWidth === mapProperties.naturalWidth && naturalHeight === mapProperties.naturalHeight
        ) {
            return;
        }
        const geometryUpdate: GeometryUpdate = {widthAvailable, heightAvailable, naturalWidth, naturalHeight};
        console.log("Geometry Update: " + JSON.stringify(geometryUpdate));
        dispatch(actions.mapProperties.updateGeometry(geometryUpdate));
    }

    const doZoom = (event: WheelEvent) => {
        const mapZoom: MapZoom = {
            mousePosition: {x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY},
            zoomFactorRatio: event.deltaY < 0 ? 1.2 : 1 / 1.2,
        };
        console.log("Map Zoom: " + JSON.stringify(mapZoom));
        dispatch(actions.mapProperties.zoom(mapZoom));
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
            />
        </div>
    );
}

export default Map;
