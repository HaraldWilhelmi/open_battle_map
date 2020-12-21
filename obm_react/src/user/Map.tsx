import {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {BattleMap} from '../api/Types';
import {RootState, MapProperties, GenericDispatch} from '../redux/Types';
import {actions} from '../redux/Store';


export function Map() {
    const dispatch: GenericDispatch = useDispatch();
    const mapFrameRef = useRef<HTMLImageElement>(null);
    const mapRef = useRef<HTMLImageElement>(null);

    let battleMap: BattleMap | undefined = useSelector(
        (state: RootState) => state.battleMap
    );

    useEffect(
        () => {
            const map = mapRef.current;
            const frame = mapFrameRef.current;
            const mapProperties: MapProperties = {
                width: frame?.clientWidth ?? 0,
                height: frame?.clientHeight ?? 0,
                naturalWidth: map?.width ?? 0,
                naturalHeight: map?.height ?? 0,
                scale: ( frame?.clientWidth ?? 1 )  / ( map?.naturalWidth ?? 1 ),
            }
            console.log("Map properties: " + JSON.stringify(mapProperties));
            dispatch(actions.mapProperties.set(mapProperties));
            return undefined;
        },
        [dispatch, battleMap]
    );

    if ( battleMap === null ) {
        return ( <p>:-(</p> );
    }

    // The query parameter is actually unused, but ensures a refresh/render of the image.
    let url = '/api/image_data/'
        + battleMap.map_set_uuid + '/'
        + battleMap.uuid
        + '?v=' + battleMap.background_revision;

    return (
        <div className="map-outer-frame">
            <div className="map-inner-frame" ref={mapFrameRef}>
                <img src={url} alt="Battle Map Background" className="map" ref={mapRef}/>
            </div>
        </div>
    );
}

export default Map;
