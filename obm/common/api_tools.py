from uuid import UUID
from fastapi import HTTPException, status

from obm.data.map_set import MapSet
from obm.data.battle_map import BattleMap
from obm.fileio.map_set_io import NoSuchMapSet
from obm.model.map_set_manager import MapSetManager

RESPONSE_MAP_SET_NOT_FOUND = {
    status.HTTP_404_NOT_FOUND: {
        'description': 'Map Set not found.'
    }
}

RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND = {
    status.HTTP_404_NOT_FOUND: {
        'description': 'The map set does not exist or does not contain the requested battle map (check details!).'
    }
}

RESPONSE_CANT_MAP_NAME_TO_MEDIA_TYPE = {
    status.HTTP_415_UNSUPPORTED_MEDIA_TYPE: {
        'description': 'The file_path ended in a extension of an unsupported/unknown image format.'
    }
}


def get_map_set(manager: MapSetManager, uuid: UUID) -> MapSet:
    try:
        return manager.get_by_uuid(uuid)
    except NoSuchMapSet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'No such map set found.')


def get_battle_map(manager: MapSetManager, map_set_uuid: UUID, battle_map_uuid: UUID) -> BattleMap:
    map_set = get_map_set(manager, map_set_uuid)
    if battle_map_uuid in map_set.battle_maps_by_uuid:
        return map_set.battle_maps_by_uuid[battle_map_uuid]
    else:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Battle map not found.')
