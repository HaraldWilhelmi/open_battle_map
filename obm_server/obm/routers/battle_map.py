from typing import Optional
from uuid import UUID
from fastapi import Depends, APIRouter, status, Response
from pydantic import BaseModel, validator

from obm.common.validators import name_validator
from obm.common.api_tools import RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND, RESPONSE_MAP_SET_NOT_FOUND, \
    get_map_set, get_battle_map
from obm.dependencies import get_map_set_manager
from obm.model.map_set_manager import MapSetManager

router = APIRouter()


class BattleMapCreateRequest(BaseModel):
    name: str
    map_set_uuid: UUID
    _check_name = validator('name', allow_reuse=True)(name_validator)


class BattleMapInfo(BaseModel):
    uuid: UUID
    map_set_uuid: UUID
    name: str
    revision: int
    token_action_count: int

    background_pixels_per_meter: float
    background_media_type: Optional[str]


@router.get('/{map_set_uuid}/{uuid}',
            description='Get a Battle Background.',
            responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
            response_model=BattleMapInfo,
            )
def battle_map_info(
        map_set_uuid: UUID, uuid: UUID,
        response: Response,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> BattleMapInfo:
    response.headers['Cache-Control'] = 'no-cache'
    battle_map = get_battle_map(manager, map_set_uuid, uuid)
    return BattleMapInfo(map_set_uuid=map_set_uuid, **battle_map.__dict__)


@router.put('/',
            status_code=status.HTTP_201_CREATED,
            description='Creates a new Battle Background.',
            responses=RESPONSE_MAP_SET_NOT_FOUND,
            response_model=BattleMapInfo,
            response_model_include={'name', 'uuid', 'map_set_uuid'}
            )
async def create_battle_map(
        data: BattleMapCreateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> BattleMapInfo:
    map_set = get_map_set(manager, data.map_set_uuid)
    battle_map = map_set.add_new_battle_map(data.name)
    manager.save(map_set)
    return BattleMapInfo(map_set_uuid=map_set.uuid, **battle_map.__dict__)


class BattleMapDeleteRequest(BaseModel):
    uuid: UUID
    map_set_uuid: UUID


@router.delete('/', description='Deletes a Battle Background.',
               responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
               )
async def delete_battle_map(
        data: BattleMapDeleteRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = get_map_set(manager, data.map_set_uuid)
    battle_map = get_battle_map(manager, data.map_set_uuid, data.uuid)
    manager.delete_battle_map(map_set, battle_map)
    manager.save(map_set)


class BattleMapUpdateRequest(BaseModel):
    uuid: UUID
    map_set_uuid: UUID
    name: str
    background_pixels_per_meter: float
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update Battle Background.',
             response_model=BattleMapInfo,
             responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND
             )
async def update_battle_map(
        data: BattleMapUpdateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> BattleMapInfo:
    map_set = get_map_set(manager, data.map_set_uuid)
    battle_map = get_battle_map(manager, data.map_set_uuid, data.uuid)

    battle_map.name = data.name
    battle_map.background_pixels_per_meter = data.background_pixels_per_meter

    battle_map.signal_update()
    manager.save(map_set)
    return BattleMapInfo(map_set_uuid=map_set.uuid, **battle_map.__dict__)
