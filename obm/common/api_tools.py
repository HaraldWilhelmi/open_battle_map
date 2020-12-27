from uuid import UUID
from fastapi import HTTPException, status

from obm.fileio.map_set_io import NoSuchMapSet
from obm.model.map_set_manager import MapSetManager
from obm.model.managed_map_set import ManagedMapSet
from obm.model.managed_battle_map import ManagedBattleMap

RESPONSE_MAP_SET_NOT_FOUND = {
    status.HTTP_404_NOT_FOUND: {
        'description': 'Background Set not found.'
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

RESPONSE_BAD_TOKEN_TYPE = {
    status.HTTP_404_NOT_FOUND: {
        'description': 'Token with given token_id does not exist.'
    },
    status.HTTP_400_BAD_REQUEST: {
        'description': 'The given token_type is out of range. Default tokens have types between 0 and 999. '
            + 'Custom tokens have numbers >=1000.'
    }
}


def get_map_set(manager: MapSetManager, uuid: UUID) -> ManagedMapSet:
    try:
        return manager.get_by_uuid(uuid)
    except NoSuchMapSet:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'No such map set found.')


def get_battle_map(manager: MapSetManager, map_set_uuid: UUID, battle_map_uuid: UUID) -> ManagedBattleMap:
    map_set = get_map_set(manager, map_set_uuid)
    try:
        return map_set.get_battle_map(battle_map_uuid)
    except Exception:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'Battle map not found.')
