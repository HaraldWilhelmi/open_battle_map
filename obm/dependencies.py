from obm.common.dep_context import get_context
from obm.data.config import Config
from obm.fileio.backup_io import BackupIo
from obm.model.map_set_manager import MapSetManager
from obm.model.map_set_directory import MapSetDirectory
from obm.model.magic_color_svg import MagicColorSvg


def get_config() -> Config:
    return get_context().get(Config)


def get_map_set_manager() -> MapSetManager:
    return get_context().get(MapSetManager)


def get_map_set_directory() -> MapSetDirectory:
    return get_context().get(MapSetDirectory)


def get_magic_color_svg() -> MagicColorSvg:
    return get_context().get(MagicColorSvg)


def get_backup_io() -> BackupIo:
    return get_context().get(BackupIo)
