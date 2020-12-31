import {useDispatch, useSelector} from 'react-redux';
import {TokenState} from '../../api/Types';
import {RootState, GenericDispatch, ActingTokenState} from '../../redux/Types';
import PlacedToken from '../components/PlacedToken';
import {getTokenIdAsString} from '../tools/Token';
import {useEffect, useState} from "react";
import {actions} from "../../redux/Store";
import MovingToken from "../components/MovingToken";

export function TokensLayer() {
    const [mapSetUuid, setMapSetUuid] = useState('');
    const [battleMapUuid, setBattleMapUuid] = useState('');
    const [lastActionIndex, setLastActionIndex] = useState(0);
    const dispatch: GenericDispatch = useDispatch();

    const tokens = useSelector(
        (state: RootState) => state.tokens
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );
    const localTokenActionTrack = useSelector(
        (state: RootState) => state.localTokenActionTrack
    )
    const tokenActionHistory = useSelector(
        (state: RootState) => state.tokenActionHistory
    )

    useEffect( // Load tokens form server if Battle Map was switched
        () => {
            if (battleMap === null) {
                return undefined;
            }
            if (battleMap.uuid !== battleMapUuid || battleMap.map_set_uuid !== mapSetUuid) {
                setMapSetUuid(battleMap.map_set_uuid);
                setBattleMapUuid(battleMap.uuid);
                dispatch(actions.tokens.loadTokensFromServer());
            }
            return undefined;
        },
        [battleMap, battleMapUuid, mapSetUuid, dispatch]
    )

    useEffect( // Reload battle map if we detected an update in the Token Action History
        () => {
            if ( tokenActionHistory === null ) { return undefined; }
            if ( tokenActionHistory?.battle_map_revision !== battleMap?.revision ) {
                console.log("battle_map_revision " + (tokenActionHistory?.battle_map_revision ?? 'nix') + "/" + battleMap?.revision ?? 'nix');
                console.log("battle_map_revision type " + typeof tokenActionHistory?.battle_map_revision + "/" + typeof battleMap?.revision);
                dispatch(actions.battleMap.get(battleMap))
            }
            return undefined;
        },
        [tokenActionHistory, battleMap, dispatch]
    )

    useEffect( // Process recent Token Actions
        () => {
            if ( tokenActionHistory === null || tokenActionHistory.last_action_index <= lastActionIndex ) {
                return undefined;
            }
            for ( let tokenAction of tokenActionHistory.actions ) {
                if ( localTokenActionTrack.find(it => it === tokenAction.uuid) !== undefined ) { // Ignore local actions
                    dispatch(actions.localTokenActionTrack.forget(tokenAction.uuid));
                } else {
                    dispatch(actions.tokens.startMove(tokenAction));
                }
            }
            setLastActionIndex(tokenActionHistory.last_action_index);
            return undefined;
        },
        [tokenActionHistory, lastActionIndex, localTokenActionTrack, dispatch]
    )

    const movingTokens = tokens.actingTokens.map(
        (token: ActingTokenState) => <MovingToken token={token} key={getTokenIdAsString(token)}/>
    )
    const placedTokens = tokens.placedTokens.map(
        (token: TokenState) => <PlacedToken token={token} key={getTokenIdAsString(token)}/>
    )

    return <div className="token-container">
        {movingTokens}
        {placedTokens}
    </div>;
}

export default TokensLayer;
