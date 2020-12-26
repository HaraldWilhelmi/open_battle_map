import {useRef} from "react";
import Background from './Background';
import PlacedTokensLayer from './PlacedTokensLayer';
import MapFrame from './MapFrame';
import './Map.css'


export function Map() {
    const mapBoxRef = useRef<HTMLDivElement>(null);
    return (
        <div className="map-box" ref={mapBoxRef}>
            <MapFrame>
                <Background mapBoxRef={mapBoxRef}/>
                <PlacedTokensLayer />
            </MapFrame>
        </div>
    );
}

export default Map;