from uuid import UUID
from fastapi import Depends, APIRouter, Response, status, Form, File, UploadFile

from obm.common.validators import image_media_type_validator
from obm.fileio.static_data import get_default_map
from obm.common.api_tools import RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,\
    RESPONSE_CANT_MAP_NAME_TO_MEDIA_TYPE, get_map_set, get_battle_map
from obm.dependencies import get_map_set_manager
from obm.model.map_set_manager import MapSetManager

router = APIRouter()


@router.get('/{map_set_uuid}/{uuid}',
            description='Get the battle map background image. If none is set a placeholder image is returned.',
            responses={
                status.HTTP_200_OK: {
                    'content': {'image/svg+xml': {}}
                },
                **RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND
            },
            )
def get_image_data(
        map_set_uuid: UUID, uuid: UUID,
        response: Response,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> Response:
    response.headers['Cache-Control'] = 'no-cache'
    battle_map = get_battle_map(manager, map_set_uuid, uuid)
    image_data = battle_map.get_background_image()
    if image_data is None:
        content = get_default_map()
        media_type = 'image/svg+xml'
    else:
        content = image_data
        media_type = battle_map.background_media_type
    return Response(content=content, media_type=media_type)


@router.post('/',
             description='Upload the background image (the actual map) for the battle map. '
                         + 'The file_path must end in something, which gives us a hint on the format. '
                         + 'Supported formats are SVG (best), PNG, GIF and JPEG.',
             responses={
                 **RESPONSE_CANT_MAP_NAME_TO_MEDIA_TYPE,
                 **RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND
             }
             )
async def upload_image_data(
        image_data: UploadFile = File(...),
        uuid: UUID = Form(...),
        map_set_uuid: UUID = Form(...),
        manager: MapSetManager = Depends(get_map_set_manager),
):
    image_media_type_validator(image_data.content_type)
    map_set = get_map_set(manager, map_set_uuid)
    battle_map = get_battle_map(manager, map_set_uuid, uuid)
    data = await image_data.read()
    battle_map.set_background_image(data, image_data.content_type)
    manager.save_background(battle_map)
    manager.sanitize_token_positions(battle_map)
    battle_map.signal_update()
    manager.save(map_set)
