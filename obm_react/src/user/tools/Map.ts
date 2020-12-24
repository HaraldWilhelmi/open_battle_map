import {Coordinate} from '../../api/Types';
import {MapProperties, GeometryUpdate, MapMove, MapZoom} from '../../redux/Types';


const ZOOM_NOOP: MapZoom = {
    focusPoint: {x: 0, y: 0},
    zoomFactorRatio: 1.0,
}

const MAX_ZOOM = 16.0;
export const ZOOM_INCREMENT = Math.sqrt(2);

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

    const focusMapPosition = mapZoom.focusPoint ?? getDefaultFoucPoint(mapProperties);
    const focusPhysicalPosition = getPhysicalPositionFromMapPosition(mapProperties, focusMapPosition);

    let xOffset = focusPhysicalPosition.x - focusMapPosition.x * totalZoomFactor;
    let yOffset = focusPhysicalPosition.y - focusMapPosition.y * totalZoomFactor;

    const firstGuess = {...mapProperties,
        userZoomFactor, totalZoomFactor, width, height, xOffset, yOffset
    };
    return fixOffsets(firstGuess);
}

export function getDefaultFoucPoint(mapProperties: MapProperties) {
    const middleOfVisibleMap: Coordinate = {
        x: mapProperties.widthAvailable / 2 - mapProperties.xOffset,
        y: mapProperties.heightAvailable / 2 - mapProperties.yOffset,
    }
    return getMapPositionFromScaledPosition(mapProperties, middleOfVisibleMap);
}

export function getMapPositionFromScaledPosition(mapProperties: MapProperties, scaledPosition: Coordinate): Coordinate {
    return {
        x: ( scaledPosition.x) / mapProperties.totalZoomFactor,
        y: ( scaledPosition.y) / mapProperties.totalZoomFactor,
    }
}

export function getPhysicalPositionFromScaledPosition(mapProperties: MapProperties, scaledPosition: Coordinate): Coordinate {
    return {
        x: scaledPosition.x + mapProperties.xOffset,
        y: scaledPosition.y + mapProperties.yOffset,
    }
}

export function getPhysicalPositionFromMapPosition(mapProperties: MapProperties, mapPosition: Coordinate): Coordinate {
    return {
        x: mapPosition.x * mapProperties.totalZoomFactor + mapProperties.xOffset,
        y: mapPosition.y * mapProperties.totalZoomFactor + mapProperties.yOffset,
    }
}

export function getMapPositionFromPhysicalPosition(mapProperties: MapProperties, physicalPosition: Coordinate): Coordinate {
    return {
        x: (mapProperties.xOffset + physicalPosition.x) / mapProperties.totalZoomFactor,
        y: (mapProperties.yOffset + physicalPosition.y) / mapProperties.totalZoomFactor,
    }
}

export function getRotationFromTarget(position: Coordinate, target: Coordinate): number {
    const deltaX = target.x - position.x;
    const deltaY = position.y - target.y;  // CSS coordinates are vertically inverse compared to normal geometry
    if ( deltaX === 0 && deltaY === 0 ) {
        return 0.0;
    }
    return Math.atan2(deltaX, deltaY);
}
