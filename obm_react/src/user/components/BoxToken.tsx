import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {TokenType, ColorCombo, TokenState, Coordinate, NEW_TOKEN_MARK, TokenId} from '../../api/Types';
import {RootState, GenericDispatch, MouseMode, MouseState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {Token} from './Token';


interface Props {
    tokenType: TokenType,
    colorCombo: ColorCombo,
}

export function BoxToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    function pickupToken(event: MouseEvent) {
        if ( mouse.mode === MouseMode.Default ) {
            event.stopPropagation();
            event.preventDefault();
            const position: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const token: TokenState = {...props.colorCombo,
                token_type: props.tokenType.token_type,
                mark: NEW_TOKEN_MARK,
                position,
                rotation: 0.0,
            };
            dispatch(actions.mouse.grabToken(token));
        }
    }

    const tokenId: TokenId = {...props.colorCombo,
        token_type: props.tokenType.token_type,
        mark: '0',
    };

    return <div className="token-in-box">
            <Token tokenId={tokenId} width={45} rotation={0.0} onClick={pickupToken} onWheel={() => { return; }} />
        </div>

}

export default BoxToken;