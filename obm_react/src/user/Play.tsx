import {useSelector} from 'react-redux';
import {BattleMap, TokenId} from '../api/Types';
import {RootState} from '../redux/Types';
import {getTokenImageUrl} from './tools/Token';


export function Play() {
    let battleMap: BattleMap = useSelector((state: RootState) => state.battleMap);

    if ( battleMap === null ) {
        return <div>Loading ...</div>;
    }

    const standardTokens: TokenId[] =
        ['red', 'green', 'blue', 'yellow', 'white', 'gray'].map(
            (color: string) => {
                return {
                    map_set_uuid: battleMap.map_set_uuid,
                    token_type: 0,
                    color,
                    mark: '',
                };
            }
        );

    const tokens = standardTokens.map(
        (tokenId, index) => {
            const url = getTokenImageUrl(tokenId);
            return <img
                className="token-in-box"
                src={url}
                alt={tokenId.color + " token"}
                key={index}
                />
            }
        );

    return (
        <div>
            <h4 className="menu-item">Token Box</h4>
            <div className="token-box">
                {tokens}
            </div>
        </div>
    );
}

export default Play;