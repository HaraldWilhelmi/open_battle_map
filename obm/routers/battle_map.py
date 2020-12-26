from uuid import UUID
from fastapi import Depends, APIRouter, status
from pydantic import BaseModel, validator

from obm.common.validators import name_validator
from obm.common.api_tools import RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND, RESPONSE_MAP_SET_NOT_FOUND, \
    get_map_set, get_battle_map
from obm.dependencies import get_map_set_manager
from obm.data.battle_map import BattleMap
from obm.model.map_set_manager import MapSetManager

router = APIRouter()


class BattleMapCreateRequest(BaseModel):
    name: str
    map_set_uuid: UUID
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.get('/{map_set_uuid}/{uuid}',
            description='Get a Battle Background.',
            responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
            response_model=BattleMap,
            response_model_include={
                'name', 'uuid', 'map_set_uuid', 'background_revision'
            }
            )
def battle_map_info(
        map_set_uuid: UUID, uuid: UUID,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> BattleMap:
    return get_battle_map(manager, map_set_uuid, uuid)


@router.put('/',
            status_code=status.HTTP_201_CREATED,
            description='Creates a new Battle Background.',
            responses=RESPONSE_MAP_SET_NOT_FOUND,
            response_model=BattleMap,
            response_model_include={'name', 'uuid', 'map_set_uuid'}
            )
async def create_battle_map(
        data: BattleMapCreateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> BattleMap:
    map_set = get_map_set(manager, data.map_set_uuid)
    battle_map = manager.add_new_battle_map(map_set, name=data.name)
    manager.save(map_set)
    return battle_map


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
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update Battle Background.',
             responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND
             )
async def update_battle_map(
        data: BattleMapUpdateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = get_map_set(manager, data.map_set_uuid)
    battle_map = get_battle_map(manager, data.map_set_uuid, data.uuid)
    battle_map.name = data.name
    manager.save(map_set)
