import {internalError} from "../../common/Tools";
import {
    TokenId,
    TokenSet,
    TokenState,
    TokenType
} from '../../api/Types';
import {MovingTokenState, Tokens} from "../../redux/Types";

export function getFreeMarkForToken(state: TokenState[], token: TokenState): string {
    let candidate = 1;
    for ( let placedToken of state ) {
        if ( isSameToken(placedToken, token) ) {
            const foundMarkAsInt = ~~placedToken.mark;
            if ( foundMarkAsInt >= candidate ) {
                candidate = foundMarkAsInt + 1;
            }
        }
    }
    return '' + candidate;
}

export function isSameToken(a: TokenId, b: TokenId): boolean {
    return a.token_type === b.token_type && a.color === b.color && a.mark === b.mark && a.mark_color === b.mark_color;
}

export function pickupToken(state: TokenState[], tokenId: TokenId): TokenState[] {
    let newState = [...state];
    for ( let i = 0; i < newState.length; i++ ) {
        if ( isSameToken(tokenId, newState[i]) ) {
            newState.splice(i, 1);
            return newState;
        }
    }
    return newState;
}

export function getTokensWithout(tokens: TokenState[], tokenId: TokenId): TokenState[] {
    for ( let i = 0; i < tokens.length; i++ ) {
        if ( isSameToken(tokenId, tokens[i]) ) {
            return [
                ...tokens.slice(0, i),
                ...tokens.slice(i+1, tokens.length)
            ];
        }
    }
    internalError('Token not found in list - that should never happen!');
}

export function getTokenIdAsString(tokenId: TokenId): string {
    return tokenId.token_type + '/' + tokenId.color + '/' + tokenId.mark + '/' + tokenId.mark_color;
}

export function getTokenType(tokenSet: TokenSet, tokenId: TokenId): TokenType {
    for ( let candidate of tokenSet ) {
        if ( candidate.token_type === tokenId.token_type ) {
            return candidate;
        }
    }
    internalError('No such token_type in this Token Set.')
}

export function startMove(state: Tokens, token: TokenState): Tokens {
    const placedTokens = state.placedTokens;
    for ( let i = 0; i < placedTokens.length; i++ ) {
        if ( isSameToken(token, placedTokens[i]) ) {
            const movingToken: MovingTokenState = {...state.placedTokens[i],
                toPosition: token.position,
                toRotation: token.rotation,
            };
            return {...state,
                placedTokens: [
                    ...placedTokens.slice(0, i),
                    ...placedTokens.slice(i + 1, placedTokens.length)
                ],
                movingTokens: [...state.movingTokens, movingToken],
            };
        }
    }
    internalError('Token not found in list - that should never happen!');
}

export function endMove(state: Tokens, token: MovingTokenState): Tokens {
    const movingTokens = state.movingTokens;
    for ( let i = 0; i < movingTokens.length; i++ ) {
        if ( isSameToken(token, movingTokens[i]) ) {
            const movedToken: TokenState = {...token,
                position: token.toPosition,
                rotation: token.toRotation,
            };
            return {...state,
                movingTokens: [
                    ...movingTokens.slice(0, i),
                    ...movingTokens.slice(i + 1, movingTokens.length)
                ],
                placedTokens: [...state.placedTokens, movedToken],
            };
        }
    }
    internalError('Token not found in list - that should never happen!');
}
