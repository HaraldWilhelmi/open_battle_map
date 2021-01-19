import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {GenericDispatch, MapMove, MouseMode, RootState} from '../redux/Types';
import {actions} from '../redux/Store';


export function Keyboard() {
    const dispatch: GenericDispatch = useDispatch();

    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    function doKeyboard(event: KeyboardEvent): void {
        event.stopPropagation();
        switch ( event.key ) {
            case 'm': {
                if (mouse.mode === MouseMode.Default) {
                    dispatch(actions.mouse.startMeasurement());
                } else if (mouse.mode === MouseMode.MeasureFrom || mouse.mode === MouseMode.MeasureTo) {
                    dispatch(actions.mouse.stopMeasurement());
                }
                break;
            }
            case 'Escape': {
                if (mouse.mode === MouseMode.MeasureTo || mouse.mode === MouseMode.MeasureFrom) {
                    dispatch(actions.mouse.stopMeasurement());
                }
                if (mouse.mode === MouseMode.Pointer) {
                    dispatch(actions.mouse.stopPointer());
                }
                break;
            }
            case 'w': { mapMove(0, 1); break; }
            case 's': { mapMove(0, -1); break; }
            case 'a': { mapMove(1, 0); break; }
            case 'd': { mapMove(-1, 0); break; }
        }
    }

    function mapMove(x: number, y: number): void {
        const movementStepPixels = mapProperties.widthAvailable / 8;
        const mapMove: MapMove = {
            deltaX: x * movementStepPixels,
            deltaY: y * movementStepPixels,
        };
        dispatch(actions.mapProperties.move(mapMove));
    }

    useEffect(
        () => {
            document.addEventListener('keydown', doKeyboard);
            return () => document.removeEventListener('keydown', doKeyboard);
        }
    );

    return <div />;
}

export default Keyboard;
