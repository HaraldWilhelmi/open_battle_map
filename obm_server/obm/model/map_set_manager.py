from uuid import UUID, uuid4
from datetime import datetime

from obm.common.dep_context import DepContext, get_context
from obm.data.map_set import MapSet
from obm.model.managed_map_set import ManagedMapSet
from obm.model.map_set_cache import MapSetCache
from obm.fileio.map_set_io import MapSetIO, CorruptedImageData
from obm.model.map_set_directory import MapSetDirectory
from obm.model.managed_battle_map import ManagedBattleMap


class MapSetManager:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_io: MapSetIO = ctx.get(MapSetIO)
        self._map_set_cache: MapSetCache = ctx.get(MapSetCache)
        self._map_set_directory: MapSetDirectory = ctx.get(MapSetDirectory)

    def create(self, name: str) -> ManagedMapSet:
        map_set = ManagedMapSet(
            name=name,
            uuid=uuid4(),
            saved_flag=False,
            last_access=datetime.now(),
        )
        self._map_set_cache.update(map_set)
        self._map_set_directory.add(map_set)
        map_set.add_new_battle_map(name='Default')
        self.save(map_set)
        return map_set

    def get_by_uuid(self, uuid: UUID) -> ManagedMapSet:
        if self._map_set_cache.has(uuid):
            map_set = self._map_set_cache.get_by_uuid(uuid)
        else:
            map_set = self.load(uuid)
            self._map_set_cache.update(map_set)
        map_set.touch(changed=False)
        return map_set

    def delete_battle_map(self, map_set: ManagedMapSet, battle_map: ManagedBattleMap):
        map_set.delete_battle_map(battle_map)
        self._map_set_io.delete_battle_map(map_set, battle_map.uuid)
        self.save(map_set)

    def delete(self, map_set: ManagedMapSet):
        self._map_set_cache.delete(map_set)
        self._map_set_io.delete_map_set(map_set)
        self._map_set_directory.delete(map_set)

    def reload_map_set_from_disk(self, old_map_set: MapSet):
        map_set = self.load(old_map_set.uuid)
        self._map_set_cache.update(map_set)

    def save(self, map_set: ManagedMapSet) -> None:
        map_set_io = self._map_set_io
        clean_map_set = map_set.get_clean_data()
        map_set_io.save_map_set(clean_map_set)
        for battle_map in map_set.get_battle_maps():
            self.save_battle_map(battle_map)
            self.save_background(battle_map)
        map_set.saved_flag = True

    def sanitize_token_positions(self, battle_map: ManagedBattleMap):
        map_set_io = self._map_set_io
        width, height = map_set_io.get_image_dimensions(map_set=battle_map.map_set, battle_map_uuid=battle_map.uuid)
        battle_map.sanitize_token_positions(width, height)

    def save_battle_map(self, battle_map: ManagedBattleMap):
        map_set_io = self._map_set_io
        map_set_io.save_battle_map(battle_map.map_set, battle_map.get_clean_data())

    def save_background(self, battle_map):
        map_set_io = self._map_set_io
        map_set_io.save_background(
            battle_map.map_set, battle_map, battle_map.get_background_image()
        )

    def load(self, uuid: UUID) -> ManagedMapSet:
        map_set_io = self._map_set_io
        map_set = map_set_io.load_map_set(uuid)
        battle_map_uuids = map_set_io.scan_disk_for_battle_maps(map_set)
        battle_maps = [
            self.load_battle_map(map_set, battle_map_uuid)
            for battle_map_uuid in battle_map_uuids
        ]

        result = ManagedMapSet(
            battle_maps=battle_maps,
            **map_set.__dict__
        )
        result.saved_flag = True
        return result

    def load_battle_map(self, map_set: MapSet, uuid: UUID) -> ManagedBattleMap:
        map_set_io = self._map_set_io
        battle_map = map_set_io.load_battle_map(map_set, uuid)
        background_image = map_set_io.load_image_data(map_set, uuid)

        if background_image is None and battle_map.background_media_type is not None:
            raise CorruptedImageData(
                f"Battle map {battle_map.uuid} has missing image data!"
            )
        if background_image is not None and battle_map.background_media_type is None:
            raise CorruptedImageData(
                f"Battle map {battle_map.uuid} has image data but no media type!"
            )

        return ManagedBattleMap(map_set=map_set, background_image=background_image, **battle_map.__dict__)
