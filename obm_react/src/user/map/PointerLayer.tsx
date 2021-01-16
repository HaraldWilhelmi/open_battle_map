import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from "react";
import {PointerAction} from '../../api/Types';
import {RootState, GenericDispatch} from '../../redux/Types';
import MovingPointer, {PointerMove} from '../components/MovingPointer';
import {isOffMap} from "../tools/Map";


const INITIAL_POINTER_LIST: PointerMove[] = [];


export function PointerLayer() {
    const [mapSetUuid, setMapSetUuid] = useState('');
    const [battleMapUuid, setBattleMapUuid] = useState('');
    const [lastActionIndex, setLastActionIndex] = useState(0);
    const [pointerList, setPointerList] = useState(INITIAL_POINTER_LIST);
    const dispatch: GenericDispatch = useDispatch();

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );
    const actionHistory = useSelector(
        (state: RootState) => state.actionHistory
    );
    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    useEffect( // Reset pointer list if battle map was switched
        () => {
            if ( battleMap === null ) {
                if (pointerList.length > 0) {
                    setPointerList(INITIAL_POINTER_LIST);
                    setMapSetUuid('');
                    setBattleMapUuid('');
                }
            } else if ( battleMap.uuid !== battleMapUuid
                || battleMap.map_set_uuid !== mapSetUuid
            ) {
                if (pointerList.length > 0) {
                    setPointerList(INITIAL_POINTER_LIST);
                }
                setMapSetUuid(battleMap.map_set_uuid);
                setBattleMapUuid(battleMap.uuid);
            }
            return undefined;
        },
        [battleMap, battleMapUuid, mapSetUuid, pointerList, dispatch]
    )

    useEffect( // Process recent Actions
        () => {
            if ( actionHistory === null || actionHistory.last_action_index <= lastActionIndex ) {
                return undefined;
            }
            let updatedList: PointerMove[] | null = null;
            for ( let action of actionHistory.pointer_actions ) {
                if ( action.uuid !== mouse.pointerUuid ) {
                    if ( updatedList === null ) {
                        updatedList = [...pointerList];
                    }
                    updatedList = updatePointerList(updatedList, action);
                }
            }
            if ( updatedList !== null ) {
                setPointerList(updatedList);
            }
            setLastActionIndex(actionHistory.last_action_index);
            return undefined;
        },
        [actionHistory, lastActionIndex, mouse, pointerList]
    )

    function updatePointerList(list: PointerMove[], action: PointerAction) {
        const index = list.findIndex((x) => x.uuid === action.uuid);
        if ( index >= 0 ) {
            const fromPosition = list[index].position;
            list[index].position = action.position;
            list[index].fromPosition = fromPosition;
            if ( isOffMap(action.position) ) {
                list.splice(index, 1);
            }
        } else {
            if ( ! isOffMap(action.position) ) {
                const newAction: PointerMove = {...action, fromPosition: action.position};
                list.push(newAction);
            }
        }
        return list;
    }

    function removePointer(uuid: string): void {
        const index = pointerList.findIndex((x) => x.uuid === uuid);
        if ( index >= 0 ) {
            const newList = [...pointerList.slice(0, index), ...pointerList.slice(index+1)];
            setPointerList(newList);
        }
    }

    const movingPointers = pointerList.map(
        x => <MovingPointer move={x} key={x.uuid} finish={() => removePointer(x.uuid)}/>
    );

    return <div className="token-container">
        {movingPointers}
    </div>;
}

export default PointerLayer;