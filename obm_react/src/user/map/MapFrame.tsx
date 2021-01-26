import {MouseEvent, useEffect, useState, WheelEvent} from 'react';
import CSS from 'csstype';
import {useDispatch, useSelector} from 'react-redux';
import {Coordinate, OFF_MAP_POSITION} from '../../api/Types';
import {GenericDispatch, MapZoom, MouseMode, RootState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {
    calculateMapFrame,
    getMapFramePositionFromMapPosition,
    getMapPositionFromPhysicalPosition,
    getRotationFromTarget,
    ZOOM_INCREMENT
} from '../tools/Map';
import {handleUserAction} from "../../common/Tools";
import Measurement from "../components/Measurement";
import Positioner from "../components/Positioner";
import Pointer from "../components/Pointer";


const INITIAL_MEASUREMENT_POSITION: Coordinate | null = null;


interface Props {
  children: JSX.Element[] | JSX.Element
}

export function MapFrame(props: Props) {
    const [measurementPosition, setMeasurementPosition] = useState(INITIAL_MEASUREMENT_POSITION);
    const [pointerIsVisible, setPointerIsVisible] = useState(false);
    const [pointerPosition, setPointerPosition] = useState(OFF_MAP_POSITION);
    const [pendingPointerMove, setPendingPointerMove] = useState(false);
    const [lastMouseMode, setLastMouseMode] = useState(MouseMode.Default);

    const dispatch: GenericDispatch = useDispatch();

    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const tokens = useSelector(
        (state: RootState) => state.tokens
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
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

    useEffect(
        () => {
            if ( mouse.mode === lastMouseMode ) {
                return undefined;
            }
            if ( lastMouseMode === MouseMode.Pointer && pointerPosition !== OFF_MAP_POSITION ) {
                setPointerPosition(OFF_MAP_POSITION);
                setPendingPointerMove(true);
            }
            setLastMouseMode(mouse.mode);
            return undefined;
        },
        [mouse, lastMouseMode, pointerPosition, battleMap, dispatch]
    );

    useEffect(
        () => {
            if ( ! pendingPointerMove ) {
                return undefined;
            }

            handleUserAction(
                async () => { dispatch(actions.pointerAction.put(pointerPosition)); },
                dispatch
            );

            setPendingPointerMove(false);
            return undefined;
        },
        [pointerPosition, dispatch, pendingPointerMove]
    );

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
            case MouseMode.Pointer: {
                dispatch(actions.mouse.stopPointer());
                if ( pointerPosition !== OFF_MAP_POSITION ) {
                    setPointerPosition(OFF_MAP_POSITION);
                    setPendingPointerMove(true);
                }
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

    const movePointer = (event: MouseEvent) => {
        if ( mouse.mode === MouseMode.Pointer && pointerIsVisible ) {
            const position = getMouseMapPosition(event);
            setPointerPosition(position);
            setPendingPointerMove(true);
        } else {
            if ( pointerPosition !== OFF_MAP_POSITION ) {
                setPointerPosition(OFF_MAP_POSITION);
                setPendingPointerMove(true);
            }
        }
    }

    const doMouseMove = (event: MouseEvent) => {
        trackDistance(event);
        movePointer(event);
    };

    const doMouseEnter = () => {
        setPointerIsVisible(true);
    };

    const doMouseLeave = () => {
        stopTrackDistance();
        setPointerIsVisible(false);
        if ( pointerPosition !== OFF_MAP_POSITION ) {
            setPointerPosition(OFF_MAP_POSITION);
            setPendingPointerMove(true);
        }
    };

    let myPointer = <div />;
    if ( mouse.mode === MouseMode.Pointer && pointerIsVisible && pointerPosition !== null ) {
        const position = getMapFramePositionFromMapPosition(mapProperties, pointerPosition)
        myPointer = <Positioner position={position}>
            <Pointer color={mouse.pointerColor ?? 'Black'} fades={true} key={position.x + 10000 * position.y} />
        </Positioner>;
    }

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
            onMouseMove={doMouseMove}
            onMouseEnter={doMouseEnter}
            onMouseLeave={doMouseLeave}
        >
            {props.children}
            <Measurement position={measurementPosition} />
            {myPointer}
        </div>
    );
}

export default MapFrame;
