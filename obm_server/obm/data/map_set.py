from typing import Optional, List

from pydantic import BaseModel
from uuid import UUID

from obm.data.token_descriptor import TokenDescriptor


class MapSet(BaseModel):
    name: str
    uuid: UUID


class MapSetEntry(BaseModel):
    name: str
    uuid: UUID
