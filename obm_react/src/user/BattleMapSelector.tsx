import {useDispatch, useSelector} from 'react-redux';
import {actions} from '../redux/Store';
import {RootState, GenericDispatch} from '../redux/Types';
import {MapSet, BattleMap, BattleMapId} from '../api/Types';


export function BattleMapSelector() {
    const dispatch: GenericDispatch = useDispatch();
    let mapSet: MapSet | null = useSelector(
        (state: RootState) => state.mapSet
    );
    let battleMap: BattleMap | null = useSelector(
        (state: RootState) => state.battleMap
    );

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

    let changeBattleMap = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        if ( mapSet === null ) {
            return;
        }
        const id: BattleMapId = { uuid: event.target.value, map_set_uuid: mapSet.uuid };
        dispatch(actions.messages.reset());
        dispatch(actions.battleMap.get(id));
        dispatch(actions.mapProperties.reset());
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
