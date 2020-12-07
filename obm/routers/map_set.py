from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter
from pydantic import BaseModel

from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND, get_map_set
from obm.dependencies import get_map_set_manager
from obm.model.map_set_manager import MapSetManager

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
async def create_map_set(
        uuid: UUID,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> MapSetInfoResponse:
    map_set = get_map_set(manager, uuid)
    battle_maps = [
        BattleMapItem(uuid=uuid, name=battle_map.name)
        for uuid, battle_map in map_set.battle_maps_by_uuid.items()
    ]
    battle_maps.sort(key=lambda x: x.name)
    return MapSetInfoResponse(
        name=map_set.name,
        uuid=map_set.uuid,
        battle_maps=battle_maps
    )
