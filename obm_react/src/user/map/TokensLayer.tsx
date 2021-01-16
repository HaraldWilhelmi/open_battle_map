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
    );
    const actionHistory = useSelector(
        (state: RootState) => state.actionHistory
    );

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
            if ( actionHistory === null ) { return undefined; }
            if ( actionHistory?.battle_map_revision !== battleMap?.revision ) {
                if ( actionHistory?.battle_map_revision > battleMap?.revision ) {
                    dispatch(actions.battleMap.get(battleMap))
                }
            }
            return undefined;
        },
        [actionHistory, battleMap, dispatch]
    )

    useEffect( // Process recent Actions
        () => {
            if ( actionHistory === null || actionHistory.last_action_index <= lastActionIndex ) {
                return undefined;
            }
            for ( let tokenAction of actionHistory.token_actions ) {
                if ( localTokenActionTrack.find(it => it === tokenAction.uuid) !== undefined ) { // Ignore local token_actions
                    dispatch(actions.localTokenActionTrack.forget(tokenAction.uuid));
                } else {
                    dispatch(actions.tokens.startMove(tokenAction));
                }
            }
            setLastActionIndex(actionHistory.last_action_index);
            return undefined;
        },
        [actionHistory, lastActionIndex, localTokenActionTrack, dispatch]
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
