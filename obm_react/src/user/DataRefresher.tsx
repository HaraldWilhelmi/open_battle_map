import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSet} from '../redux/SelectedMapSet';
import {BattleMap} from '../redux/SelectedBattleMap';
import {refreshSelectedData} from './Tools';


export function DataRefresher() {
    const dispatch: ReduxDispatch = useDispatch();

    let mapSet: MapSet = useSelector(
        (state: RootState) => state.selectedMapSet
    );

    let battleMap: BattleMap = useSelector(
        (state: RootState) => state.selectedBattleMap
    );


    useEffect(
            () => {
                let timer: any;

                async function myUpdate() {
                    try {
                        await refreshSelectedData(dispatch, mapSet, battleMap);
                    }
                    finally {
                        timer = setTimeout(myUpdate, 60000);
                    }
                }

                timer = setTimeout(myUpdate, 60000);
                return () => clearTimeout(timer);
            },
            [dispatch, mapSet, battleMap]
    );

    return <div />;
}

export default DataRefresher;
