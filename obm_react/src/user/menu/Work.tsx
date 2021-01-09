import {useDispatch, useSelector} from 'react-redux';
import {MapSet, BattleMap, BattleMapId, BattleMapCreate} from '../../api/Types';
import {NO_SUCH_BATTLE_MAP} from '../../api/BattleMap';
import {uploadMapSetArchive} from '../../api/Backup';
import {postImageData} from '../../api/Background';
import {RootState, GenericDispatch, MapProperties, Mode} from '../../redux/Types';
import {actions} from '../../redux/Store';
import ClickMenuItem from '../components/ClickMenuItem';
import TextInputMenuItem from '../components/TextInputMenuItem';
import UploadMenuItem from '../components/UploadMenuItem';
import MapScale from '../components/MapScale';
import {handleUserAction} from "../../common/Tools";


export function Work() {
    const dispatch: GenericDispatch = useDispatch();
    let mapSet: MapSet = useSelector((state: RootState) => state.mapSet);
    let battleMap: BattleMap = useSelector((state: RootState) => state.battleMap);
    let mapProperties: MapProperties = useSelector((state: RootState) => state.mapProperties);

    let refreshBattleMapSelector = async () => await dispatch(actions.mapSet.get(mapSet));

    let refreshMapBackground = async () => await dispatch(actions.battleMap.get(battleMap));

    let refreshTokens = async () => await dispatch(actions.tokens.loadTokensFromServer());

    let mySwitchAdmin = () => {
        dispatch(actions.messages.reset());
        dispatch(actions.mode.set(Mode.Admin));
    };

    let myDownloadMapSet = () => window.location.assign('/api/backup/' + mapSet.uuid);

    let myUploadMapSet = async (file: File) => {
        await handleUserAction(async () => {
            await uploadMapSetArchive(mapSet, file, dispatch);
            await refreshBattleMapSelector();
            await refreshMapBackground();
            await refreshTokens();
            dispatch(actions.mapProperties.reset());
        }, dispatch);
    }

    let myUploadBackground = async (file: File) => {
        await handleUserAction(async () => {
            await postImageData(battleMap, file, dispatch);
            await refreshMapBackground();
            dispatch(actions.mapProperties.reset());
        }, dispatch);
    };

    let myCreateBattleMap = async (name: string) => {
        await handleUserAction(async () => {
            const request: BattleMapCreate = {
                name,
                map_set_uuid: mapSet.uuid,
            }
            dispatch(actions.battleMap.create(request));
            await refreshBattleMapSelector();
            dispatch(actions.mapProperties.reset());
        }, dispatch);
    };

    let myRenameBattleMap = async (name: string) => {
        await handleUserAction(async () => {
            let changedMap: BattleMap = {...battleMap, name: name};
            dispatch(actions.battleMap.update(changedMap));
            await refreshBattleMapSelector();
        }, dispatch);
    };

    let myDeleteBattleMap = async () => {
        let warning = 'Really delete Battle Background "' + battleMap.name + '" (' + battleMap.uuid + ')?'
        if (window.confirm(warning)) {
            await handleUserAction(async () => {
                dispatch(actions.battleMap.remove(battleMap));
                for (let item of mapSet.battle_maps) {
                    if (item.uuid !== battleMap.uuid) {
                        let id: BattleMapId = {uuid: item.uuid, map_set_uuid: mapSet.uuid};
                        dispatch(actions.battleMap.get(id));
                        break;
                    }
                }
                await refreshBattleMapSelector();
                dispatch(actions.mapProperties.reset());
            }, dispatch);
        }
    };

    const noBattleMap = battleMap === null;
    if ( noBattleMap ) {
        battleMap = NO_SUCH_BATTLE_MAP;
    }

    return (
        <div>
            <ClickMenuItem label="Administration" doIt={mySwitchAdmin} />

            <h4 className="menu-item">Map Set</h4>
            <ClickMenuItem label="Export" doIt={myDownloadMapSet} />
            <UploadMenuItem label="Import" doIt={myUploadMapSet} accept=".obm"/>

            <h4 className="menu-item">Battle Map</h4>
            <TextInputMenuItem label="Create" placeholder="new map name" doIt={myCreateBattleMap} />
            <TextInputMenuItem label="Rename" initialValue={battleMap.name} doIt={myRenameBattleMap} disabled={noBattleMap} />
            <UploadMenuItem label="Upload Background Image" doIt={myUploadBackground} accept="image/*" disabled={noBattleMap} />
            <div className="menu-item-help">
                ({mapProperties.naturalWidth}x{mapProperties.naturalHeight}
                - Zoom: {mapProperties.userZoomFactor.toFixed(1)}
                - Mag.: {mapProperties.naturalToDisplayRatio.toFixed(1)})
            </div>
            <MapScale />
            <ClickMenuItem label="Delete" doIt={myDeleteBattleMap} disabled={noBattleMap} />
        </div>
    );
}

export default Work;