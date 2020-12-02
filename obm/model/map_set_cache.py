from typing import Dict, ValuesView
from uuid import UUID

from obm.common.dep_context import get_context, DepContext
from obm.fileio.map_set_io import MapSetIO
from obm.data.map_set import MapSet


class MapSetCache:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_io: MapSetIO = ctx.get(MapSetIO)
        self._data: Dict[UUID, MapSet] = {}

    def get_by_uuid(self, uuid: UUID):
        if uuid not in self._data:
            map_set = self._map_set_io.load_map_set(uuid)
            map_set.touch(changed=False)
            map_set.saved_flag = True
            self._data[uuid] = map_set
        return self._data[uuid]

    def add(self, map_set: MapSet):
        self._data[map_set.uuid] = map_set

    def delete(self, map_set: MapSet):
        if map_set.uuid in self._data:
            del self._data[map_set.uuid]

    def has(self, key: UUID) -> bool:
        return key in self._data

    def values(self) -> ValuesView[MapSet]:
        return self._data.values()
