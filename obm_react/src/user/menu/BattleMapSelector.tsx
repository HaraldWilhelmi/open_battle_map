import {ChangeEvent} from "react";
import {useDispatch, useSelector} from 'react-redux';
import {actions} from '../../redux/Store';
import {GenericDispatch, MouseMode, RootState} from '../../redux/Types';
import {BattleMapId} from '../../api/Types';
import {handleUserAction} from "../../common/Tools";
import {switchOffPointer} from "../tools/Pointer";


export function BattleMapSelector() {
    const dispatch: GenericDispatch = useDispatch();
    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );
    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );
    const mouse = useSelector(
        (state: RootState) => state.mouse
    )

    let selectedValue = 'nada';
    let options = [<option value={selectedValue} key="Dummy">No Battle Maps</option>];
    let disabled = true;
    if ( mapSet !== null && battleMap !== null && mapSet.battle_maps.length > 0 ) {
        selectedValue = battleMap.uuid;
        options = mapSet.battle_maps.map(
            (item) => (
                <option value={item.uuid} key={item.uuid}>{item.name}</option>
            )
        );
        disabled = false;

    }

    let changeBattleMap = (event: ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        if ( mapSet !== null ) {
            const id: BattleMapId = {uuid: event.target.value, map_set_uuid: mapSet.uuid};
            handleUserAction(
                async () => {
                    if ( mouse.mode === MouseMode.Pointer ) {
                        switchOffPointer(dispatch);
                    }
                    dispatch(actions.battleMap.get(id));
                    dispatch(actions.mapProperties.reset());
                },
                dispatch
            );
        }
    };

    return (
        <div>
            <label className="menu-item">Battle Map:</label>
            <div className="menu-item">
                <select className="custom-select"
                    onChange={changeBattleMap}
                    value={selectedValue}
                    disabled={disabled}
                >
                    {options}
                </select>
            </div>
        </div>
    );
}

export default BattleMapSelector;
