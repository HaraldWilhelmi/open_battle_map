from uuid import UUID, uuid4
from datetime import datetime

from obm.common.dep_context import DepContext, get_context
from obm.data.map_set import MapSet
from obm.model.map_set_cache import MapSetCache
from obm.data.battle_map import BattleMap
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory


class MapSetManager:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_io: MapSetIO = ctx.get(MapSetIO)
        self._map_set_cache: MapSetCache = ctx.get(MapSetCache)
        self._map_set_directory: MapSetDirectory = ctx.get(MapSetDirectory)

    def create(self, name: str) -> MapSet:
        map_set = MapSet(
            name=name,
            uuid=uuid4(),
            saved_flag=False,
            last_access=datetime.now(),
        )
        self._map_set_cache.add(map_set)
        self._map_set_directory.add(map_set)
        self.add_new_battle_map(map_set, name='Default')
        self.save(map_set)
        return map_set

    def get_by_uuid(self, uuid: UUID):
        map_set = self._map_set_cache.get_by_uuid(uuid)
        map_set.touch(changed=False)
        return map_set

    @staticmethod
    def add_new_battle_map(map_set: MapSet, name: str) -> BattleMap:
        battle_map = BattleMap(
            name=name,
            uuid=uuid4(),
            map_set_uuid=map_set.uuid
        )
        map_set.battle_maps_by_uuid[battle_map.uuid] = battle_map
        map_set.touch()
        return battle_map

    def save(self, map_set: MapSet):
        self._map_set_io.save_map_set(map_set)

    @staticmethod
    def delete_battle_map(map_set: MapSet, battle_map: BattleMap):
        assert battle_map.map_set_uuid == map_set.uuid
        del map_set.battle_maps_by_uuid[battle_map.uuid]
        map_set.touch()

    def delete(self, map_set: MapSet):
        self._map_set_cache.delete(map_set)
        self._map_set_io.delete_map_set(map_set)
        self._map_set_directory.delete(map_set)

    def reload_map_set_from_disk(self, old_map_set: MapSet):
        self._map_set_cache.delete(old_map_set)
        self._map_set_directory.delete(old_map_set)
        new_map_set = self.get_by_uuid(old_map_set.uuid)
        self._map_set_directory.add(new_map_set)
