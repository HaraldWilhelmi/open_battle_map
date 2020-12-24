import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {TokenId, TokenState, Coordinate, NEW_TOKEN_MARK, MapSet} from '../../api/Types';
import {RootState, GenericDispatch, MouseMode, MouseState} from '../../redux/Types';
import {actions} from '../../redux/Store';
import {getTokenImageUrl} from '../tools/Token';


interface Props {
    tokenId: TokenId,
}

export function BoxToken(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mapSet: MapSet = useSelector(
        (state: RootState) => state.mapSet
    );

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
            const token: TokenState = {...props.tokenId,
                mark: NEW_TOKEN_MARK,
                position,
                rotation: 0.0,
            };
            dispatch(actions.mouse.grabToken(token));
        }
    }

    const url = getTokenImageUrl(mapSet, props.tokenId);
    return <img
        className="token-in-box"
        src={url}
        alt={props.tokenId.color + " token"}
        onClick={pickupToken}
        onDragStart={pickupToken}
    />
}

export default BoxToken;