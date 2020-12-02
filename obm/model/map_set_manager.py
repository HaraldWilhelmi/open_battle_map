from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from fastapi import Depends

from obm.common.error import check_dependency
from obm.data.map_set import MapSet
from obm.model.map_set_cache import MapSetCache, get_map_set_cache
from obm.data.battle_map import BattleMap
from obm.fileio.map_set_io import MapSetIO, get_map_set_io
from obm.model.map_set_directory import MapSetDirectory, get_map_set_directory


class MapSetManager:
    def __init__(
            self,
            map_set_io: MapSetIO = Depends(get_map_set_io),
            map_set_cache: MapSetCache = Depends(get_map_set_cache),
            map_set_directory: MapSetDirectory = Depends(get_map_set_directory),
    ):
        self._map_set_io = map_set_io
        self._map_set_cache = map_set_cache
        self._map_set_directory = map_set_directory

    def create(self, name: str) -> MapSet:
        map_set = MapSet(
            name=name,
            uuid=uuid4(),
            saved_flag=False,
            last_access=datetime.now(),
        )
        self._map_set_cache[map_set.uuid] = map_set
        self._map_set_directory.add(map_set)
        self.add_new_battle_map(map_set, name='Default')
        self.save(map_set)
        return map_set

    def get_by_uuid(self, uuid: UUID):
        if uuid in self._map_set_cache:
            map_set = self._map_set_cache[uuid]
            map_set.touch(changed=False)
            return map_set
        else:
            return self.load(uuid)

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

    def load(self, uuid: UUID) -> MapSet:
        map_set = self._map_set_io.load_map_set(uuid)
        map_set.touch(changed=False)
        self._map_set_cache[uuid] = map_set
        return map_set

    @staticmethod
    def delete_battle_map(map_set: MapSet, battle_map: BattleMap):
        assert battle_map.map_set_uuid == map_set.uuid
        del map_set.battle_maps_by_uuid[battle_map.uuid]
        map_set.touch()

    def delete(self, map_set: MapSet):
        del self._map_set_cache[map_set.uuid]
        self._map_set_io.delete_map_set(map_set)
        self._map_set_directory.remove(map_set)


map_set_manager: Optional[MapSetManager] = None


def get_map_set_manager() -> MapSetManager:
    check_dependency(map_set_manager, 'map_set_manager')
    return map_set_manager


def setup_map_set_manager_for_production():
    global map_set_manager
    map_set_manager = MapSetManager()
