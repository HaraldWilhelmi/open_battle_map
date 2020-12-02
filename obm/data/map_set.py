from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import UUID
from datetime import datetime

from obm.data.battle_map import BattleMap


class MapSet(BaseModel):
    name: str
    uuid: UUID
    battle_maps_by_uuid: Dict[UUID, BattleMap] = {}
    last_access: Optional[datetime]
    saved_flag: bool = False

    def touch(self, changed: bool = True):
        if changed:
            self.saved_flag = False
        self.last_access = datetime.now()

    def get_battle_maps(self) -> List[BattleMap]:
        return sorted(
            [x for x in self.battle_maps_by_uuid.values()],
            key=lambda x: x.name
        )


class MapSetEntry(BaseModel):
    name: str
    uuid: UUID
