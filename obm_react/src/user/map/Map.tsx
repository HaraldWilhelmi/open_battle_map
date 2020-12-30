import {useRef} from "react";
import Background from './Background';
import TokensLayer from './TokensLayer';
import MapFrame from './MapFrame';
import './Map.css'


export function Map() {
    const mapBoxRef = useRef<HTMLDivElement>(null);
    return (
        <div className="map-box" ref={mapBoxRef}>
            <MapFrame>
                <Background mapBoxRef={mapBoxRef}/>
                <TokensLayer />
            </MapFrame>
        </div>
    );
}

export default Map;