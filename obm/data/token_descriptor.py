from typing import List
from pydantic import BaseModel, root_validator

from obm.data.common import ColorCombo, ActiveAreaShape


# noinspection SpellCheckingInspection
class ActiveArea(BaseModel):
    shape: ActiveAreaShape
    coords: List[int]

    @root_validator
    def check(cls, values):
        shape = values.get('shape')
        coords = values.get('coords')
        if shape == ActiveAreaShape.RECT:
            if len(coords) != 4:
                raise ValueError('Rect areas need 4 values for the coordinates (x1, y1, x2, y2)')
        else:
            if len(coords) != 3:
                raise ValueError('Circle areas need 4 values for the coordinates (x, y, r)')
        return values


class TokenDescriptor(BaseModel):
    token_type: int
    width_in_m: float
    mark_font_size: str
    active_areas: List[ActiveArea]
    color_combos: List[ColorCombo]
