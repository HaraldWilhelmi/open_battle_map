import {Coordinate} from '../../api/Types';
import {MapProperties, GeometryUpdate, MapMove, MapZoom} from '../../redux/Types';


const ZOOM_NOOP: MapZoom = {
    mousePosition: {x: 0, y: 0},
    zoomFactorRatio: 1.0,
}

const MAX_ZOOM = 16.0;

const OFFSET_TOLERANCE = 0.3;

export function calculateGeometryUpdate(mapProperties: MapProperties, geometryUpdate: GeometryUpdate): MapProperties {
    const naturalToDisplayRatioX = geometryUpdate.widthAvailable / geometryUpdate.naturalWidth;
    const naturalToDisplayRatioY = geometryUpdate.heightAvailable / geometryUpdate.naturalHeight;
    const naturalToDisplayRatio = naturalToDisplayRatioX < naturalToDisplayRatioY ?
        naturalToDisplayRatioX : naturalToDisplayRatioY;
    const patchedState: MapProperties = {...mapProperties,
        ...geometryUpdate,
        naturalToDisplayRatio,
        totalZoomFactor: mapProperties.userZoomFactor * naturalToDisplayRatio,
    };
    return calculateMapZoom(patchedState, ZOOM_NOOP);
}

export function calculateMapMove(mapProperties: MapProperties, mapMove: MapMove): MapProperties {
    let xOffset = mapProperties.xOffset + mapMove.deltaX;
    let yOffset = mapProperties.yOffset + mapMove.deltaY;
    const firstGuess = {...mapProperties, xOffset, yOffset};
    return fixOffsets(firstGuess);
}

export function fixOffsets(mapProperties: MapProperties): MapProperties {
    let xOffset = mapProperties.xOffset;
    let yOffset = mapProperties.yOffset;

    const minXOffset = (1 - OFFSET_TOLERANCE ) * mapProperties.widthAvailable - mapProperties.width;
    const maxXOffset = OFFSET_TOLERANCE * mapProperties.widthAvailable;
    const minYOffset = (1 - OFFSET_TOLERANCE ) * mapProperties.heightAvailable - mapProperties.height;
    const maxYOffset = OFFSET_TOLERANCE * mapProperties.heightAvailable;

    xOffset = xOffset < minXOffset ? minXOffset : xOffset;
    xOffset = xOffset > maxXOffset ? maxXOffset : xOffset;
    yOffset = yOffset < minYOffset ? minYOffset : yOffset;
    yOffset = yOffset > maxYOffset ? maxYOffset : yOffset;

    return {...mapProperties, xOffset, yOffset};
}

export function calculateMapZoom(mapProperties: MapProperties, mapZoom: MapZoom): MapProperties {
    let userZoomFactor = mapProperties.userZoomFactor * mapZoom.zoomFactorRatio;
    userZoomFactor = userZoomFactor > MAX_ZOOM ? MAX_ZOOM :
                     userZoomFactor < 1.0      ? 1.0      :
                                            userZoomFactor;
    const totalZoomFactor = userZoomFactor * mapProperties.naturalToDisplayRatio;
    const width = totalZoomFactor * mapProperties.naturalWidth;
    const height = totalZoomFactor * mapProperties.naturalHeight;

    let focusPoint: Coordinate = mapZoom.mousePosition === undefined ?
        {
            x: mapProperties.widthAvailable / 2 - mapProperties.xOffset,
            y: mapProperties.heightAvailable / 2 - mapProperties.yOffset,
        } : mapZoom.mousePosition;
    const focusMapPosition = getMapPositionFromScaledPosition(mapProperties, focusPoint);
    const focusPhysicalPosition = getPhysicalPositionFromScaledPosition(mapProperties, focusPoint);

    let xOffset = focusPhysicalPosition.x - focusMapPosition.x * totalZoomFactor;
    let yOffset = focusPhysicalPosition.y - focusMapPosition.y * totalZoomFactor;

    const firstGuess = {...mapProperties,
        userZoomFactor, totalZoomFactor, width, height, xOffset, yOffset
    };
    return fixOffsets(firstGuess);
}

export function getMapPositionFromScaledPosition(mapProperties: MapProperties, scaledPosition: Coordinate): Coordinate {
    return {
        x: scaledPosition.x / mapProperties.totalZoomFactor,
        y: scaledPosition.y / mapProperties.totalZoomFactor,
    }
}

export function getPhysicalPositionFromScaledPosition(mapProperties: MapProperties, scaledPosition: Coordinate): Coordinate {
    return {
        x: scaledPosition.x + mapProperties.xOffset,
        y: scaledPosition.y + mapProperties.yOffset,
    }
}

