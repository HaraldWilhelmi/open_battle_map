from enum import Enum
from pydantic import BaseModel
from pydantic.color import Color


class ColorCombo(BaseModel):
    color: Color
    mark_color: Color


class ActiveAreaShape(Enum):
    RECT = 'rect'
    CIRCLE = 'circle'


class Coordinate(BaseModel):
    x: int
    y: int
