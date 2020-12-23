import {TokenId} from '../../api/Types';


export function getTokenImageUrl(tokenId: TokenId): string {
    const mark = tokenId.mark === ' ' || tokenId.mark === '' ? '_' : tokenId.mark;
    return "/api/token_image/"
        + tokenId.map_set_uuid + "/"
        + tokenId.token_type + "/"
        + tokenId.color + "/"
        + mark;
}