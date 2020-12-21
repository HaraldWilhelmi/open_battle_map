from uuid import UUID
from fastapi import Depends, APIRouter, Response, status
from pydantic.color import Color

from obm.model.magic_color_svg import MagicColorSvg
from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND
from obm.dependencies import get_magic_color_svg

router = APIRouter()


@router.get('/{_map_set_uuid}/{token_type}/{color}/{mark}',
            description='Get a token image by Type. Token Type 0 is reserved for the default token. '
                        + 'That is the only one implemented yet.',
            responses={
                status.HTTP_200_OK: {
                    'content': {'image/svg+xml': {}}
                },
                **RESPONSE_MAP_SET_NOT_FOUND
            },
            )
def get_token_image(
        _map_set_uuid: UUID,
        token_type: int,
        color: Color,
        mark: str = '',
        magic_color_svg: MagicColorSvg = Depends(get_magic_color_svg)
) -> Response:
    if token_type != 0:
        raise NotImplemented()
    if mark == '_':
        mark = ''
    content = magic_color_svg.get_colored_svg('global/default_token', color, mark)
    media_type = 'image/svg+xml'
    response = Response(content=content, media_type=media_type)
    response.headers['Cache-Control'] = 'private,max-age=57600'
    return response
