from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, Response, Cookie
from pydantic import BaseModel

from obm.data.config import Config
from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND, get_map_set
from obm.dependencies import get_map_set_manager, get_map_set_directory, get_config
from obm.model.map_set_manager import MapSetManager
from obm.model.map_set_directory import MapSetDirectory

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
        max_age=config.known_map_sets_cookie_max_age.total_seconds(),
        samesite='Strict'
    )
