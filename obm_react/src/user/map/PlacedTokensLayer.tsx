import {useSelector} from 'react-redux';
import {TokenState} from '../../api/Types';
import {RootState} from '../../redux/Types';
import PlacedToken from '../components/PlacedToken';
import {getTokenIdAsString} from '../tools/Token';

export function PlacedTokensLayer() {
    const tokens = useSelector(
        (state: RootState) => state.tokens
    )

    const placedTokens = tokens.placedTokens.map(
        (token: TokenState) => <PlacedToken token={token} key={getTokenIdAsString(token)}/>
    )

    return <div className="placed-token-container">
        {placedTokens}
    </div>;
}

export default PlacedTokensLayer;
