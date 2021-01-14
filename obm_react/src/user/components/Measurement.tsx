import {useSelector} from 'react-redux';
import {MouseMode, RootState} from '../../redux/Types';
import {getDistanceInMeters, getGurpsRangeModifier} from '../tools/Measurement';
import {getMapFramePositionFromMapPosition} from '../tools/Map';
import {Coordinate} from "../../api/Types";


interface Props {
    position: Coordinate | null,
}

export function Measurement(props: Props) {
    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const fromMap = mouse.lastSeen;
    const toMap = props.position;

    if ( toMap === null ) {
        return <div />
    }
    const to = getMapFramePositionFromMapPosition(mapProperties, toMap);

    const xyTagText = 'x=' + toMap.x.toFixed(0) + '/y=' + toMap.y.toFixed(0);
    const xyTagWidth = 20 * xyTagText.length;
    let xyLabelPosition: Coordinate = {x: to.x, y: to.y - 33};
    let xyTagPosition: Coordinate = {x: to.x - xyTagWidth/2, y: to.y - 60};

    if (
        fromMap !== null
        && (
            mouse.mode === MouseMode.MeasureTo
            || mouse.mode === MouseMode.MoveToken
            || mouse.mode === MouseMode.TurnToken
        )
    ) {
        const distance = getDistanceInMeters(fromMap, toMap, battleMap.background_pixels_per_meter);
        let text = distance < 10 ? distance.toFixed(1) + ' m' : Math.ceil(distance).toFixed(0) + ' m';
        let lengthMod = 0;
        if (mouse.mode === MouseMode.MeasureTo) {
            text += '(Mod.: '
                + getGurpsRangeModifier(distance)
                + ')';
            lengthMod = -2;
        }
        const textWidth = 18 * (text.length + lengthMod);
        const from = getMapFramePositionFromMapPosition(mapProperties, fromMap);
        const textPosition: Coordinate = {x: (from.x + to.x) / 2, y: (from.y + to.y) / 2};
        const textAnchor = from.x < to.x ? 'end' : 'start';
        const tagPosition: Coordinate = from.x < to.x ?
            {x: textPosition.x - textWidth + 3, y: textPosition.y - 30} :
            {x: textPosition.x - 3, y: textPosition.y - 30};
        if ( from.y < to.y ) {
            xyLabelPosition.y = to.y + 32;
            xyTagPosition.y = to.y + 5;
        }

        return <div className="measurement-box">
            <svg width={mapProperties.zoomedWidth} height={mapProperties.zoomedHeight} pointerEvents="None">
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="measurement-band"/>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="measurement-line"/>
                <rect
                    x={tagPosition.x} y={tagPosition.y} width={textWidth} height={35}
                    className="measurement-tag"
                />
                <text
                    x={textPosition.x} y={textPosition.y}
                    className="measurement-label"
                    textAnchor={textAnchor}
                >{text}</text>
                <rect
                    x={xyTagPosition.x} y={xyTagPosition.y} width={xyTagWidth} height={35}
                    className="measurement-tag"
                />
                <text
                    x={xyLabelPosition.x} y={xyLabelPosition.y}
                    className="measurement-label"
                    textAnchor="middle"
                >{xyTagText}</text>
            </svg>
        </div>;
    } else {
        return <div className="measurement-box">
            <svg width={mapProperties.zoomedWidth} height={mapProperties.zoomedHeight} pointerEvents="None">
                <rect
                    x={xyTagPosition.x} y={xyTagPosition.y} width={xyTagWidth} height={35}
                    className="measurement-tag"
                />
                <text
                    x={xyLabelPosition.x} y={xyLabelPosition.y}
                    className="measurement-label"
                    alignmentBaseline="baseline"
                    textAnchor="middle"
                >{xyTagText}</text>
            </svg>
        </div>;
    }
}

export default Measurement;
