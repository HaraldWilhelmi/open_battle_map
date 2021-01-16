import TokenBox from './TokenBox';
import PointerBox from './PointerBox';
import MapLegend from "../components/MapLegend";


export function Play() {
    return (
        <div>
            <TokenBox />
            <PointerBox />
            <MapLegend />
        </div>
    );
}

export default Play;