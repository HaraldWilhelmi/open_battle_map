import {Tokens} from '../../redux/Types';
import {TokenAction, TokenActionType, TokenId, TokenState} from "../../api/Types";
import {endTokenAction, startTokenAction} from "./Token";


const NO_TOKENS: Tokens = {
    placedTokens: [],
    actingTokens: [],
    flyingToken: null,
    flyingTokenIsNew: false,
};

const SAMPLE_ACTION: TokenAction = {
    action_type: TokenActionType.added,
    color: 'Black',
    mark: '1',
    mark_color: 'White',
    position:  {x: 75, y: 30},
    rotation: 0.347,
    token_type: 0,
    uuid: 'cc24fb89-318d-4912-884d-6a7213a562a2'
}


function sample<T extends TokenId>(data?: any[string]): TokenAction {
    return {...SAMPLE_ACTION, ...data};
}


test ('start/endTokenAction - add', () => {
    const result1 = startTokenAction(NO_TOKENS, sample<TokenAction>());
    expect(result1.actingTokens.length).toEqual(1);
    const result2 = endTokenAction(result1, result1.actingTokens[0]);

    expect(result2.placedTokens.length).toEqual(1);
    expect(result2.actingTokens.length).toEqual(0);
    expect(result2.placedTokens[0].position.x).toEqual(75);
});

test ('start/endTokenAction - remove', () => {
    const state: Tokens = {...NO_TOKENS, placedTokens: [sample<TokenState>()]};

    const result1 = startTokenAction(state, sample<TokenAction>({action_type: TokenActionType.removed}));
    expect(result1.actingTokens.length).toEqual(1);
    const result2 = endTokenAction(result1, result1.actingTokens[0]);

    expect(result2.placedTokens.length).toEqual(0);
    expect(result2.actingTokens.length).toEqual(0);
});

test ('start/endTokenAction - move', () => {
    const state: Tokens = {...NO_TOKENS, placedTokens: [sample<TokenState>()]};

    const action = sample<TokenAction>({
        action_type: TokenActionType.moved,
        position: {x: 17, y: 32},
        rotation: 0.12,
    });
    const result1 = startTokenAction(state, action);
    expect(result1.actingTokens.length).toEqual(1);
    expect(result1.actingTokens[0].fromPosition).toStrictEqual(SAMPLE_ACTION.position);
    expect(result1.actingTokens[0].fromRotation).toStrictEqual(SAMPLE_ACTION.rotation);
    const result2 = endTokenAction(result1, result1.actingTokens[0]);

    expect(result2.placedTokens.length).toEqual(1);
    expect(result2.actingTokens.length).toEqual(0);
    expect(result2.placedTokens[0].position).toStrictEqual(action.position);
    expect(result2.placedTokens[0].rotation).toStrictEqual(action.rotation);

});

test ('start/endTokenAction - noop merge', () => {
    const action1 = sample<TokenAction>();
    const result1 = startTokenAction(NO_TOKENS, action1);

    const action2 = sample<TokenAction>({
        action_type: TokenActionType.moved,
        position: {x: 17, y: 32},
    });
    const result2 = startTokenAction(result1, action2);

    const action3 = sample<TokenAction>({action_type: TokenActionType.removed});
    const result3 = startTokenAction(result2, action3);
    expect(result3.actingTokens.length).toEqual(0);
});

test ('start/endTokenAction - merged move', () => {
    const state: Tokens = {...NO_TOKENS, placedTokens: [sample<TokenState>()]};
    const action1 = sample<TokenAction>({
        action_type: TokenActionType.moved,
        position: {x: 17, y: 32},
    });
    const action2 = sample<TokenAction>({
        action_type: TokenActionType.moved,
        position: {x: 180, y: 37},
    });

    const result1 = startTokenAction(state, action1);
    const result2 = startTokenAction(result1, action2);
    expect(result2.actingTokens.length).toEqual(1);
    expect(result2.actingTokens[0].fromPosition).toStrictEqual(SAMPLE_ACTION.position);
    expect(result2.actingTokens[0].position).toStrictEqual(action2.position);

    const result3 = endTokenAction(result2, result2.actingTokens[0]);
    expect(result3.placedTokens.length).toEqual(1);
    expect(result3.actingTokens.length).toEqual(0);
    expect(result3.placedTokens[0].position).toStrictEqual(action2.position);
});
