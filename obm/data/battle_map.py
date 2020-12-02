from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class Background(BaseModel):
    media_type: str
    image_data: bytes


class BattleMap(BaseModel):
    uuid: UUID
    name: str
    map_set_uuid: UUID
    background: Optional[Background]
