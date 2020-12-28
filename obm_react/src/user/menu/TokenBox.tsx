import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {TokenType} from "../../api/Types";
import {RootState, GenericDispatch, MouseMode, MouseState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import BoxToken from '../components/BoxToken';


export function TokenBox() {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const defaultTokenSet: TokenType[] = useSelector(
        (state: RootState) => state.defaultTokenSet
    );

    let tokens: JSX.Element[] = [];
    if ( defaultTokenSet !== null ) {
        for (let tokenType of defaultTokenSet) {
            for (let colorCombo of tokenType.color_combos) {
                const key = tokenType.token_type + '/' + colorCombo.color + '/' + colorCombo.mark_color;
                tokens.push(
                    <BoxToken tokenType={tokenType} colorCombo={colorCombo} key={key}/>
                );
            }
        }
    }

    function discardToken(event: MouseEvent)  {
        if ( mouse.mode === MouseMode.MoveToken) {
            dispatch(actions.tokens.dropIntoBox());
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