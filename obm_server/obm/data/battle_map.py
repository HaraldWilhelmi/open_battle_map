from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

from obm.data.token_state import TokenState


class BattleMap(BaseModel):
    uuid: UUID
    name: str
    revision: int = 0
    action_count: int = 0

    background_pixels_per_meter: float = 30
    background_media_type: Optional[str]

    tokens: List[TokenState] = []
