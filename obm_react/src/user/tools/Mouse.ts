import {MouseMode} from "../../redux/Types";

export function isEasyExitMouseMode(mode: MouseMode): boolean {
    return mode === MouseMode.Default
        || mode === MouseMode.MeasureFrom
        || mode === MouseMode.MeasureTo
        || mode === MouseMode.Pointer;
}