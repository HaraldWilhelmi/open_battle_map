import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MapProperties, GeometryUpdate, MapMove, MapZoom} from '../Types';
import {calculateGeometryUpdate, calculateMapMove, calculateMapZoom} from '../../user/tools/Map';

export const INITIAL_STATE: MapProperties = {
    widthAvailable: 0,
    heightAvailable: 0,
    width: 0,
    height: 0,
    naturalWidth: 0,
    naturalHeight: 0,
    xOffset: 0,
    yOffset: 0,
    userZoomFactor: 1.0,
    totalZoomFactor: 1.0,
    naturalToDisplayRatio: 1.0,
};

export const slice = createSlice({
    name: 'mapProperties',
    initialState: INITIAL_STATE,
    reducers: {
        set: (state, action: PayloadAction<MapProperties>) => action.payload,
        reset: (state) => {
            const newState: MapProperties = {...state, xOffset: 0, yOffset: 0, userZoomFactor: 1.0};
            return newState;
        },
        updateGeometry: (state, action: PayloadAction<GeometryUpdate>) =>
            calculateGeometryUpdate(state, action.payload),
        move: (state, action: PayloadAction<MapMove>) => calculateMapMove(state, action.payload),
        zoom: (state, action: PayloadAction<MapZoom>) => calculateMapZoom(state, action.payload),
    },
});

export const mapPropertiesActions = slice.actions;

export default slice.reducer;
