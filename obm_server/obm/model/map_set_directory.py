from typing import Optional, Dict
from uuid import UUID

from obm.common.dep_context import DepContext, get_context
from obm.fileio.map_set_io import MapSetIO
from obm.data.map_set import MapSet


class MapSetDirectory:
    def __init__(self, ctx: DepContext = get_context()):
        self._cache: Optional[Dict[UUID, str]] = None
        self._map_set_io: MapSetIO = ctx.get(MapSetIO)

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

    def delete(self, map_set: MapSet):
        if self._cache is None:
            self._cache = self._map_set_io.get_map_set_uuid_to_name_mapping()
        del self._cache[map_set.uuid]
