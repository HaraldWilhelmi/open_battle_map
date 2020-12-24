import {MouseEvent} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {Coordinate, TokenState} from '../api/Types';
import {RootState, MouseState, MouseMode, GenericDispatch, MapProperties} from '../redux/Types';
import {actions} from '../redux/Store';
import {PlacedToken} from './components/PlacedToken';
import {getMapPositionFromScaledPosition, getRotationFromTarget} from './tools/Map';
import {getTokenIdAsString} from './tools/Token';


interface Props {
  children: JSX.Element[] | JSX.Element
}


export function PlacedTokensLayer(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const mouse: MouseState = useSelector(
        (state: RootState) => state.mouse
    );

    const placedTokens = useSelector(
        (state: RootState) => state.placedTokens
    )

    const mapProperties: MapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const placeToken = (event: MouseEvent) => {
        switch ( mouse.mode ) {
            case MouseMode.MoveToken: {
                event.stopPropagation();
                const physicalPosition: Coordinate = {
                    x: event.nativeEvent.offsetX,
                    y: event.nativeEvent.offsetY,
                };
                const position = getMapPositionFromScaledPosition(mapProperties, physicalPosition);
                dispatch(actions.mouse.placeToken(position));
                break;
            }
            case MouseMode.TurnToken: {
                event.stopPropagation();
                let token = mouse.flyingToken;
                if ( token !== null ) {  // Always true
                    const target: Coordinate = getMapPositionFromScaledPosition(mapProperties, {
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                    });
                    const rotation = getRotationFromTarget(token.position, target);
                    token = {...token, rotation};
                    dispatch(actions.placedTokens.place(token));
                }
                dispatch(actions.mouse.releaseToken());
                break;
            }
            default: {break}
        }
    }

    const tokens = placedTokens.map(
        (token: TokenState) => <PlacedToken token={token} key={getTokenIdAsString(token)}/>
    )

    return <div className="placed-tokens-layer"
        onClick={placeToken}
    >
        <div className="placed-token-container">
            {tokens}
        </div>
        {props.children}
    </div>;
}

export default PlacedTokensLayer;
