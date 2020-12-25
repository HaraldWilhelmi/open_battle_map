import {Coordinate} from "../../api/Types";
import {MapProperties, GeometryUpdate, MapZoom} from '../../redux/Types';
import {
    calculateMapZoom, calculateGeometryUpdate,
    getMapPositionFromScaledPosition, getPhysicalPositionFromScaledPosition
} from './Map';


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

const SAMPLE_ZOOMED: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    width: 800,
    height: 500,
    naturalWidth: 200,
    naturalHeight: 125,
    xOffset: -200, // Please note the slight asymmetry after the first zoom,
    yOffset: -125, // due to 50px vertical space which were used before
    userZoomFactor: 2.0,
    totalZoomFactor: 4.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_CENTERED: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    width: 800,
    height: 500,
    naturalWidth: 200,
    naturalHeight: 125,
    xOffset: -200,
    yOffset: -100,
    userZoomFactor: 2.0,
    totalZoomFactor: 4.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_TWICE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    width: 1600,
    height: 1000,
    naturalWidth: 200,
    naturalHeight: 125,
    xOffset: -600,
    yOffset: -350,
    userZoomFactor: 4.0,
    totalZoomFactor: 8.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_TRICE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    width: 3200,
    height: 2000,
    naturalWidth: 200,
    naturalHeight: 125,
    xOffset: -1400,
    yOffset: -850,
    userZoomFactor: 8.0,
    totalZoomFactor: 16.0,
    naturalToDisplayRatio: 2.0,
}


test ('getMapPositionFromScaledPosition', () => {
    const coordinate: Coordinate = {x: 400, y: 250}; // Middle of 800 x 500 scaled image
    const result = getMapPositionFromScaledPosition(SAMPLE_ZOOMED, coordinate);
    expect(result).toStrictEqual({x: 100, y: 62.5});
});

test ('getPhysicalPositionFromScaledPosition', () => {
    const coordinate: Coordinate = {x: 400, y: 250}; // Middle of 800 x 500 scaled image
    const result = getPhysicalPositionFromScaledPosition(SAMPLE_ZOOMED, coordinate);
    expect(result).toStrictEqual({x: 200, y: 125});
});

test('calculateMapZoom - trivial', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.0, // Noop!
        focusPoint: { x: 10, y: 15 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);
    expect(result).toStrictEqual(SAMPLE);
});


test('calculateMapZoom - x 1.5', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.5,
        focusPoint: { x: 10, y: 15 },
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
        focusPoint: { x: 10, y: 15 },
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

test('calculateMapZoom - central zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 2.0,
        focusPoint: { x: 100, y: 62.5 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);
    expect(result).toStrictEqual(SAMPLE_ZOOMED);
});

test('calculateMapZoom - 2x central zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 2.0,
        focusPoint: { x: 100, y: 62.5 },
    }
    const result = calculateMapZoom(SAMPLE_ZOOMED_CENTERED, mapZoom);
    expect(result).toStrictEqual(SAMPLE_ZOOMED_TWICE);
});

test('calculateMapZoom - 3x central zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 2.0,
        focusPoint: { x: 100, y: 62.5 },
    }
    const result = calculateMapZoom(SAMPLE_ZOOMED_TWICE, mapZoom);
    expect(result).toStrictEqual(SAMPLE_ZOOMED_TRICE);
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
    const geometryUpdate: GeometryUpdate = {
        widthAvailable: 400,        // Before the change widthAvailable was the limiting factor
        heightAvailable: 200,       // After it is heightAvailable. So wie expect naturalToDisplayRatio = 200 / 125 = 1.6
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
