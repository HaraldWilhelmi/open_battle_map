import {useRef} from "react";
import Background from './Background';
import MapFrame from './MapFrame';
import TokensLayer from './TokensLayer';
import PointerLayer from "./PointerLayer";
import './Map.css'


export function Map() {
    const mapBoxRef = useRef<HTMLDivElement>(null);
    return (
        <div className="map-box" ref={mapBoxRef}>
            <MapFrame>
                <Background mapBoxRef={mapBoxRef}/>
                <TokensLayer />
                <PointerLayer />
            </MapFrame>
        </div>
    );
}

export default Map;