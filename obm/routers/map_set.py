from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, status, Response, Cookie
from pydantic import BaseModel, validator

from obm.data.config import Config
from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND, get_map_set
from obm.common.validators import name_validator
from obm.dependencies import get_map_set_manager, get_map_set_directory, get_config
from obm.data.map_set import MapSet
from obm.model.admin import check_admin_secret
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_manager import MapSetManager


ADMIN_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {
        'description': 'Wrong admin secret token was sent.'
    },
    status.HTTP_503_SERVICE_UNAVAILABLE: {
        'description': 'No admin secret was found in the configuration - so admin access is disabled.'
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


class MapSetCreateRequest(BaseModel):
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.put('/',
            status_code=status.HTTP_201_CREATED,
            description='Creates a new map set.',
            responses=ADMIN_RESPONSES,
            response_model=MapSet,
            response_model_include={'name', 'uuid'}
            )
async def create_map_set(
        data: MapSetCreateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
        _: None = Depends(check_admin_secret)
) -> MapSet:
    return manager.create(data.name)


class MapSetDeleteRequest(BaseModel):
    uuid: UUID


@router.delete('/', description='Deletes a map set permanently.',
               responses={
                   **RESPONSE_MAP_SET_NOT_FOUND,
                   **ADMIN_RESPONSES,
               })
async def delete_map_set(
        data: MapSetDeleteRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
        _: None = Depends(check_admin_secret)
):
    map_set = get_map_set(manager, data.uuid)
    manager.delete(map_set)


class MapSetUpdateRequest(BaseModel):
    uuid: UUID
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update map set.',
             responses={
                 **RESPONSE_MAP_SET_NOT_FOUND,
                 **ADMIN_RESPONSES,
             })
async def update_map_set(
        data: MapSetUpdateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
        directory: MapSetDirectory = Depends(get_map_set_directory),
        _: None = Depends(check_admin_secret)
):
    map_set = get_map_set(manager, data.uuid)
    map_set.name = data.name
    directory.delete(map_set)
    directory.add(map_set)
    manager.save(map_set)
