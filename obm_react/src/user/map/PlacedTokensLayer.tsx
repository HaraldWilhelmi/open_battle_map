import {useSelector} from 'react-redux';
import {TokenState} from '../../api/Types';
import {RootState} from '../../redux/Types';
import PlacedToken from '../components/PlacedToken';
import {getTokenIdAsString} from '../tools/Token';

export function PlacedTokensLayer() {
    const placedTokens = useSelector(
        (state: RootState) => state.placedTokens
    )

    const tokens = placedTokens.map(
        (token: TokenState) => <PlacedToken token={token} key={getTokenIdAsString(token)}/>
    )

    return <div className="placed-token-container">
        {tokens}
    </div>;
}

export default PlacedTokensLayer;
