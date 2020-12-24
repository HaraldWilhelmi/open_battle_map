import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, GenericDispatch, MouseMode, MouseState} from '../redux/Types';
import {actions} from '../redux/Store';
import {standardTokens} from './tools/Token';
import {BoxToken} from './components/BoxToken';


export function TokenBox() {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const tokens = standardTokens.map(
        (tokenId, index) => <BoxToken tokenId={tokenId} key={index}/>
    );

    function discardToken(event: MouseEvent)  {
        if ( mouse.mode === MouseMode.MoveToken) {
            dispatch(actions.mouse.releaseToken());
            event.stopPropagation();
        }
    }

    return (
        <div>
            <h4 className="menu-item">Token Box</h4>
            <div className="token-box" onClick={discardToken}>
                {tokens}
            </div>
        </div>
    );
}

export default TokenBox;