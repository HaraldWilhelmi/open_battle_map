import re
from io import BytesIO
from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, Response, Cookie, HTTPException, status, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from obm.data.config import Config
from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND, get_map_set
from obm.dependencies import get_map_set_manager, get_map_set_directory, get_config, get_backup_io
from obm.fileio.backup_io import BackupIo, ImportValidationError
from obm.model.map_set_manager import MapSetManager
from obm.model.map_set_directory import MapSetDirectory


RESPONSE_IMPORT_VALIDATION_ERROR = {
    status.HTTP_400_BAD_REQUEST: {
        'description': 'The import failed because the validation of the map set failed. '
                       + 'This is a *good* thing because validation errors will prevent '
                       + 'the deletion of existing data on the server. Automatic cleanup was '
                       + 'successful. Otherwise you would have gotten HTTP status 500.'
    }
}


router = APIRouter()


class BattleMapItem(BaseModel):
    uuid: UUID
    name: str


class MapSetInfoResponse(BaseModel):
    name: str
    uuid: UUID
    battle_maps: List[BattleMapItem]


@router.get('/download/{uuid}',
            description='Download a complete Map Set, e.g. as backup or to migrate it to a different server instance.',
            responses=RESPONSE_MAP_SET_NOT_FOUND,
            )
def download_map_set(
        uuid: UUID,
        manager: MapSetManager = Depends(get_map_set_manager),
        backup_io: BackupIo = Depends(get_backup_io),
) -> Response:
    map_set = get_map_set(manager, uuid)
    filename = _get_safe_file_name(map_set.name)
    buffer = BytesIO()
    backup_io.export_map_set_tar_gz(uuid, buffer)
    buffer.seek(0)
    response = StreamingResponse(buffer, media_type="application/open-battle-map")
    response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


_UNSAFE_CHARACTERS = r'[^a-zA-Z0-9_-]'


def _get_safe_file_name(raw_name: str) -> str:
    name_without_spaces = raw_name.replace(' ', '_')
    safe_name = re.sub(_UNSAFE_CHARACTERS, 'X', name_without_spaces)
    return f"{safe_name}.obm"


@router.post('/upload',
             description='Upload a complete Map Set, e.g. to restore an backup or to migrate to a different server.',
             responses={
                 **RESPONSE_MAP_SET_NOT_FOUND,
                 **RESPONSE_IMPORT_VALIDATION_ERROR,
             }
             )
async def upload_map_set(
        data: UploadFile = File(...),
        uuid: UUID = Form(...),
        manager: MapSetManager = Depends(get_map_set_manager),
        backup_io: BackupIo = Depends(get_backup_io),
):
    old_map_set = manager.get_by_uuid(uuid)
    buffer = BytesIO()
    buffer.write(await data.read())
    buffer.seek(0)
    try:
        backup_io.import_map_set_tar_gz(uuid, buffer)
        manager.reload_map_set_from_disk(old_map_set)
    except ImportValidationError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(e))


@router.get('/{uuid}',
            description='Get information about a map set. The battle map items are sorted by name.',
            response_model=MapSetInfoResponse,
            responses=RESPONSE_MAP_SET_NOT_FOUND,
            )
async def map_set_info(
        uuid: UUID,
        response: Response,
        obm_known_map_sets: str = Cookie(''),
        manager: MapSetManager = Depends(get_map_set_manager),
        directory: MapSetDirectory = Depends(get_map_set_directory),
        config: Config = Depends(get_config)
) -> MapSetInfoResponse:
    map_set = get_map_set(manager, uuid)
    _update_known_map_sets_cookie(
        map_set_uuid=uuid,
        old_cookie=obm_known_map_sets,
        response=response,
        config=config,
        directory=directory
    )
    return MapSetInfoResponse(
        name=map_set.name,
        uuid=map_set.uuid,
        battle_maps=_get_battle_maps(map_set)
    )


def _get_battle_maps(map_set):
    battle_maps = [
        BattleMapItem(uuid=uuid, name=battle_map.name)
        for uuid, battle_map in map_set.battle_maps_by_uuid.items()
    ]
    battle_maps.sort(key=lambda x: x.name)
    return battle_maps


def _update_known_map_sets_cookie(
        map_set_uuid: UUID,
        old_cookie: str,
        response: Response,
        config: Config,
        directory: MapSetDirectory
):
    existing_map_sets = set(directory.get_uuid_to_name_mapping().keys())
    old_known_map_sets = set(old_cookie.split(','))
    known_map_sets = (old_known_map_sets & existing_map_sets) | {map_set_uuid}
    new_cookie = ','.join([str(x) for x in known_map_sets])

    response.set_cookie(
        'obm_known_map_sets',
        new_cookie,
        max_age=int(config.known_map_sets_cookie_max_age.total_seconds()),
        samesite='Strict'
    )
