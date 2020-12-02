from glob import glob
from os.path import join, isfile
from os import makedirs, unlink, rmdir
from uuid import UUID
from typing import List, Optional
import json
import re
from fastapi import Depends

from obm.common.error import check_dependency
from obm.data.config import Config, get_config
from obm.data.map_set import MapSet, MapSetEntry
from obm.data.battle_map import BattleMap


BATTLE_MAP_NAME_REGEXP = re.compile(r'.*/battle_map_([0-9a-zA-Z-]*)\.json\Z')


class MapSetLoadError(Exception):
    pass


class MapSetIO:
    def __init__(
            self,
            config: Config = Depends(get_config),
    ):
        self._config = config

    def get_map_set_dir(self, uuid: UUID) -> str:
        return join(self._config.data_dir, uuid.__str__())

    def get_map_set_path(self, uuid: UUID) -> str:
        base_dir = self.get_map_set_dir(uuid)
        return join(base_dir, 'map_set.json')

    def get_battle_map_path(self, map_set_uuid: UUID, battle_map_uuid: UUID) -> str:
        return join(
            self.get_map_set_dir(map_set_uuid),
            f"battle_map_{battle_map_uuid}.json"
        )

    def get_background_path(self, map_set_uuid: UUID, battle_map_uuid: UUID) -> str:
        return join(
            self.get_map_set_dir(map_set_uuid),
            f"background_{battle_map_uuid}"
        )

    def get_map_set_uuid_to_name_mapping(self):
        result = {}
        glob_str = join(self._config.data_dir, '*', 'map_set.json')
        for map_set_path in glob(glob_str):
            raw_data = json.load(map_set_path)
            entry = MapSetEntry(**raw_data)
            result[entry.uuid] = entry.name
        return result

    def save_map_set(self, map_set: MapSet):
        uuid = map_set.uuid
        makedirs(self.get_map_set_dir(uuid), 0o700, exist_ok=True)
        with open(self.get_map_set_path(uuid), 'w') as fp:
            fp.write(
                map_set.json(include={'name', 'uuid'})
            )
        for battle_map in map_set.battle_maps_by_uuid.values():
            self.save_battle_map(battle_map)
        map_set.saved_flag = True

    def save_battle_map(self, battle_map: BattleMap):
        map_set_uuid = battle_map.map_set_uuid
        with open(self.get_battle_map_path(map_set_uuid, battle_map.uuid), 'w') as fp:
            fp.write(
                battle_map.json(exclude={'background.image_data'})
            )

        image_path = self.get_background_path(map_set_uuid, battle_map.uuid)
        if battle_map.background is None:
            if isfile(image_path):
                unlink(image_path)
        else:
            with open(image_path, 'wb') as fp:
                fp.write(battle_map.background.image_data)

    def load_map_set(self, uuid: UUID) -> MapSet:
        try:
            map_set = self.load_map_set_core_data(uuid)
            for battle_map_uuid in self.scan_disk_for_battle_maps(map_set):
                battle_map = self.load_battle_map(map_set, battle_map_uuid)
                map_set.battle_maps_by_uuid[battle_map.uuid] = battle_map
        except Exception as e:
            raise MapSetLoadError(f"Failed to load map set {uuid}: {str(e)}")
        return map_set

    def load_map_set_core_data(self, uuid: UUID) -> MapSet:
        with open(self.get_map_set_path(uuid), 'r') as fp:
            raw_data = json.load(fp)
        map_set = MapSet(**raw_data)
        assert uuid == map_set.uuid
        map_set.saved_flag = True
        return map_set

    def scan_disk_for_battle_maps(self, map_set: MapSet) -> List[UUID]:
        glob_str = join(self.get_map_set_dir(map_set.uuid), 'battle_map_*.json')
        result = []
        for battle_map_path in glob(glob_str):
            match = BATTLE_MAP_NAME_REGEXP.match(battle_map_path)
            result.append(UUID(match.group(1)))
        return result

    def load_battle_map(self, map_set: MapSet, battle_map_uuid: UUID) -> BattleMap:
        battle_map_path = self.get_battle_map_path(map_set.uuid, battle_map_uuid)
        with open(battle_map_path, 'r') as fp:
            raw_data = json.load(fp)
        image_data = self.load_image_data(map_set, battle_map_uuid)
        battle_map = self.create_battle_map_from_raw_data(raw_data, image_data)
        assert battle_map_uuid == battle_map.uuid
        return battle_map

    def load_image_data(self, map_set: MapSet, battle_map_uuid: UUID) -> Optional[bytes]:
        background_path = self.get_background_path(map_set.uuid, battle_map_uuid)
        if isfile(background_path):
            with open(background_path, 'rb') as fp:
                return fp.read()
        else:
            return None

    @staticmethod
    def create_battle_map_from_raw_data(raw_data, image_data) -> BattleMap:
        if image_data is None:
            assert 'background' not in raw_data
        else:
            raw_data['background']['image_data'] = image_data
            assert raw_data['background']['media_type'] is not None
        return BattleMap(**raw_data)

    def delete_map_set(self, map_set: MapSet):
        for battle_map_uuid in self.scan_disk_for_battle_maps(map_set):
            unlink(self.get_battle_map_path(map_set.uuid, battle_map_uuid))
            background_path = self.get_background_path(map_set.uuid, battle_map_uuid)
            if isfile(background_path):
                unlink(background_path)
        unlink(self.get_map_set_path(map_set.uuid))
        rmdir(self.get_map_set_dir(map_set.uuid))


map_set_io: Optional[MapSetIO] = None


def get_map_set_io() -> MapSetIO:
    check_dependency(map_set_io, 'map_set_io')
    return map_set_io


def setup_map_set_io_for_production():
    global map_set_io
    map_set_io = MapSetIO()
