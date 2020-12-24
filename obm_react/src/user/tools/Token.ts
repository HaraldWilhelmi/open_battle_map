import {MapSetId, TokenId} from '../../api/Types';


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
