import {MapSetId, NEW_TOKEN_MARK, TokenId, TokenSet, TokenState, TokenType} from '../../api/Types';


export function getTokenImageUrl(mapSetId: MapSetId, tokenId: TokenId): string {
    const tokenSet = tokenId.token_type < 1000 ? 'default' : mapSetId;
    return "/api/token_image/"
        + tokenSet + "/"
        + tokenId.token_type + "/"
        + tokenId.color;
}

export function placeToken(state: TokenState[], token: TokenState): TokenState[] {
    let newState = [...state];

    if (token.mark === NEW_TOKEN_MARK) {
        token.mark =getFreeMarkForToken(state, token);
        newState.push(token);
        return newState;
    }

    for ( let i = 0; i < newState.length; i++ ) {
        if ( isSameToken(token, newState[i]) ) {
            newState[i] = token;
            return newState;
        }
    }

    newState.push(token);
    return newState;
}

export function getFreeMarkForToken(state: TokenState[], token: TokenState): string {
    let candidate = 1;
    for ( let placedToken of state ) {
        if ( placedToken.token_type === token.token_type && placedToken.color === token.color ) {
            const foundMarkAsInt = ~~placedToken.mark;
            console.log("Found: " + foundMarkAsInt);
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

export function removeToken(state: TokenState[], tokenId: TokenId): TokenState[] {
    let newState = [...state];
    for ( let i = 0; i < newState.length; i++ ) {
        if ( isSameToken(tokenId, newState[i]) ) {
            newState.splice(i, 1);
            return newState;
        }
    }
    return newState;
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
    throw Error('No such token_type in this Token Set.')
}
