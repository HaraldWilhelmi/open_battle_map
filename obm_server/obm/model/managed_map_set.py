from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4

from obm.data.map_set import MapSet
from obm.model.managed_battle_map import ManagedBattleMap


class ManagedMapSet(MapSet):
    battle_maps: List[ManagedBattleMap] = []
    battle_maps_by_uuid: Dict[UUID, ManagedBattleMap] = {}
    last_access: Optional[datetime] = None
    saved_flag: bool = False

    def __init__(self, **data: Any):
        super().__init__(**data)
        self.battle_maps_by_uuid: Dict[UUID, ManagedBattleMap] = {
            battle_map.uuid: battle_map
            for battle_map in self.battle_maps
        }

    def touch(self, changed: bool = True):
        if changed:
            self.saved_flag = False
        self.last_access = datetime.now()

    def get_battle_maps(self) -> List[ManagedBattleMap]:
        return sorted(
            [x for x in self.battle_maps_by_uuid.values()],
            key=lambda x: x.name
        )

    def add_new_battle_map(self, name: str) -> ManagedBattleMap:
        battle_map = ManagedBattleMap(name=name, uuid=uuid4(), map_set=self)
        self.battle_maps_by_uuid[battle_map.uuid] = battle_map
        self.touch()
        return battle_map

    def delete_battle_map(self, battle_map: ManagedBattleMap) -> None:
        del self.battle_maps_by_uuid[battle_map.uuid]
        self.touch()

    def get_battle_map(self, uuid) -> ManagedBattleMap:
        return self.battle_maps_by_uuid[uuid]

    def get_clean_data(self):
        return  MapSet(**self.__dict__)
