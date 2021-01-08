import {v4 as uuidV4} from "uuid";
import {internalError} from "../../common/Tools";
import {TokenAction, TokenActionType, TokenId, TokenSet, TokenState, TokenType} from '../../api/Types';
import {ActingFlyingToken, ActingTokenState, FlyingToken, Tokens} from "../../redux/Types";


export function isSameToken(a: TokenId, b: TokenId): boolean {
    return a.token_type === b.token_type && a.color === b.color && a.mark === b.mark && a.mark_color === b.mark_color;
}


export function pickupTokenFromMap(state: Tokens, tokenState: FlyingToken): Tokens {
    const index = getTokenIndex(state.placedTokens, tokenState);
    if ( index < 0 ) {
        tokenError(tokenState,'Trying to move non-existing token!');
    }
    const flyingToken: ActingFlyingToken = {...tokenState,
        action_type: TokenActionType.moved,
        uuid: uuidV4(),
        fromPosition: tokenState.position,
        fromRotation: tokenState.rotation,
    };
    const placedTokens = getTokensWithoutIndex(state.placedTokens, index);
    return {...state, placedTokens, flyingToken};
}

export function pickupTokenFromBox(state: Tokens, tokenState: FlyingToken): Tokens {
    const flyingToken: ActingFlyingToken = {...tokenState,
        action_type: TokenActionType.added,
        uuid: uuidV4(),
        fromPosition: null,
        fromRotation: null,
    };
    return {...state, flyingToken};
}

function tokenError(token: TokenId, message: string): never {
    const key = getTokenIdAsString(token);
    internalError('Token ' + key + ': ' + message);
}

export function getTokenIndex<T0 extends TokenId, T1 extends TokenId>(arr: T0[], token: T1): number {
    return arr.findIndex(
        (it) => isSameToken(it, token)
    );
}

export function getTokensWithoutIndex<T extends TokenId>(tokens: T[], index: number): T[] {
    return [
        ...tokens.slice(0, index),
        ...tokens.slice(index + 1, tokens.length),
    ];
}

export function getTokenIdAsString(tokenId: TokenId): string {
    return tokenId.token_type + '/' + tokenId.color + '/' + tokenId.mark + '/' + tokenId.mark_color;
}

export function getTokenIdAsKeyframesName(tokenId: TokenId): string {
    let raw: string = getTokenIdAsString(tokenId);
    return raw.replace(/[^a-zA-Z0-9-]/g, '-');
}


export function getTokenType(tokenSet: TokenSet, tokenId: TokenId): TokenType {
    for ( let candidate of tokenSet ) {
        if ( candidate.token_type === tokenId.token_type ) {
            return candidate;
        }
    }
    tokenError(tokenId, 'Unknown token_type!');
}

export function getFreeMarkForToken(state: TokenState[], token: TokenState): string {
    let candidate = 1;
    for ( let placedToken of state ) {
        if (
            placedToken.token_type === token.token_type
            && placedToken.color === token.color
            && placedToken.mark_color === token.mark_color
        ) {
            const foundMarkAsInt = ~~placedToken.mark;
            if ( foundMarkAsInt >= candidate ) {
                candidate = foundMarkAsInt + 1;
            }
        }
    }
    return '' + candidate;
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


export function startTokenAction(state: Tokens, action: TokenAction): Tokens {
    switch ( action.action_type ) {
        case TokenActionType.added: { return startAddedAction(state, action); }
        case TokenActionType.moved: { return startMovedAction(state, action); }
        case TokenActionType.removed: { return startRemovedAction(state, action); }
    }
}

function startAddedAction(state: Tokens, action: TokenAction): Tokens {
    const indexPlacedTokens = getTokenIndex(state.placedTokens, action);
    const indexActingTokens = getTokenIndex(state.actingTokens, action);
    if ( indexPlacedTokens >= 0 || indexActingTokens >= 0 ) {
        tokenError(action, 'Can not add existing token!');
    }
    const movingToken: ActingTokenState = {...action,
        fromPosition: {x: -1, y: -1},
        fromRotation: 0,
    };
    return {...state,
        actingTokens: [...state.actingTokens, movingToken],
    };
}


function startMovedAction(state: Tokens, action: TokenAction): Tokens {
    const indexPlacedTokens = getTokenIndex(state.placedTokens, action);
    if ( indexPlacedTokens >= 0 ) {
        return startIsolatedAction(state, action, indexPlacedTokens);
    }
    
    const indexActingTokens = getTokenIndex(state.actingTokens, action);
    if ( indexActingTokens >= 0 ) {
        return mergedMovedAction(state, action, indexActingTokens);
    }

    tokenError(action, 'Tried to move non-existing token!');
}

function startIsolatedAction(state: Tokens, action: TokenAction, indexPlacedTokens: number) {
    const oldToken = state.placedTokens[indexPlacedTokens];
    const actingToken: ActingTokenState = {
        ...action,
        fromPosition: oldToken.position,
        fromRotation: oldToken.rotation,
    };
    return {
        ...state,
        placedTokens: getTokensWithoutIndex(state.placedTokens, indexPlacedTokens),
        actingTokens: [...state.actingTokens, actingToken],
    };
}

function mergedMovedAction(state: Tokens, action: TokenAction, indexActingTokens: number) {
    let actingTokens = [...state.actingTokens];
    const oldMovingToken = actingTokens[indexActingTokens];
    if (oldMovingToken.action_type === TokenActionType.removed) {
        tokenError(action,'Do not know how to merge a Move on top of a Remove!');
    }
    actingTokens[indexActingTokens] = {
        ...oldMovingToken,
        position: action.position
    }
    return {...state, actingTokens};
}


function startRemovedAction(state: Tokens, action: TokenAction): Tokens {
    const indexPlacedTokens = getTokenIndex(state.placedTokens, action);
    if ( indexPlacedTokens >= 0 ) {
        const oldToken = state.placedTokens[indexPlacedTokens];
        const patchedAction: TokenAction = {...action, position: oldToken.position};
        return startIsolatedAction(state, patchedAction, indexPlacedTokens);
    }
    
    const indexActingTokens = getTokenIndex(state.actingTokens, action);
    if ( indexActingTokens >= 0 ) {
        return mergedRemovedAction(state, action, indexActingTokens);
    }

    tokenError(action, 'Tried to remove non-existing token!');
}

function mergedRemovedAction(state: Tokens, action: TokenAction, indexActingTokens: number) {
    let actingTokens = [...state.actingTokens];
    const oldMovingToken = actingTokens[indexActingTokens];
    if ( oldMovingToken.action_type === TokenActionType.removed ) {
        tokenError(action, 'Do not know how to merge a Remove on top of a Remove!');
    }
    if ( oldMovingToken.action_type === TokenActionType.added ) {
        return {...state, actingTokens: getTokensWithoutIndex(state.actingTokens, indexActingTokens)}
    }
    actingTokens[indexActingTokens] = {
        ...oldMovingToken,
        action_type: TokenActionType.removed,
    }
    return {...state, actingTokens};
}


export function endTokenAction(state: Tokens, token: ActingTokenState): Tokens {
    const index = getTokenIndex(state.actingTokens, token);
    if ( index < 0 ) {
        tokenError(token, 'Moving token lost!');
    }
    const actingTokens = getTokensWithoutIndex(state.actingTokens, index);
    if ( token.action_type === TokenActionType.removed ) {
        return {...state, actingTokens: actingTokens};
    } else {
        const placedToken: TokenState = {...token};
        const placedTokens = [...state.placedTokens, placedToken];
        return {...state, actingTokens: actingTokens, placedTokens};
    }
}
