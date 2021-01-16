import {MouseEvent, WheelEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Coordinate, TokenState} from '../../api/Types';
import {FlyingToken, GenericDispatch, MapZoom, MouseMode, RootState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {
    getMapFramePositionFromMapPosition,
    getScaledBackgroundPositionFromMapPosition,
    ZOOM_INCREMENT
} from '../tools/Map';
import {getTokenWidthOnMap} from "../tools/Token";
import Token from './Token';
import Positioner from "./Positioner";


interface Props {
    token: TokenState,
}

export function PlacedToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    function pickupToken(event: MouseEvent) {
        if ( mouse.mode === MouseMode.Default ) {
            event.stopPropagation();
            event.preventDefault();
            const positionOverGround: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const flyingToken: FlyingToken = {...props.token,
                positionOverGround
            };
            dispatch(actions.tokens.pickupFromMap(flyingToken));
        }
    }

    function doZoom (event: WheelEvent) {
        event.stopPropagation();
        const zoomFactorRatio = event.deltaY < 0 ? ZOOM_INCREMENT : 1 / ZOOM_INCREMENT;
        const physicalFocusPoint = getScaledBackgroundPositionFromMapPosition(mapProperties, props.token.position);
        const mapZoom: MapZoom = {physicalFocusPoint, zoomFactorRatio};
        dispatch(actions.mapProperties.zoom(mapZoom));
    }

    const positionOnScreen = getMapFramePositionFromMapPosition(mapProperties, props.token.position);
    const tokenDescriptor = mapSet.token_set[props.token.token_type];
    const width = getTokenWidthOnMap(tokenDescriptor, battleMap, mapProperties);

    return <Positioner position={positionOnScreen}>
        <Token
            tokenId={props.token}
            width={width}
            rotation={props.token.rotation}
            onClick={pickupToken}
            onWheel={doZoom}
            pointerEvents={mouse.mode === MouseMode.Default}
        />
    </Positioner>;
}

export default PlacedToken;