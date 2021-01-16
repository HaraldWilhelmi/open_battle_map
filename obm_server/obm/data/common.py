from pydantic import BaseModel
from pydantic.color import Color


class ColorCombo(BaseModel):
    color: Color
    mark_color: Color


class Coordinate(BaseModel):
    x: float
    y: float
