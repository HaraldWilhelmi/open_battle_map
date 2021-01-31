import {useDispatch, useSelector} from 'react-redux';
import {GenericDispatch, MouseMode, RootState} from '../../redux/Types';
import Pointer from "../components/Pointer";
import {isEasyExitMouseMode} from "../tools/Mouse";
import {changePointerColor, switchOnPointer} from "../tools/Pointer";


export function PointerBox() {
    const dispatch: GenericDispatch = useDispatch();

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const selectPointer = (color: string) => {
        if ( mouse.mode === MouseMode.Pointer ) {
            changePointerColor(color, dispatch);
        } else if ( isEasyExitMouseMode(mouse.mode) ) {
            switchOnPointer(color, dispatch);
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