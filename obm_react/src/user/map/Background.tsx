import {useEffect, useRef, RefObject, MouseEvent} from 'react';
import CSS from 'csstype';
import {useSelector, useDispatch} from 'react-redux';
import {BattleMap, Coordinate} from '../../api/Types';
import {
    RootState, MapProperties, GenericDispatch, GeometryUpdate, MouseMode, MapMove, MouseState
} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {MAP_BORDER_WIDTH} from '../tools/Map';


interface Props {
    mapBoxRef: RefObject<HTMLDivElement>;
}


export function Background(props: Props) {
    const dispatch: GenericDispatch = useDispatch();
    const imageRef = useRef<HTMLImageElement>(null);

    const battleMap: BattleMap | null = useSelector(
        (state: RootState) => state.battleMap
    );

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const detectGeometryChange = () => {
        const image = imageRef.current;
        const frame = props.mapBoxRef.current;
        const widthAvailable = frame?.clientWidth ?? 0;
        const heightAvailable = frame?.clientHeight ?? 0;
        const naturalWidth = image?.naturalWidth ?? 0;
        const naturalHeight = image?.naturalHeight ?? 0;

        if ( widthAvailable === 0 || heightAvailable === 0 || naturalWidth === 0 || naturalHeight === 0 ) {
            return;
        }

        if (
            widthAvailable === mapProperties.widthAvailable && heightAvailable === mapProperties.heightAvailable &&
            naturalWidth === mapProperties.naturalWidth && naturalHeight === mapProperties.naturalHeight
        ) {
            return;
        }
        const geometryUpdate: GeometryUpdate = {widthAvailable, heightAvailable, naturalWidth, naturalHeight};
        dispatch(actions.mapProperties.updateGeometry(geometryUpdate));
    }

    useEffect(() => {
        window.addEventListener("resize", detectGeometryChange);
        return () => window.removeEventListener("resize", detectGeometryChange);
    });

    if ( battleMap === null ) {
        return ( <p>:-(</p> );
    }

    const enterMapMove = (event: MouseEvent) => {
        event.preventDefault();
        if ( mouse.mode === MouseMode.Default ) {
            const position: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            dispatch(actions.mouse.grabMap(position));
        }
    }

    const leaveMapMove = () => {
        if ( mouse.mode === MouseMode.MoveMap ) {
            dispatch(actions.mouse.releaseMap());
        }
    }

    const doMapMove = (event: MouseEvent) => {
        if ( mouse.mode === MouseMode.MoveMap ) {
            const oldX = mouse?.lastSeen?.x ?? -1;
            const oldY = mouse?.lastSeen?.y ?? -1;
            if ( oldX >= 0 && oldY >= 0 ) {
                const mapMove: MapMove = {
                    deltaX: event.nativeEvent.clientX - oldX,
                    deltaY: event.nativeEvent.clientY - oldY,
                };
                dispatch(actions.mapProperties.move(mapMove));
            } else {
                dispatch(actions.mouse.releaseMap());
            }
        }
    }

    const effectiveXOffset = mapProperties.xOffset < 0 ? mapProperties.xOffset : 0;
    const effectiveYOffset = mapProperties.yOffset < 0 ? mapProperties.yOffset : 0;

    const style: CSS.Properties = {
        position: 'relative',
        borderStyle: 'dashed',
        borderWidth: MAP_BORDER_WIDTH + 'px',
        width: mapProperties.zoomedWidth + 'px',
        height: mapProperties.zoomedHeight + 'px',
        left: effectiveXOffset + 'px',
        top: effectiveYOffset + 'px',
    };

    // The query parameter is actually unused, but ensures a refresh/render of the image.
    const url = '/api/image_data/'
        + battleMap.map_set_uuid + '/'
        + battleMap.uuid
        + '?v=' + battleMap.revision;

    return (
        <img
            src={url}
            style={style}
            alt="Battle Background Background"
            ref={imageRef}
            onLoad={detectGeometryChange}
            onMouseDown={enterMapMove}
            onMouseUp={leaveMapMove}
            onMouseLeave={leaveMapMove}
            onMouseMove={doMapMove}
        />
    );
}

export default Background;
