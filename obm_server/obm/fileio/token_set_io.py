from os.path import join, dirname, isfile
from typing import List, Optional
import json

from obm.common.dep_context import get_context, DepContext
from obm.data.map_set import MapSet
from obm.data.token_descriptor import TokenDescriptor
from obm.fileio.map_set_paths import MapSetPaths


class TokenSetIO:
    def __init__(self, ctx: DepContext = get_context()):
        self._map_set_paths: MapSetPaths = ctx.get(MapSetPaths)

    def load_descriptors(self, map_set: Optional[MapSet]) -> List[TokenDescriptor]:
        path = self._map_set_paths.get_token_set_json_path(map_set, use_default=True)
        raw_data = self._load_main_file(path)
        result: List[TokenDescriptor] = []
        for raw_token in raw_data:
            token = TokenDescriptor(**raw_token)
            result.append(token)
        return result

    @staticmethod
    def _load_main_file(path: str):
        with open(path, 'r') as fp:
            raw_data = json.load(fp)
        if type(raw_data) is not list:
            raise ValueError(f"File '{path}' did not contain a json list!")
        return raw_data

    def save_descriptors(self, map_set: MapSet, token_set: List[TokenDescriptor]):
        path = self._map_set_paths.get_token_set_json_path(map_set)
        as_json_strings = [x.json(indent=4) for x in token_set]
        as_json = '[\n' + ','.join(as_json_strings) + '\n]'
        with open(path, 'w') as fp:
            fp.write(as_json)

    def load_html(self, map_set: Optional[MapSet]) -> str:
        path = self._map_set_paths.get_token_set_html_path(map_set, use_default=True)
        with open(path, 'r') as fp:
            return fp.read()

    def save_html(self, map_set: MapSet, html: str):
        path = self._map_set_paths.get_token_set_html_path(map_set)
        with open(path, 'w') as fp:
            fp.write(html)
