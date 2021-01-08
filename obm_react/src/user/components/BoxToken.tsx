import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import CSS from 'csstype';
import {TokenType, ColorCombo, Coordinate, NEW_TOKEN_MARK, TokenId} from '../../api/Types';
import {RootState, GenericDispatch, MouseMode, MouseState, FlyingToken} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {Token} from './Token';
import {getTokenType} from "../tools/Token";


const BOX_TOKEN_WIDTH = 45;


interface Props {
    tokenType: TokenType,
    colorCombo: ColorCombo,
}

export function BoxToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const defaultTokenSet: TokenType[] = useSelector(
        (state: RootState) => state.defaultTokenSet
    );

    function pickupToken(event: MouseEvent) {
        if ( mouse.mode === MouseMode.Default ) {
            event.stopPropagation();
            event.preventDefault();
            const positionOverGround: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const token: FlyingToken = {...props.colorCombo,
                token_type: props.tokenType.token_type,
                mark: NEW_TOKEN_MARK,
                position: {x: 0, y: 0},
                rotation: 0.0,
                positionOverGround,
            };
            dispatch(actions.tokens.pickupFromBox(token));
        }
    }

    const tokenId: TokenId = {...props.colorCombo,
        token_type: props.tokenType.token_type,
        mark: '0',
    };

    const tokenType = getTokenType(defaultTokenSet, tokenId);

    const boxTokenOuterFrameStyle: CSS.Properties = {
        position: 'relative',
        width: BOX_TOKEN_WIDTH + 'px',
        height: (tokenType.height * BOX_TOKEN_WIDTH / tokenType.width) + 'px',
        pointerEvents: 'none',
    }

    return <div className="token-in-box">
            <div style={boxTokenOuterFrameStyle}>
                <div className="box-token-inner-frame">
                    <Token tokenId={tokenId} width={45} rotation={0.0} onClick={pickupToken} onWheel={() => { return; }} />
                </div>
            </div>
        </div>

}

export default BoxToken;