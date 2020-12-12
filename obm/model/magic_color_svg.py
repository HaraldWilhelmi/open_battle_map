#
# This class takes SVG images as input and does this:
# - convert them to templates by replacing all occurrences of the magic color #555555 by a template variable
# - caches the templates
# - on request return a new SVG image with the template variable replaced by a given color.
# - If a mark is given (typically max. 2 characters - think of a jersey number) any occurrence of
#   #X#MAGIC_MARKER#X# is replaced by that. Otherwise it's replaced by the empty string.
#
# Once something like this is an official standard we should replace this module:
#
# https://tabatkins.github.io/specs/svg-params/#:~:text=SVG%20Parameters%20are%20a%20way,to%20%22external%22%20SVG%20images.
#

from typing import Dict
from pydantic.color import Color


class MagicColorSvg:
    OCTARIN = '"#555555"'
    MAGIC_MARKER = '#X#MAGIC_MARKER#X#'

    def __init__(self):
        self._template_cache: Dict[str, str] = {}

    def register_svg(self, key: str, data: bytes):
        self._template_cache[key] = data.decode()

    def get_colored_svg(self, key: str, color: Color, mark: str = '') -> bytes:
        quoted_color = f'"{str(color)}"'
        return (
            self._template_cache[key]
            .replace(MagicColorSvg.OCTARIN, quoted_color)
            .replace(MagicColorSvg.MAGIC_MARKER, mark)
            .encode()
        )
