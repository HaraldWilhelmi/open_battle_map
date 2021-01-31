import {GenericDispatch} from "../../redux/Types";
import {handleUserAction} from "../../common/Tools";
import {actions} from "../../redux/Store";
import {Coordinate, OFF_MAP_POSITION} from "../../api/Types";


export function switchOnPointer(color: string, dispatch: GenericDispatch): void {
    handleUserAction(
        async () => {
            dispatch(actions.pointerAction.startSync(null));
            dispatch(actions.mouse.startPointer(color));
        }, dispatch
    );
}

export function switchOffPointer(dispatch: GenericDispatch): void {
    handleUserAction(
        async () => {
            dispatch(actions.pointerAction.put(OFF_MAP_POSITION));
            dispatch(actions.pointerAction.stopSync());
            dispatch(actions.mouse.stopPointer());
        }, dispatch
    );
}

export function changePointerColor(color: string, dispatch: GenericDispatch): void {
    handleUserAction(
        async () => {
            dispatch(actions.mouse.startPointer(color));
        }, dispatch
    );
}

export function hidePointer(dispatch: GenericDispatch) {
    handleUserAction(
        async () => {
            dispatch(actions.pointerAction.put(OFF_MAP_POSITION));
        }, dispatch
    );
}

export function movePointer(position: Coordinate, dispatch: GenericDispatch) {
    handleUserAction(
        async () => {
            dispatch(actions.pointerAction.put(position));
        }, dispatch
    );
}
