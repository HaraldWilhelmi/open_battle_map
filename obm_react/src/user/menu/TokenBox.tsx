import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, GenericDispatch, MouseMode} from '../../redux/Types';
import {actions} from '../../redux/Store';
import BoxToken from '../components/BoxToken';


export function TokenBox() {
    const dispatch: GenericDispatch = useDispatch();

    const mouse = useSelector(
        (state: RootState) => state.mouse
    );

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    let tokens: JSX.Element[] = [];
    if ( mapSet !== null ) {
        for ( let tokenDescriptor of mapSet.token_set ) {
            for (let colorCombo of tokenDescriptor.color_combos) {
                const key = tokenDescriptor.token_type + '/' + colorCombo.color + '/' + colorCombo.mark_color;
                tokens.push(
                    <BoxToken tokenDescriptor={tokenDescriptor} colorCombo={colorCombo} key={key}/>
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