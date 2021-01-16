from pydantic import BaseModel
from pydantic.color import Color
from uuid import UUID

from obm.data.common import Coordinate


class PointerAction(BaseModel):
    position: Coordinate
    color: Color
    uuid: UUID
