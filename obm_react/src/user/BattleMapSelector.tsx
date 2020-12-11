import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSet} from '../redux/SelectedMapSet';
import {BattleMap} from '../redux/SelectedBattleMap';
import {resetMessages} from '../redux/Messages';
import {loadSelectedBattleMap} from './Tools';


export function BattleMapSelector() {
    const dispatch: ReduxDispatch = useDispatch();
    let mapSet: MapSet = useSelector(
        (state: RootState) => state.selectedMapSet
    );
    let battleMap: BattleMap = useSelector(
        (state: RootState) => state.selectedBattleMap
    );

    let options = mapSet.battle_maps.map(
        (item) => (
            <option value={item.uuid} key={item.uuid}>{item.name}</option>
        )
    );
    let changeBattleMap = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        loadSelectedBattleMap(dispatch, mapSet.uuid, event.target.value);
        dispatch(resetMessages());
    };

    return (
        <div>
            <label className="menu-item">Battle Map:</label>
            <div className="menu-item">
                <select className="custom-select" onChange={changeBattleMap} value={battleMap.uuid}>
                    {options}
                </select>
            </div>
        </div>
    );
}

export default BattleMapSelector;