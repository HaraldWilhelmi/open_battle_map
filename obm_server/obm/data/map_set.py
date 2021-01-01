from pydantic import BaseModel
from uuid import UUID


class MapSet(BaseModel):
    name: str
    uuid: UUID


class MapSetEntry(BaseModel):
    name: str
    uuid: UUID
