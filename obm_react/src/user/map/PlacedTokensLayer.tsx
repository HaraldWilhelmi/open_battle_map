import {useDispatch, useSelector} from 'react-redux';
import {TokenState} from '../../api/Types';
import {RootState, GenericDispatch} from '../../redux/Types';
import PlacedToken from '../components/PlacedToken';
import {getTokenIdAsString} from '../tools/Token';
import {useEffect, useState} from "react";
import {actions} from "../../redux/Store";

export function PlacedTokensLayer() {
    const [mapSetUuid, setMapSetUuid] = useState('')
    const [battleMapUuid, setBattleMapUuid] = useState('');
    const dispatch: GenericDispatch = useDispatch();

    const tokens = useSelector(
        (state: RootState) => state.tokens
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    useEffect(
        () => {
            if (battleMap === null) {
                return undefined;
            }
            if (battleMap.uuid !== battleMapUuid || battleMap.map_set_uuid !== mapSetUuid) {
                setMapSetUuid(battleMap.map_set_uuid);
                setBattleMapUuid(battleMap.uuid);
                dispatch(actions.tokens.loadTokensFromServer());
            }
        },
        [battleMap, dispatch]
    )

    const placedTokens = tokens.placedTokens.map(
        (token: TokenState) => <PlacedToken token={token} key={getTokenIdAsString(token)}/>
    )

    return <div className="placed-token-container">
        {placedTokens}
    </div>;
}

export default PlacedTokensLayer;
