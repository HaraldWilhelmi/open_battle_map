from typing import Optional, List

from obm.common.dep_context import DepContext, get_context
from obm.data.token_descriptor import TokenDescriptor
from obm.fileio.token_set_io import TokenSetIo, TokenSetLoader
from obm.model.magic_color_svg import MagicColorSvg


class TokenSetManager:
    def __init__(self, ctx: DepContext = get_context()):
        self._token_set_io: TokenSetIo = ctx.get(TokenSetIo)
        self._magic_color_svg: MagicColorSvg = ctx.get(MagicColorSvg)

        self._default_token_set: Optional[List[TokenDescriptor]] = None

    def set_default_token_set(self, x: List[TokenDescriptor]):
        self._default_token_set = x

    def get_default_token_set(self):
        if self._default_token_set is None:
            loader = self._token_set_io.get_default_token_set_loader()
            self._default_token_set = loader.load()
            self._load_image_data(loader, self._default_token_set, 'default')
        return self._default_token_set

    def _load_image_data(self, loader: TokenSetLoader, tokens: List[TokenDescriptor], label: str):
        for token in tokens:
            key = f"{label}/token_{token.token_type}"
            svg_data = loader.load_image(token)
            self._magic_color_svg.register_svg(key, svg_data)
