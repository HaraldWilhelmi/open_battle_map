from fastapi import Depends, APIRouter, Response, status, HTTPException
from pydantic.color import Color

from obm.common.api_tools import RESPONSE_BAD_TOKEN_TYPE
from obm.model.magic_color_svg import MagicColorSvg, NoSuchIMage
from obm.dependencies import get_magic_color_svg


router = APIRouter()


@router.get('/default/{token_type}/{color}',
            description='Get the image (SVG) for a default token. The token_type must be < 1000. Higher values '
                        + 'are reserved for the custom tokens of the Map Set.',
            responses={
                status.HTTP_200_OK: {
                    'content': {'image/svg+xml': {}}
                },
                **RESPONSE_BAD_TOKEN_TYPE
            },
            )
def get_default_token_image(
        token_type: int,
        color: Color,
        magic_color_svg: MagicColorSvg = Depends(get_magic_color_svg)
) -> Response:
    if token_type < 0 or token_type >= 1000:
        raise HTTPException(400, 'The token_type must be between 0 and 999 for default tokens.')
    try:
        key = f"default/token_{token_type}"
        content = magic_color_svg.get_colored_svg(key, color)
    except NoSuchIMage:
        raise HTTPException(404, 'No such token_type.')
    media_type = 'image/svg+xml'
    response = Response(content=content, media_type=media_type)
    response.headers['Cache-Control'] = 'private,max-age=57600'
    return response
