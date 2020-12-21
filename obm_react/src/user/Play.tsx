import {useDispatch, useSelector} from 'react-redux';
import {BattleMap} from '../api/Types';
import {RootState} from '../redux/Types';


const tokenColors: string[] = ['red', 'green', 'blue', 'yellow', 'white', 'gray'];

export function Play() {
    let battleMap: BattleMap = useSelector((state: RootState) => state.battleMap);

    if ( battleMap === null ) {
        return <div>Loading ...</div>;
    }

    const tokens = tokenColors.map(
        (color) => <img
            src={"/api/token_image/" + battleMap.map_set_uuid + "/0/" + color + "/_" }
            alt={color + " token"}
            key={color}
            />
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