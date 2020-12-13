import {useDispatch, useSelector} from 'react-redux';
import {ReduxDispatch} from '../redux/Store';
import {RootState} from '../redux/Types';
import {MapSet} from '../redux/SelectedMapSet';
import {BattleMap, setSelectedBattleMap, NO_SUCH_BATTLE_MAP} from '../redux/SelectedBattleMap';
import {
    switchAdmin, loadSelectedMapSet, loadSelectedBattleMap, uploadBackgroundImage
} from './Tools';
import {uploadMapSetArchive} from './api/MapSet';
import {createBattleMap, updateBattleMap, deleteBattleMap} from './api/BattleMap';
import ClickMenuItem from './components/ClickMenuItem';
import TextInputMenuItem from './components/TextInputMenuItem';
import UploadMenuItem from './components/UploadMenuItem';


export function Work() {
    const dispatch: ReduxDispatch = useDispatch();
    let mapSet: MapSet = useSelector((state: RootState) => state.selectedMapSet);
    let battleMap: BattleMap = useSelector((state: RootState) => state.selectedBattleMap);
    let noBattleMap: boolean = battleMap === NO_SUCH_BATTLE_MAP;

    let mySwitchAdmin = () => switchAdmin(dispatch);

    let myDownloadMapSet = () => {
        window.location.assign('/api/map_set/download/' + mapSet.uuid);
    };
    let myUploadMapSet = (file: File) => {
        uploadMapSetArchive(dispatch, mapSet.uuid, file)
    };

    let myUploadBackground = (file: File) => {
        uploadBackgroundImage(dispatch, battleMap, file);
    };

    let myCreateBattleMap = async (name: string) => {
        let newMap = await createBattleMap(dispatch, mapSet.uuid, name);
        if ( newMap !== undefined ) {
            dispatch(setSelectedBattleMap(newMap));
            await loadSelectedMapSet(dispatch, mapSet.uuid);
            await loadSelectedBattleMap(dispatch, newMap.map_set_uuid, newMap.uuid);
        }
    };

    let myRenameBattleMap = async (name: string) => {
        let changedMap: BattleMap = {...battleMap, name: name};
        await updateBattleMap(dispatch, changedMap);
        await loadSelectedMapSet(dispatch, mapSet.uuid);
        await loadSelectedBattleMap(dispatch, battleMap.map_set_uuid, battleMap.uuid);
    };

    let myDeleteBattleMap = async () => {
        let warning = 'Really delete Battle Map "' + battleMap.name + '" ('
            + battleMap.uuid + ')?'
        if (window.confirm(warning)) {
            await deleteBattleMap(dispatch, battleMap);
            let newMapSet = await loadSelectedMapSet(dispatch, mapSet.uuid);
            if ( newMapSet.battle_maps.length > 0 ) {
                await loadSelectedBattleMap(dispatch, newMapSet.uuid, newMapSet.battle_maps[0].uuid);
            } else {
                dispatch(setSelectedBattleMap(NO_SUCH_BATTLE_MAP));
            }
        }
    };

    return (
        <div>
            <ClickMenuItem label="Administration" doIt={mySwitchAdmin} />

            <h4 className="menu-item">Map Set</h4>
            <ClickMenuItem label="Export Map Set" doIt={myDownloadMapSet} />
            <UploadMenuItem label="Import Map Set" doIt={myUploadMapSet} accept=".obm"/>

            <h4 className="menu-item">Battle Map</h4>
            <TextInputMenuItem label="Create" placeholder="new map name" doIt={myCreateBattleMap} />
            <TextInputMenuItem label="Rename" initialValue={battleMap.name} doIt={myRenameBattleMap} disabled={noBattleMap} />
            <UploadMenuItem label="Upload Map Image" doIt={myUploadBackground} accept="image/*" disabled={noBattleMap} />
            <ClickMenuItem label="Delete" doIt={myDeleteBattleMap} disabled={noBattleMap} />
        </div>
    );
}

export default Work;