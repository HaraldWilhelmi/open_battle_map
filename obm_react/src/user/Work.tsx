import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSet} from '../redux/SelectedMapSet';
import {BattleMap} from '../redux/SelectedBattleMap';
import {switchAdmin, refreshSelectedData, refreshSelectedDataAfterDelete} from './Tools';
import {createBattleMap, updateBattleMap, deleteBattleMap} from './api/BattleMap';
import ClickMenuItem from './components/ClickMenuItem';
import TextInputMenuItem from './components/TextInputMenuItem';


function copyBattleMap(old: BattleMap): BattleMap {
    return {
        uuid: old.uuid,
        map_set_uuid: old.map_set_uuid,
        name: old.name,
    }
}


export function Work() {
    const dispatch: ReduxDispatch = useDispatch();
    let mapSet: MapSet = useSelector((state: RootState) => state.selectedMapSet);
    let battleMap: BattleMap = useSelector((state: RootState) => state.selectedBattleMap);

    let mySwitchAdmin = () => switchAdmin(dispatch);

    let myDownloadMapSet = () => {};
    let myUploadMapSet = () => {};

    let myUploadBackground = () => {};

    let myCreateBattleMap = async (name: string) => {
        let newMap = await createBattleMap(dispatch, battleMap.map_set_uuid, name);
        if ( newMap !== undefined ) {
            refreshSelectedData(dispatch, mapSet, newMap);
        }
    };

    let myRenameBattleMap = (name: string) => {
        let changedMap = copyBattleMap(battleMap);
        changedMap.name = name;
        updateBattleMap(dispatch, changedMap);
        refreshSelectedData(dispatch, mapSet, battleMap);
    };

    let myDeleteBattleMap = () => {
        let warning = 'Really delete Battle Map "' + battleMap.name + '" ('
            + battleMap.uuid + ')?'
        if (window.confirm(warning)) {
            deleteBattleMap(dispatch, battleMap);
            refreshSelectedDataAfterDelete(dispatch, mapSet);
        }
    };

    return (
        <div>
            <ClickMenuItem label="Administration" doIt={mySwitchAdmin} />

            <h4 className="menu-item">Map Set</h4>
            <ClickMenuItem label="Download Map Set" doIt={myDownloadMapSet} />
            <ClickMenuItem label="Upload Map Set" doIt={myUploadMapSet} />

            <h4 className="menu-item">Battle Map</h4>
            <ClickMenuItem label="Upload Map Image" doIt={myUploadBackground} />
            <TextInputMenuItem label="Create" placeholder="new map name" doIt={myCreateBattleMap} />
            <TextInputMenuItem label="Rename" initialValue={battleMap.name} doIt={myRenameBattleMap} />
            <ClickMenuItem label="Delete" doIt={myDeleteBattleMap} />
        </div>
    );
}

export default Work;