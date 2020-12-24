from glob import glob
from os.path import isfile
from os import makedirs, unlink, rmdir
from uuid import UUID
from typing import Dict, List, Optional
import json

from obm.common.dep_context import DepContext, get_context
from obm.data.map_set import MapSet, MapSetEntry
from obm.data.battle_map import BattleMap
from obm.fileio.map_set_paths import MapSetPaths


class MapSetLoadError(Exception):
    pass


class NoSuchMapSet(MapSetLoadError):
    pass


class NoSuchBattleMap(MapSetLoadError):
    pass


class CorruptedImageData(MapSetLoadError):
    pass


class MapSetIO:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_paths: MapSetPaths = ctx.get(MapSetPaths)

    def get_map_set_uuid_to_name_mapping(self):
        result = {}
        glob_str = self._map_set_paths.get_map_set_json_glob_string()
        for map_set_path in glob(glob_str):
            uuid = self._map_set_paths.get_map_set_uuid_from_path(map_set_path)
            with open(map_set_path, 'r') as fp:
                raw_data = json.load(fp)
            entry = MapSetEntry(**raw_data, uuid=uuid)
            result[uuid] = entry.name
        return result

    def save_map_set(self, map_set: MapSet):
        uuid = map_set.uuid
        makedirs(self._map_set_paths.get_map_set_dir(uuid), 0o700, exist_ok=True)
        with open(self._map_set_paths.get_map_set_path(uuid), 'w') as fp:
            fp.write(
                map_set.json(include={'name'}, indent=4)
            )
        for battle_map in map_set.battle_maps_by_uuid.values():
            self.save_battle_map(battle_map)
        map_set.saved_flag = True

    def save_battle_map(self, battle_map: BattleMap):
        map_set_uuid = battle_map.map_set_uuid
        with open(self._map_set_paths.get_battle_map_path(map_set_uuid, battle_map.uuid), 'w') as fp:
            fp.write(
                battle_map.json(exclude={'background_image_data', 'map_set_uuid'}, indent=4)
            )

        image_path = self._map_set_paths.get_background_path(map_set_uuid, battle_map.uuid)
        if battle_map.background_image_data is None:
            if isfile(image_path):
                unlink(image_path)
        else:
            with open(image_path, 'wb') as fp:
                fp.write(battle_map.background_image_data)

    def load_map_set(self, uuid: UUID) -> MapSet:
        try:
            map_set = self.load_map_set_core_data(uuid)
            for battle_map_uuid in self.scan_disk_for_battle_maps(map_set):
                battle_map = self.load_battle_map(map_set, battle_map_uuid)
                map_set.battle_maps_by_uuid[battle_map.uuid] = battle_map
        except MapSetLoadError as e:
            raise e
        except Exception as e:
            raise MapSetLoadError(f"Failed to load map set {uuid}: {type(e).__name__}({str(e)})")
        return map_set

    def load_map_set_core_data(self, uuid: UUID) -> MapSet:
        map_set_file = self._map_set_paths.get_map_set_path(uuid)
        if not isfile(map_set_file):
            raise NoSuchMapSet(f"No map set found at path '{map_set_file}'")
        with open(map_set_file, 'r') as fp:
            raw_data = json.load(fp)
        map_set = MapSet(**raw_data, uuid=uuid)
        map_set.saved_flag = True
        return map_set

    def scan_disk_for_battle_maps(self, map_set: MapSet) -> List[UUID]:
        glob_str = self._map_set_paths.get_battle_map_glob_string(map_set.uuid)
        result = []
        for battle_map_path in glob(glob_str):
            result.append(self._map_set_paths.get_battle_map_uuid_from_path(battle_map_path))
        return result

    def load_battle_map(self, map_set: MapSet, battle_map_uuid: UUID) -> BattleMap:
        battle_map_path = self._map_set_paths.get_battle_map_path(map_set.uuid, battle_map_uuid)
        if not isfile(battle_map_path):
            raise NoSuchBattleMap(f"No battle map found aft path '{battle_map_path}'")
        with open(battle_map_path, 'r') as fp:
            raw_data = json.load(fp)
        image_data = self.load_image_data(map_set, battle_map_uuid)
        battle_map = self.create_battle_map_from_raw_data(map_set.uuid, raw_data, image_data)
        assert battle_map_uuid == battle_map.uuid, f"UUID in {battle_map_path} does not match file name!"
        return battle_map

    def load_image_data(self, map_set: MapSet, battle_map_uuid: UUID) -> Optional[bytes]:
        background_path = self._map_set_paths.get_background_path(map_set.uuid, battle_map_uuid)
        if isfile(background_path):
            with open(background_path, 'rb') as fp:
                return fp.read()
        else:
            return None

    @staticmethod
    def create_battle_map_from_raw_data(map_set_uuid: UUID, raw_data: Dict, image_data: bytes) -> BattleMap:
        battle_map = BattleMap(**raw_data, map_set_uuid=map_set_uuid)
        if image_data is None:
            if battle_map.background_media_type is not None:
                raise CorruptedImageData(f"Battle map {battle_map.uuid} has missing image data!")
        else:
            if battle_map.background_media_type is None:
                raise CorruptedImageData(f"Battle map {battle_map.uuid} has image data but no media type!")
            battle_map.background_image_data = image_data
        return battle_map

    def delete_map_set(self, map_set: MapSet):
        for battle_map_uuid in self.scan_disk_for_battle_maps(map_set):
            self.delete_battle_map(map_set, battle_map_uuid);
        unlink(self._map_set_paths.get_map_set_path(map_set.uuid))
        rmdir(self._map_set_paths.get_map_set_dir(map_set.uuid))

    def delete_battle_map(self, map_set: MapSet, uuid: UUID):
        unlink(self._map_set_paths.get_battle_map_path(map_set.uuid, uuid))
        background_path = self._map_set_paths.get_background_path(map_set.uuid, uuid)
        if isfile(background_path):
            unlink(background_path)
