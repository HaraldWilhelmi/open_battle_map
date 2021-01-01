from os.path import join, dirname
from typing import List
import json
from obm.data.token_descriptor import TokenDescriptor


class TokenSetLoader:
    def __init__(self, path: str, is_default: bool):
        self._path = path
        self._main_file = join(self._path, 'tokens.json')
        self._is_default = is_default

    def load(self) -> List[TokenDescriptor]:
        raw_data = self._load_main_file()
        result: List[TokenDescriptor] = []
        for raw_token in raw_data:
            token = TokenDescriptor(**raw_token)
            self._validate_token(token)
            result.append(token)
        return result

    def _load_main_file(self):
        main_file = self._main_file
        with open(main_file, 'r') as fp:
            raw_data = json.load(fp)
        if type(raw_data) is not list:
            raise ValueError(f"File '{main_file}' did not contain a json list!")
        return raw_data

    def _validate_token(self, token: TokenDescriptor):
        main_file = self._main_file
        if token.token_type >= 1000 and self._is_default:
            raise ValueError(f"Default token file '{main_file}' contained token_type >= 1000!")
        if token.token_type < 1000 and not self._is_default:
            raise ValueError(f"None-Default token file '{main_file}' contained token_type < 1000!")

    def load_image(self, token: TokenDescriptor) -> bytes:
        image_file = join(self._path, f"token_{str(token.token_type)}.svg")
        with open(image_file, 'rb') as fp:
            return fp.read()


class TokenSetIo:
    DEFAULT_TOKEN_SET_DIR = join(dirname(dirname(dirname(__file__))), 'data', 'default_tokens')

    @staticmethod
    def get_default_token_set_loader() -> TokenSetLoader:
        return TokenSetLoader(TokenSetIo.DEFAULT_TOKEN_SET_DIR, is_default=True)
