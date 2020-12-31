import {Coordinate} from "../../api/Types";
import {MapProperties, GeometryUpdate, MapZoom} from '../../redux/Types';
import {
    calculateMapZoom, calculateGeometryUpdate,
    getMapPositionFromPhysicalPosition, getScaledBackgroundPositionFromMapPosition, getNextNiceScaleExample
} from './Map';


const SAMPLE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    zoomedWidth: 400,
    zoomedHeight: 250,
    naturalWidth: 200,
    naturalHeight: 125,
    visibleWidth: 400,
    visibleHeight: 250,
    xOffset: 0,
    yOffset: 0,
    userZoomFactor: 1.0,
    totalZoomFactor: 2.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    zoomedWidth: 800,
    zoomedHeight: 500,
    naturalWidth: 200,
    naturalHeight: 125,
    visibleWidth: 400,
    visibleHeight: 300,
    xOffset: -200, // Please note the slight asymmetry after the first zoom,
    yOffset: -125, // due to 50px vertical space which were used before
    userZoomFactor: 2.0,
    totalZoomFactor: 4.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_CENTERED: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    zoomedWidth: 800,
    zoomedHeight: 500,
    naturalWidth: 200,
    naturalHeight: 125,
    visibleWidth: 400,
    visibleHeight: 300,
    xOffset: -200,
    yOffset: -100,
    userZoomFactor: 2.0,
    totalZoomFactor: 4.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_TWICE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    zoomedWidth: 1600,
    zoomedHeight: 1000,
    naturalWidth: 200,
    naturalHeight: 125,
    visibleWidth: 400,
    visibleHeight: 300,
    xOffset: -600,
    yOffset: -350,
    userZoomFactor: 4.0,
    totalZoomFactor: 8.0,
    naturalToDisplayRatio: 2.0,
}

const SAMPLE_ZOOMED_TRICE: MapProperties = {
    widthAvailable: 400,
    heightAvailable: 300,
    zoomedWidth: 3200,
    zoomedHeight: 2000,
    naturalWidth: 200,
    naturalHeight: 125,
    visibleWidth: 400,
    visibleHeight: 300,
    xOffset: -1400,
    yOffset: -850,
    userZoomFactor: 8.0,
    totalZoomFactor: 16.0,
    naturalToDisplayRatio: 2.0,
}


test ('getMapPositionFromPhysicalPosition', () => {
    const coordinate: Coordinate = {x: 200, y: 160}; // total Zoom x4
    const result = getMapPositionFromPhysicalPosition(SAMPLE_ZOOMED, coordinate);
    expect(result).toStrictEqual({x: 50, y: 40});
});

test ('getPhysicalPositionFromMapPosition', () => {
    const coordinate: Coordinate = {x: 100, y: 60}; // total Zoom x4
    const result = getScaledBackgroundPositionFromMapPosition(SAMPLE_ZOOMED, coordinate);
    expect(result).toStrictEqual({x: 400, y: 240});
});

test('calculateMapZoom - trivial', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.0, // Noop!
        physicalFocusPoint: { x: 10, y: 15 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);
    expect(result).toStrictEqual(SAMPLE);
});


test('calculateMapZoom - x 1.5', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 1.5,
        physicalFocusPoint: { x: 20, y: 30 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);

    const expectedResult: MapProperties = {
        widthAvailable: 400,
        heightAvailable: 300,
        zoomedWidth: 600,
        zoomedHeight: 375,
        naturalWidth: 200,
        naturalHeight: 125,
        visibleWidth: 400,
        visibleHeight: 300,
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
        physicalFocusPoint: { x: 20, y: 30 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);

    const expectedResult: MapProperties = {
        widthAvailable: 400,
        heightAvailable: 300,
        zoomedWidth: 6400,
        zoomedHeight: 4000,
        naturalWidth: 200,
        naturalHeight: 125,
        visibleWidth: 400,
        visibleHeight: 300,
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
        physicalFocusPoint: { x: 200, y: 125 },
    }
    const result = calculateMapZoom(SAMPLE, mapZoom);
    expect(result).toStrictEqual(SAMPLE_ZOOMED);
});

test('calculateMapZoom - 2x central zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 2.0,
        physicalFocusPoint: { x: 400, y: 250 },
    }
    const result = calculateMapZoom(SAMPLE_ZOOMED_CENTERED, mapZoom);
    expect(result).toStrictEqual(SAMPLE_ZOOMED_TWICE);
});

test('calculateMapZoom - 3x central zoom', () => {
    const mapZoom: MapZoom = {
        zoomFactorRatio: 2.0,
        physicalFocusPoint: { x: 800, y: 500 },
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
        zoomedWidth: 320,
        zoomedHeight: 200,
        naturalWidth: 200,
        naturalHeight: 125,
        visibleWidth: 320,
        visibleHeight: 200,
        xOffset: 0,
        yOffset: 0,
        userZoomFactor: 1.0,
        totalZoomFactor: 1.6,
        naturalToDisplayRatio: 1.6,
    };
    expect(result).toStrictEqual(expectedResult);
});


test('getNextNiceScaleExample - simple', () => {
    const result = getNextNiceScaleExample(17.3);
    expect(result).toStrictEqual({parts: 2, total: 10});
});

test('getNextNiceScaleExample - huge', () => {
    const result = getNextNiceScaleExample(60889);
    expect(result).toEqual({parts: 5, total: 50000});
})

test('getNextNiceScaleExample - tiny', () => {
    const result = getNextNiceScaleExample(0.034234);
    expect(result).toEqual({parts: 3, total: 0.03});
})
