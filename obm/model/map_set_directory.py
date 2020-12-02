from typing import Optional, Dict
from uuid import UUID

from fastapi import Depends

from obm.common.error import check_dependency
from obm.fileio.map_set_io import MapSetIO, get_map_set_io
from obm.data.map_set import MapSet


class MapSetDirectory:
    def __init__(self, map_set_io: MapSetIO = Depends(get_map_set_io)):
        self._cache: Optional[Dict[UUID, str]] = None
        self._map_set_io = map_set_io

    def get_uuid_to_name_mapping(self) -> Dict[UUID, str]:
        if self._cache is None:
            self._cache = self._map_set_io.get_map_set_uuid_to_name_mapping()
            self.sort_cache()
        return self._cache

    def sort_cache(self):
        as_list = [(k, v) for k, v in self._cache.items()]
        as_sorted_list = sorted(as_list, key=lambda x: x[1])
        self._cache = {k: v for k, v in as_sorted_list}

    def add(self, map_set: MapSet):
        if self._cache is None:
            self._cache = self._map_set_io.get_map_set_uuid_to_name_mapping()
        self._cache[map_set.uuid] = map_set.name
        self.sort_cache()

    def remove(self, map_set: MapSet):
        if self._cache is None:
            self._cache = self._map_set_io.get_map_set_uuid_to_name_mapping()
        del self._cache[map_set.uuid]


map_set_directory: Optional[MapSetDirectory] = None


def get_map_set_directory() -> MapSetDirectory:
    check_dependency(map_set_directory, 'map_set_directory')
    return map_set_directory


def setup_map_set_directory_for_production():
    global map_set_directory
    map_set_directory = MapSetDirectory()
