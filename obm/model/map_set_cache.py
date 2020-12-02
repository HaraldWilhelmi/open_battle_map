from typing import Optional, Dict, ValuesView
from uuid import UUID

from obm.common.error import check_dependency
from obm.data.map_set import MapSet


class MapSetCache:
    def __init__(self):
        self._data: Dict[UUID, MapSet] = {}

    def __getitem__(self, uuid: UUID):
        return self._data[uuid]

    def __setitem__(self, key: UUID, value: MapSet):
        assert key == value.uuid
        self._data[key] = value

    def __delitem__(self, key: UUID):
        del self._data[key]

    def __contains__(self, key: UUID) -> bool:
        return key in self._data

    def values(self) -> ValuesView[MapSet]:
        return self._data.values()


map_set_cache: Optional[MapSetCache] = None


def get_map_set_cache() -> MapSetCache:
    check_dependency(map_set_cache, 'map_set_cache')
    return map_set_cache


def setup_map_set_cache_for_production():
    global map_set_cache
    map_set_cache = MapSetCache()
