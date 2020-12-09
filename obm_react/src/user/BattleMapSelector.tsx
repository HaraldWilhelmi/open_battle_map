import {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSet, BattleMapItem} from '../redux/SelectedMapSet';
import {BattleMap, NO_SUCH_BATTLE_MAP} from '../redux/SelectedBattleMap';
import {updateSelectedBattleMap} from './Tools';

const INITIAL_BATTLE_MAP_LIST: BattleMapItem[] = [];

function findNewBattleMapId(oldUuid: string, battleMapList: BattleMapItem[]): string {
    for ( let item of battleMapList ) {
        if ( oldUuid === item.uuid ) {
            return oldUuid;
        }
    }
    if ( battleMapList.length > 0 ) {
        return battleMapList[0].uuid;
    } else {
        return NO_SUCH_BATTLE_MAP.uuid;
    }
}

function equalBattleSetList(a: BattleMapItem[], b: BattleMapItem[]): boolean {
    if ( a.length !== b.length ) {
        return false;
    }
    for ( let i = 0; i < a.length; i++ ) {
        if ( a[i].name !== b[i].name || a[i].uuid !== b[i].uuid ) {
            return false;
        }
    }
    return true;
}

export function BattleMapSelector() {
    const [battleMapUuid, setBattleMapUuid] = useState(NO_SUCH_BATTLE_MAP.uuid);
    const [battleMapList, setBattleMapList] = useState(INITIAL_BATTLE_MAP_LIST);

    const dispatch: ReduxDispatch = useDispatch();
    let mapSet: MapSet = useSelector(
        (state: RootState) => state.selectedMapSet
    );
    let battleMap: BattleMap = useSelector(
        (state: RootState) => state.selectedBattleMap
    );

    useEffect(
        () => {
            if ( ! equalBattleSetList(battleMapList, mapSet.battle_maps) ) {
                setBattleMapList(mapSet.battle_maps);
            }
            let newBattleMapUuid = findNewBattleMapId(battleMapUuid, mapSet.battle_maps);
            if ( newBattleMapUuid !== battleMap.uuid ) {
                updateSelectedBattleMap(dispatch, mapSet.uuid, newBattleMapUuid);
                setBattleMapUuid(newBattleMapUuid);
            }
        },
        [mapSet, battleMap, battleMapList, battleMapUuid, dispatch]
    );

    let options = mapSet.battle_maps.map(
        (item) => (
            item.uuid === battleMapUuid ?
            <option value={item.uuid} selected key={item.uuid}>{item.name}</option> :
            <option value={item.uuid} key={item.uuid}>{item.name}</option>
        )
    );
    let changeBattleMap = (event: React.ChangeEvent<HTMLSelectElement>) => {
        event.preventDefault();
        updateSelectedBattleMap(dispatch, mapSet.uuid, event.target.value)
    };

    return (
        <select className="custom-select" onChange={changeBattleMap}>
            {options}
        </select>
    );
}

export default BattleMapSelector;