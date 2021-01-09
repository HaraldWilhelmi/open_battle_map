from typing import List
from pydantic import BaseModel

from obm.data.common import ColorCombo


class TokenDescriptor(BaseModel):
    token_type: int
    width_in_m: float
    mark_font_size: str
    width: int
    height: int
    color_combos: List[ColorCombo]

