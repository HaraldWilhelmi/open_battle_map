from typing import Dict, ValuesView
from uuid import UUID

from obm.common.dep_context import get_context, DepContext
from obm.fileio.map_set_io import MapSetIO
from obm.model.managed_map_set import ManagedMapSet


class MapSetCache:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_io: MapSetIO = ctx.get(MapSetIO)
        self._data: Dict[UUID, ManagedMapSet] = {}

    def get_by_uuid(self, uuid: UUID):
        return self._data[uuid]

    def update(self, map_set: ManagedMapSet):
        self._data[map_set.uuid] = map_set

    def delete(self, map_set: ManagedMapSet):
        if map_set.uuid in self._data:
            del self._data[map_set.uuid]

    def has(self, key: UUID) -> bool:
        return key in self._data

    def values(self) -> ValuesView[ManagedMapSet]:
        return self._data.values()
