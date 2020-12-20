import {useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {BattleMap} from '../api/Types';
import {RootState, MapProperties, GenericDispatch} from '../redux/Types';
import {actions} from '../redux/Store';


export function Map() {
    const dispatch: GenericDispatch = useDispatch();
    const mapRef = useRef<HTMLImageElement>(null);

    let battleMap: BattleMap | undefined = useSelector(
        (state: RootState) => state.battleMap
    );

    useEffect(
        () => {
            const map = mapRef.current;
            const mapProperties: MapProperties = {
                width: map?.width ?? 0,
                height: map?.height ?? 0,
                naturalWidth: map?.naturalWidth ?? 0,
                naturalHeight: map?.naturalHeight ?? 0,
                scale: ( map?.width ?? 1 )  / ( map?.naturalWidth ?? 1 ),
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
        <img src={url} alt="Battle Map Background" className="map" ref={mapRef}/>
    );
}

export default Map;
