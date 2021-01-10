import re
from os.path import join, dirname, isfile
from typing import Optional
from uuid import UUID

from obm.common.dep_context import DepContext, get_context
from obm.data.config import Config
from obm.data.map_set import MapSet

_MAP_SET_NAME_REGEXP = re.compile(r'.*/([0-9a-zA-Z-]{36})/map_set\.json\Z')
_BATTLE_MAP_NAME_REGEXP = re.compile(r'.*/battle_map_([0-9a-zA-Z-]{36})\.json\Z')

_VALIDATE_PATHS = [
    re.compile(r'\A\./map_set\.json\Z'),
    re.compile(r'\A\./token_set\.json\Z'),
    re.compile(r'\A\./token_set\.html\Z'),
    re.compile(r'\A\./battle_map_[0-9a-z-]{36}\.json\Z'),
    re.compile(r'\A\./background_[0-9a-z-]{36}\Z'),
]


class MapSetPaths:
    DEFAULT_TOKEN_SET_DIR = join(dirname(dirname(dirname(__file__))), 'data', 'default_tokens')
    TOKENS_JSON = 'tokens.json'
    TOKENS_HTML = 'tokens.xhtml'

    def __init__(self, ctx: DepContext = get_context()):
        self._config: Config = ctx.get(Config)

    def get_map_set_dir(self, uuid: UUID) -> str:
        return join(self._config.data_dir, uuid.__str__())

    def get_map_set_import_dir(self, uuid: UUID) -> str:
        return join(self._config.data_dir, uuid.__str__() + '.import')

    def get_map_set_path(self, uuid: UUID) -> str:
        base_dir = self.get_map_set_dir(uuid)
        return join(base_dir, 'map_set.json')

    def get_token_set_json_path(self, map_set: Optional[MapSet], use_default: bool = False) -> str:
        return self._select_path(MapSetPaths.TOKENS_JSON, map_set, MapSetPaths.DEFAULT_TOKEN_SET_DIR, use_default)

    def _select_path(self, name: str, map_set: Optional[MapSet], default_dir: str, use_default: bool):
        if map_set is not None:
            base_dir = self.get_map_set_dir(map_set.uuid)
            candidate = join(base_dir, name)
            if not use_default or isfile(candidate):
                return candidate
        return join(default_dir, name)

    def get_token_set_html_path(self, map_set: Optional[MapSet], use_default: bool = False) -> str:
        return self._select_path(MapSetPaths.TOKENS_HTML, map_set, MapSetPaths.DEFAULT_TOKEN_SET_DIR, use_default)

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

    def get_map_set_json_glob_string(self):
        return join(self._config.data_dir, '*', 'map_set.json')

    def get_battle_map_glob_string(self, map_set_uuid: UUID):
        return join(self.get_map_set_dir(map_set_uuid), 'battle_map_*.json')

    @staticmethod
    def get_map_set_uuid_from_path(path: str) -> UUID:
        match = _MAP_SET_NAME_REGEXP.match(path)
        return UUID(match.group(1))

    @staticmethod
    def get_battle_map_uuid_from_path(path: str) -> UUID:
        match = _BATTLE_MAP_NAME_REGEXP.match(path)
        return UUID(match.group(1))

    @staticmethod
    def check_relative_map_set_path(path) -> bool:
        for regexp in _VALIDATE_PATHS:
            if regexp.match(path):
                return True
        return False
