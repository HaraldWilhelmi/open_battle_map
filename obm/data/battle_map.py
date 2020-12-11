from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class BattleMap(BaseModel):
    uuid: UUID
    name: str
    map_set_uuid: UUID
    background_revision: int = 0
    background_media_type: Optional[str]
    background_image_data: Optional[bytes]
