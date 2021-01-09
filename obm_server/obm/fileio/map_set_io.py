from glob import glob
from os.path import isfile
from os import makedirs, unlink, rmdir
from subprocess import run
from uuid import UUID
from typing import List, Optional
import json

from obm.common.dep_context import DepContext, get_context
from obm.data.map_set import MapSet, MapSetEntry
from obm.data.battle_map import BattleMap
from obm.fileio.map_set_paths import MapSetPaths
from obm.fileio.static_data import DEFAULT_MAP


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

    def save_battle_map(self, map_set: MapSet, battle_map: BattleMap):
        with open(self._map_set_paths.get_battle_map_path(map_set.uuid, battle_map.uuid), 'w') as fp:
            fp.write(
                battle_map.json(indent=4)
            )

    def save_background(self, map_set: MapSet, battle_map: BattleMap, image_data: Optional[bytes]):
        image_path = self._map_set_paths.get_background_path(map_set.uuid, battle_map.uuid)
        if image_data is None:
            if isfile(image_path):
                unlink(image_path)
        else:
            with open(image_path, 'wb') as fp:
                fp.write(image_data)

    def load_map_set(self, uuid: UUID) -> MapSet:
        map_set_file = self._map_set_paths.get_map_set_path(uuid)
        if not isfile(map_set_file):
            raise NoSuchMapSet(f"No map set found at path '{map_set_file}'")
        try:
            with open(map_set_file, 'r') as fp:
                raw_data = json.load(fp)
            map_set = MapSet(**raw_data, uuid=uuid)
        except Exception as e:
            raise MapSetLoadError(
                f"Failed to load map set {uuid}: {type(e).__name__}({str(e)})"
            )
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
        try:
            with open(battle_map_path, 'r') as fp:
                raw_data = json.load(fp)
            battle_map = BattleMap(**raw_data)
        except Exception as e:
            raise MapSetLoadError(
                f"Failed to load Battle Map {map_set.uuid}/{battle_map_uuid}: {type(e).__name__}({str(e)})"
            )
        return battle_map

    def load_image_data(self, map_set: MapSet, battle_map_uuid: UUID) -> Optional[bytes]:
        background_path = self._map_set_paths.get_background_path(map_set.uuid, battle_map_uuid)
        if isfile(background_path):
            with open(background_path, 'rb') as fp:
                return fp.read()
        else:
            return None

    def get_image_dimensions(self, map_set: MapSet, battle_map_uuid: UUID) -> (int, int):
        background_path = self._map_set_paths.get_background_path(map_set.uuid, battle_map_uuid)
        if not isfile(background_path):
            background_path = DEFAULT_MAP
        process = run(['identify', '-format', '%w %h', background_path], capture_output=True, encoding='ascii')
        if process.returncode != 0:
            raise Exception('Failed to identify dimensions of image!')
        width, height = process.stdout.split(' ')
        return int(width), int(height)

    def delete_map_set(self, map_set: MapSet):
        for battle_map_uuid in self.scan_disk_for_battle_maps(map_set):
            self.delete_battle_map(map_set, battle_map_uuid)
        unlink(self._map_set_paths.get_map_set_path(map_set.uuid))
        for path in [
            self._map_set_paths.get_token_set_json_path(map_set),
            self._map_set_paths.get_token_set_html_path(map_set),
        ]:
            if isfile(path):
                unlink(path)
        rmdir(self._map_set_paths.get_map_set_dir(map_set.uuid))

    def delete_battle_map(self, map_set: MapSet, uuid: UUID):
        unlink(self._map_set_paths.get_battle_map_path(map_set.uuid, uuid))
        background_path = self._map_set_paths.get_background_path(map_set.uuid, uuid)
        if isfile(background_path):
            unlink(background_path)
