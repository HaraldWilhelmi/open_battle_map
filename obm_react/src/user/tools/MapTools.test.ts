import {MapProperties, GeometryUpdate, MapMove, MapZoom, Coordinate} from '../../redux/Types';
import {calculateMapZoom, calculateGeometryUpdate} from './MapTools';


const SAMPLE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    width: 400,
    height: 250,
    naturalWidth: 200,
    naturalHeight: 125,
    xOffset: 0,
    yOffset: 0,
    userZoomFactor: 1.0,
    totalZoomFactor: 2.0,
    naturalToDisplayRatio: 2.0,
}


test('calculateMapZoom - trivial', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.0, // Noop!
        mousePosition: { x: 20, y: 30 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);
    expect(result).toStrictEqual(SAMPLE);
});


test('calculateMapZoom - x 1.5', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.5,
        mousePosition: { x: 20, y: 30 }, // 10, 15 on the background map
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);

    const expectedResult: MapProperties = {
        widthAvailable: 400,
        heightAvailable: 300,
        width: 600,
        height: 375,
        naturalWidth: 200,
        naturalHeight: 125,
        xOffset: -10,
        yOffset: -15,
        userZoomFactor: 1.5,
        totalZoomFactor: 3.0,
        naturalToDisplayRatio: 2.0,
    };
    expect(result).toStrictEqual(expectedResult);
});

test('calculateMapZoom - over zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 35.0,
        mousePosition: { x: 20, y: 30 }, // 10, 15 on the background map
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);

    const expectedResult: MapProperties = {
        widthAvailable: 400,
        heightAvailable: 300,
        width: 6400,
        height: 4000,
        naturalWidth: 200,
        naturalHeight: 125,
        xOffset: -300,
        yOffset: -450,
        userZoomFactor: 16.0,
        totalZoomFactor: 32.0,
        naturalToDisplayRatio: 2.0,
    };
    expect(result).toStrictEqual(expectedResult);
});

test('calculateGeometryUpdate - trivial', () => {
    const geometryUpdate: GeometryUpdate = { // No change!
        widthAvailable: 400,
        heightAvailable: 300,
        naturalWidth: 200,
        naturalHeight: 125,
    };
    const result = calculateGeometryUpdate(SAMPLE, geometryUpdate);
    expect(result).toStrictEqual(SAMPLE);
});

test('calculateGeometryUpdate - change aspect ratio of frame', () => {
    const geometryUpdate: GeometryUpdate = { // No change!
        widthAvailable: 400,
        heightAvailable: 200,
        naturalWidth: 200,
        naturalHeight: 125,
    }
    const result = calculateGeometryUpdate(SAMPLE, geometryUpdate);
    const expectedResult: MapProperties = {
        widthAvailable: 400,
        heightAvailable: 200,
        width: 320,
        height: 200,
        naturalWidth: 200,
        naturalHeight: 125,
        xOffset: 0,
        yOffset: 0,
        userZoomFactor: 1.0,
        totalZoomFactor: 1.6,
        naturalToDisplayRatio: 1.6,
    };
    expect(result).toStrictEqual(expectedResult);
});
