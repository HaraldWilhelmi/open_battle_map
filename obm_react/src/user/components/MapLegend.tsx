import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Types';
import {getNextNiceScaleExample} from '../tools/Map';


const MENU_WIDTH_PIXELS = 200;


export function MapLegend() {
    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    if ( battleMap === null ) {
        return <div />;
    }

    const pixelPerMeter = battleMap.background_pixels_per_meter * mapProperties.totalZoomFactor;
    const menuWidthInMapMeters = MENU_WIDTH_PIXELS / pixelPerMeter;
    const ruler = getNextNiceScaleExample(menuWidthInMapMeters);
    let isBlack = true;
    const totalLengthInPixel = ruler.total * pixelPerMeter;
    const partLengthInPixel = totalLengthInPixel / ruler.parts;
    let x = 0;
    let partLines = [];
    for ( let i = 0; i < ruler.parts; i++ ) {
        const css = isBlack ? "legend-black" : "legend-white";
        partLines[i] = <line x1={x} y1={8} x2={x+partLengthInPixel-1} y2={8} className={css} key={i}/>
        isBlack = ! isBlack;
        x += partLengthInPixel;
    }

    const svg = <svg width={MENU_WIDTH_PIXELS} height="10">
        <line x1="0" y1="3" x2={totalLengthInPixel-1} y2="3" className="legend-black"/>
        {partLines}
    </svg>;

    return (
        <div>
            <h4 className="menu-item">Map Scale</h4>
            <div className="menu-item">
                {svg}
            </div>
             <div className="menu-item">
                 {ruler.total} meters
            </div>
        </div>
    );
}

export default MapLegend;
