import {MapProperties, GeometryUpdate, MapMove, MapZoom, Coordinate} from '../../redux/Types';


const ZOOM_NOOP: MapZoom = {
    mousePosition: {x: 0, y: 0},
    zoomFactorRatio: 1.0,
}

const MAX_ZOOM = 16.0;

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
    const minXOffset = mapProperties.widthAvailable - mapProperties.width;
    let xOffset = mapProperties.xOffset + mapMove.deltaX;
    xOffset = xOffset < minXOffset ? minXOffset: xOffset;
    xOffset = xOffset > 0          ? 0         : xOffset;

    const minYOffset = mapProperties.heightAvailable - mapProperties.height;
    let yOffset = mapProperties.yOffset + mapMove.deltaY;
    yOffset = yOffset < minYOffset ? minYOffset: yOffset;
    yOffset = yOffset > 0          ? 0         : yOffset;

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
    const minXOffset = mapProperties.widthAvailable - width;
    const minYOffset = mapProperties.heightAvailable - height;

    let focusPoint: Coordinate = {
        x: mapProperties.widthAvailable / 2 - mapProperties.xOffset,
        y: mapProperties.heightAvailable / 2 - mapProperties.yOffset,
    };
    if ( mapZoom.mousePosition !== undefined ) {
        focusPoint = mapZoom.mousePosition;
    }
    const focusMapPosition = getMapPositionFromScaledPosition(mapProperties, focusPoint);
    const focusPhysicalPosition = getPhysicalPositionFromScaledPosition(mapProperties, focusPoint);

    let xOffset = focusPhysicalPosition.x - focusMapPosition.x * totalZoomFactor;
    xOffset = xOffset < minXOffset ? minXOffset : xOffset;
    xOffset = xOffset > 0          ? 0          : xOffset;

    let yOffset = focusPhysicalPosition.y - focusMapPosition.y * totalZoomFactor;
    yOffset = yOffset < minYOffset ? minYOffset : yOffset;
    yOffset = yOffset > 0          ? 0          : yOffset;

    return {...mapProperties,
        userZoomFactor, totalZoomFactor, width, height, xOffset, yOffset,
    };
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

