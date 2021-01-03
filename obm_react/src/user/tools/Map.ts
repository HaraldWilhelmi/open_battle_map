import {Coordinate} from '../../api/Types';
import {MapProperties, GeometryUpdate, MapMove, MapZoom} from '../../redux/Types';


const ZOOM_NOOP: MapZoom = {
    zoomFactorRatio: 1.0,
}

const MAX_ZOOM = 128.0;
export const ZOOM_INCREMENT = Math.sqrt(2);

const OFFSET_TOLERANCE = 0.3;

export const MAP_BORDER_WIDTH = 2;

export function calculateGeometryUpdate(mapProperties: MapProperties, geometryUpdate: GeometryUpdate): MapProperties {
    const naturalToDisplayRatioX = (geometryUpdate.widthAvailable) / geometryUpdate.naturalWidth;
    const naturalToDisplayRatioY = (geometryUpdate.heightAvailable) / geometryUpdate.naturalHeight;
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
    const widthAvailable = mapProperties.widthAvailable;
    const heightAvailable = mapProperties.heightAvailable;
    const zoomedWidth = mapProperties.zoomedWidth;
    const zoomedHeight = mapProperties.zoomedHeight;

    const xOffset = getFixedOffset(mapProperties.xOffset, widthAvailable, zoomedWidth);
    const yOffset = getFixedOffset(mapProperties.yOffset, heightAvailable, zoomedHeight);
    const relevantXOffset = Math.max(xOffset, 0);
    const relevantYOffset = Math.max(yOffset, 0);
    const visibleWidth = Math.min(widthAvailable - relevantXOffset, zoomedWidth + xOffset);
    const visibleHeight = Math.min(heightAvailable - relevantYOffset, zoomedHeight + yOffset);

    return {...mapProperties, xOffset, yOffset, visibleWidth, visibleHeight};
}

function getFixedOffset(oldValue: number, available: number, desired: number): number {
    const minOffset = (1 - OFFSET_TOLERANCE) * available - desired;
    const maxOffset = OFFSET_TOLERANCE * available;
    return Math.min(Math.max(oldValue, minOffset), maxOffset);
}

export function calculateMapZoom(mapProperties: MapProperties, mapZoom: MapZoom): MapProperties {
    let userZoomFactor = mapProperties.userZoomFactor * mapZoom.zoomFactorRatio;
    userZoomFactor = Math.max(Math.min(userZoomFactor, MAX_ZOOM), 1.0);
    const totalZoomFactor = userZoomFactor * mapProperties.naturalToDisplayRatio;
    const zoomFactorRatio = totalZoomFactor / mapProperties.totalZoomFactor;

    const zoomedWidth = totalZoomFactor * mapProperties.naturalWidth;
    const zoomedHeight = totalZoomFactor * mapProperties.naturalHeight;

    const focusPhysicalPosition = mapZoom.physicalFocusPoint ?? getDefaultFocusPoint(mapProperties);

    const xOffset = mapProperties.xOffset - (zoomFactorRatio-1) * focusPhysicalPosition.x;
    const yOffset = mapProperties.yOffset - (zoomFactorRatio-1) * focusPhysicalPosition.y;

    const firstGuess = {...mapProperties,
        userZoomFactor, totalZoomFactor, zoomedWidth, zoomedHeight, xOffset, yOffset
    };
    return fixOffsets(firstGuess);
}

export function getDefaultFocusPoint(mapProperties: MapProperties) {
    return {
        x: mapProperties.visibleWidth / 2 + mapProperties.xOffset,
        y: mapProperties.visibleHeight / 2 + mapProperties.yOffset,
    }
}

export function getScaledBackgroundPositionFromMapPosition(mapProperties: MapProperties, mapPosition: Coordinate): Coordinate {
    const totalZoomFactor = mapProperties.totalZoomFactor;
    return {
        x: mapPosition.x * totalZoomFactor,
        y: mapPosition.y * totalZoomFactor,
    }
}

export function getMapFramePositionFromMapPosition(mapProperties: MapProperties, mapPosition: Coordinate): Coordinate {
    let result = getScaledBackgroundPositionFromMapPosition(mapProperties, mapPosition);
    result.x += mapProperties.xOffset < 0 ? mapProperties.xOffset : 0;
    result.y += mapProperties.yOffset < 0 ? mapProperties.yOffset : 0;
    return result;
}

export function getMapPositionFromPhysicalPosition(mapProperties: MapProperties, physicalPosition: Coordinate): Coordinate {
    const totalZoomFactor = mapProperties.totalZoomFactor;
    return {
        x: Math.round(physicalPosition.x / totalZoomFactor),
        y: Math.round(physicalPosition.y / totalZoomFactor),
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

export interface MapFrameParameters {
    leftTopCorner: Coordinate,
    width: number,
    height: number,
}

export function calculateMapFrame(mapProperties: MapProperties): MapFrameParameters {
    const effectiveXOffset = mapProperties.xOffset - MAP_BORDER_WIDTH;
    const effectiveYOffset = mapProperties.yOffset - MAP_BORDER_WIDTH;
    const x = effectiveXOffset > 0 ? effectiveXOffset : 0;
    const y = effectiveYOffset > 0 ? effectiveYOffset : 0;
    const maxWidth = mapProperties.widthAvailable - x;
    const maxHeight = mapProperties.heightAvailable - y;
    const desiredWidth = mapProperties.xOffset + mapProperties.zoomedWidth + MAP_BORDER_WIDTH - x;
    const desiredHeight = mapProperties.yOffset + mapProperties.zoomedHeight + MAP_BORDER_WIDTH -y;
    const width = desiredWidth < maxWidth ? desiredWidth : maxWidth;
    const height = desiredHeight < maxHeight ? desiredHeight : maxHeight;

    return {
        leftTopCorner: {x, y},
        width,
        height,
    }
}

interface ScaleRuler {
    parts: number,
    total: number,
}

export function getNextNiceScaleExample(maxValue: number): ScaleRuler {
    const digits = Math.floor(Math.log10(maxValue));
    const candidate = Math.pow(10, digits);
    if ( 5 * candidate < maxValue ) {
        return {parts: 5, total: 5 * candidate};
    }
    if ( 3 * candidate < maxValue ) {
        return {parts: 3, total: 3 * candidate};
    }
    return {parts: 10, total: candidate};
}
