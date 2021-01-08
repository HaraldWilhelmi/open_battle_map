import {MouseEvent, useEffect, useState, WheelEvent} from 'react';
import CSS from 'csstype';
import {useDispatch, useSelector} from 'react-redux';
import {Coordinate} from '../../api/Types';
import {GenericDispatch, MapProperties, MapZoom, MouseMode, MouseState, RootState, Tokens} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {
    calculateMapFrame,
    getMapPositionFromPhysicalPosition,
    getRotationFromTarget,
    ZOOM_INCREMENT
} from '../tools/Map';
import Measurement from "../components/Measurement";


const INITIAL_MEASUREMENT_POSITION: Coordinate | null = null;


interface Props {
  children: JSX.Element[] | JSX.Element
}

export function MapFrame(props: Props) {
    const [measurementPosition, setMeasurementPosition] = useState(INITIAL_MEASUREMENT_POSITION);
    const dispatch: GenericDispatch = useDispatch();

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const tokens: Tokens = useSelector(
        (state: RootState) => state.tokens
    );

    const doZoom = (event: WheelEvent) => {
        const physicalFocusPoint: Coordinate = {x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY}
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const mapZoom: MapZoom = {physicalFocusPoint, zoomFactorRatio};
        dispatch(actions.mapProperties.zoom(mapZoom));
    }

    const getMouseMapPosition = (event: MouseEvent) => getMapPositionFromPhysicalPosition(mapProperties, {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
    });


    const doKeyboard = (event: KeyboardEvent) => {
        event.stopPropagation();
        if ( event.key === 'm' ) {
            if ( mouse.mode === MouseMode.Default ) {
                dispatch(actions.mouse.startMeasurement());
            } else if ( mouse.mode === MouseMode.MeasureFrom || mouse.mode === MouseMode.MeasureTo ) {
                dispatch(actions.mouse.stopMeasurement());
            }
        }
    };

    useEffect(
        () => {
            document.addEventListener('keydown', doKeyboard);
            return () => document.removeEventListener('keydown', doKeyboard);
        }
    )

    const doClick = (event: MouseEvent) => {
        switch ( mouse.mode ) {
            case MouseMode.MoveToken: {
                event.stopPropagation();
                const position = getMouseMapPosition(event);
                dispatch(actions.tokens.positionOnMapForAdjustment(position));
                break;
            }
            case MouseMode.TurnToken: {
                event.stopPropagation();
                let token = tokens.flyingToken;
                if ( token !== null ) {  // Always true
                    const target = getMouseMapPosition(event);
                    const rotation = getRotationFromTarget(token.position, target);
                    token = {...token, rotation};
                    dispatch(actions.tokens.placeOnMap(rotation));
                }
                dispatch(actions.mouse.releaseToken());
                setMeasurementPosition(null);
                break;
            }
            case MouseMode.MeasureFrom: {
                const mapFrom = getMouseMapPosition(event);
                dispatch(actions.mouse.selectMeasurementPostion(mapFrom));
                break;
            }
            case MouseMode.MeasureTo: {
                dispatch(actions.mouse.stopMeasurement());
                break;
            }
            default: {break}
        }
    }

    const trackDistance = (event: MouseEvent) => {
        if (
            mouse.mode === MouseMode.MoveToken
            || mouse.mode === MouseMode.MeasureFrom
            || mouse.mode === MouseMode.MeasureTo
        ) {
            setMeasurementPosition(getMouseMapPosition(event));
        } else if ( mouse.mode === MouseMode.TurnToken ) {
            // Do nothing!
        } else {
            stopTrackDistance();
        }
    }

    const stopTrackDistance = () => {
        if ( measurementPosition !== null ) {
            setMeasurementPosition(null);
        }
    };


    const geometry = calculateMapFrame(mapProperties);

    const style: CSS.Properties = {
        position: 'absolute',
        left: geometry.leftTopCorner.x + 'px',
        top: geometry.leftTopCorner.y + 'px',
        width: geometry.width + 'px',
        height: geometry.height + 'px',
        overflow: 'hidden',
    };

    return (
        <div
            style={style}
            onWheel={doZoom}
            onClick={doClick}
            onDragStart={doClick}
            onMouseMove={trackDistance}
            onMouseLeave={stopTrackDistance}
        >
            {props.children}
            <Measurement position={measurementPosition} />
        </div>
    );
}

export default MapFrame;
