import tarfile
import json
from uuid import UUID
from typing import BinaryIO
import os
from shutil import rmtree
from os.path import isdir, join

from obm.common.dep_context import DepContext, get_context
from obm.common.logging import warning, info
from obm.data.map_set import MapSet
from obm.fileio.map_set_paths import MapSetPaths


class ImportValidationError(Exception):
    pass


class BackupIo:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_path: MapSetPaths = ctx.get(MapSetPaths)

    def export_map_set_tar_gz(self, uuid: UUID, tar_gz: BinaryIO):
        with tarfile.open('memory', mode='w|gz', fileobj=tar_gz) as tar:
            map_set_dir = self._map_set_path.get_map_set_dir(uuid)
            tar.add(map_set_dir, arcname='.', recursive=True)

    def import_map_set_tar_gz(self, uuid: UUID, tar_gz: BinaryIO):
        import_dir = self._create_import_dir(uuid)
        try:
            info(f"Starting to import Background Set {uuid} from archive ...")
            target_dir = self._map_set_path.get_map_set_dir(uuid)
            if not isdir(target_dir):
                raise ImportValidationError(f"Background Set {uuid} does not exist on this server! Go away hacker!")
            self._extract_data(import_dir, tar_gz)
            self._validate_data(import_dir)
            rmtree(target_dir)
            os.rename(import_dir, target_dir)
            info(f"Successfully imported Background Set {uuid}.")
        except Exception as e:
            warning(f"FAILED to import Background Set {uuid}.")
            raise e
        finally:
            if isdir(import_dir):
                rmtree(import_dir)

    def _create_import_dir(self, uuid: UUID):
        import_dir = self._map_set_path.get_map_set_import_dir(uuid)
        try:
            os.mkdir(import_dir)
        except FileExistsError:
            raise ImportValidationError(f"Background Set {uuid} has already a running input.")
        return import_dir

    def _extract_data(self, import_dir: str, tar_gz: BinaryIO):
        with tarfile.open('memory', mode='r|gz', fileobj=tar_gz) as tar:
            for tarinfo in tar:
                if not tarinfo.isreg():
                    warning(f"Import: Ignoring '{tarinfo.name}' (not a file)")
                    continue
                if not self._map_set_path.check_relative_map_set_path(tarinfo.name):
                    warning(f"Import: Ignoring '{tarinfo.name}' (not an expected file)")
                    continue
                tar.extract(tarinfo, set_attrs=False, path=import_dir)

    @staticmethod
    def _validate_data(import_dir: str):
        try:
            map_set_file = join(import_dir, 'map_set.json')
            with open(map_set_file, 'r') as fp:
                raw_data = json.load(fp)
            _fake = MapSet(**raw_data, uuid=UUID('91628431-b6d4-4bc7-a984-efc204eee2e0'))
        except Exception as e:
            raise ImportValidationError(str(e))
