import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/Types';
import {BattleMap, NO_SUCH_BATTLE_MAP} from '../redux/SelectedBattleMap';

export function Map() {
    const [revision, setRevision] = useState(0);

    let battleMap: BattleMap = useSelector(
        (state: RootState) => state.selectedBattleMap
    );

    useEffect(
        () => {
            setRevision(battleMap.background_revision);
            return undefined;
        },
        [battleMap]
    )

    if ( battleMap.uuid === NO_SUCH_BATTLE_MAP.uuid ) {
        return ( <p>:-(</p> );
    }

    // The query parameter is actually unused, but ensures a refresh/render of the image.
    let url = '/api/image_data/' + battleMap.map_set_uuid + '/' + battleMap.uuid + '?v=' + revision;

    return (
        <img src={url} alt="Battle Map Background" />
    );
}

export default Map;
