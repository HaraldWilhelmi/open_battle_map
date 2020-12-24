import {MapSetId, TokenId, TokenState, NEW_TOKEN_MARK} from '../../api/Types';


export const standardTokens: TokenId[] =
    ['Red', 'Blue', 'Lime', 'Gold', 'Silver', 'Sienna'].map(
        (color: string) => {
            return {
                token_type: 0,
                color,
                mark: '',
            };
        }
    );


export function getTokenImageUrl(mapSetId: MapSetId, tokenId: TokenId): string {
    const tokenSet = tokenId.token_type < 1000 ? 'standard' : mapSetId;
    return "/api/token_image/"
        + tokenSet + "/"
        + tokenId.token_type + "/"
        + tokenId.color;
}

export function placeToken(state: TokenState[], token: TokenState): TokenState[] {
    let newState = [...state];

    if (token.mark === NEW_TOKEN_MARK) {
        const mark = getFreeMarkForToken(state, token);
        token.mark =mark;
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
    return a.token_type === b.token_type && a.color === b.color && a.mark === b.mark;
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
    return tokenId.token_type + '/' + tokenId.color + '/' + tokenId.mark;
}
