from typing import Optional, List, Dict, Any
from uuid import UUID

from obm.data.battle_map import BattleMap
from obm.data.map_set import MapSet
from obm.data.token_state import TokenState, TokenAction, TokenActionType

_MAX_TOKEN_LOGS = 100


class IllegalMove(Exception):
    pass


class LogsExpired(Exception):
    pass


class ManagedBattleMap(BattleMap):
    map_set: MapSet
    background_image: Optional[bytes] = None
    log_offset: int = 0
    logs: List[TokenAction] = []
    logs_by_uuid: Dict[UUID, TokenAction] = {}
    tokens_by_id_str: Dict[str, TokenState] = {}

    def __init__(self, **data: Any):
        super().__init__(**data)
        self.tokens_by_id_str: Dict[str, TokenState] = {
            token.get_lookup_key(): token
            for token in self.tokens
        }
        self.log_offset = self.token_log_count + 1

    def process_action(self, action: TokenAction) -> None:
        action_type = action.action_type
        if action.uuid in self.logs_by_uuid:
            raise IllegalMove(f"Move with UUID {action.uuid} is logged already!")
        if action_type == TokenActionType.Added:
            self._add_token(action)
        elif action_type == TokenActionType.Removed:
            self._remove_token(action)
        else:
            self._move_token(action)
        self.token_log_count += 1

    def _add_token(self, action: TokenAction) -> None:
        new_token = TokenState(**action.__dict__)
        key = new_token.get_lookup_key()
        if key in self.tokens_by_id_str:
            raise IllegalMove(f"Token '{new_token.get_lookup_key()}' exists already!")
        self.tokens.append(new_token)
        self.tokens_by_id_str[key] = new_token
        self._do_house_keeping(action)

    def _do_house_keeping(self, action: TokenAction) -> None:
        self.logs.append(action)
        self.logs_by_uuid[action.uuid] = action
        while len(self.logs) > _MAX_TOKEN_LOGS:
            expired_log = self.logs.pop(0)
            del self.logs_by_uuid[expired_log.uuid]
            self.log_offset += 1

    def _remove_token(self, action: TokenAction) -> None:
        key = action.get_lookup_key()
        if key not in self.tokens_by_id_str:
            raise IllegalMove(f"Trying to remove unknown token '{key}!")
        del self.tokens_by_id_str[key]
        for index, token in enumerate(self.tokens):
            if action.is_same_token(token):
                del self.tokens[index]
        self._do_house_keeping(action)

    def _move_token(self, action: TokenAction) -> None:
        key = action.get_lookup_key()
        if key not in self.tokens_by_id_str:
            raise IllegalMove(f"Trying to move unknown token '{key}!")
        self.tokens_by_id_str[key].position = action.position
        self._do_house_keeping(action)

    def get_history(self, since: int) -> List[TokenAction]:
        if since < self.log_offset - 1:
            raise LogsExpired('Requested data to old.')
        first_index = since + 1 - self.log_offset
        return self.logs[first_index:]

    def get_background_image(self) -> Optional[bytes]:
        return self.background_image

    def set_background_image(self, image_data: bytes, media_type: str) -> None:
        self.background_image = image_data
        self.background_media_type = media_type

    def get_clean_data(self):
        return BattleMap(**self.__dict__)
