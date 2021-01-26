import {useDispatch, useSelector} from 'react-redux';
import {GenericDispatch, RootState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import Pointer from "../components/Pointer";
import {isEasyExitMouseMode} from "../tools/Mouse";


export function PointerBox() {
    const dispatch: GenericDispatch = useDispatch();

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const selectPointer = (color: string) => {
        if ( isEasyExitMouseMode(mouse.mode) ) {
            dispatch(actions.mouse.startPointer(color));
        }
    }

    const boxPointers = ["Red", "Green", "Blue", "Black", "Yellow"].map(
        (color) => <Pointer
            color={color}
            onClick={() => selectPointer(color)}
            fades={false}
            key={color}
        />
    );

    return (
        <div>
            <h4 className="menu-item">Pointers</h4>
            <div className="token-box">
                {boxPointers}
            </div>
        </div>
    );
}

export default PointerBox;