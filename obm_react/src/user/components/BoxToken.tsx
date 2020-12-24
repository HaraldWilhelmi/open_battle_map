import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {TokenId, TokenState, Coordinate, MapSet} from '../../api/Types';
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
            const position: Coordinate = {
                x: event.nativeEvent.clientX,
                y: event.nativeEvent.clientY,
            };
            const token: TokenState = {...props.tokenId,
                mark: '',
                position,
                rotation: 0.0,
            };
            dispatch(actions.mouse.grabToken(token));
            event.stopPropagation();
        }
    }

    const url = getTokenImageUrl(mapSet, props.tokenId);
    return <img
        className="token-in-box"
        src={url}
        alt={props.tokenId.color + " token"}
        onClick={pickupToken}
    />
}

export default BoxToken;