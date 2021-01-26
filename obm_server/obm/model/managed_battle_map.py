from asyncio import Task
from random import randrange
from typing import Optional, List, Dict, Any
from uuid import UUID
import asyncio

from obm.data.action import Action, ActionType
from obm.data.battle_map import BattleMap
from obm.data.map_set import MapSet
from obm.data.pointer import PointerAction
from obm.data.token_state import TokenState, TokenAction, TokenActionType

_MAX_LOGS = 300
_MAX_HISTORY_WAIT_SECONDS = 30


class IllegalMove(Exception):
    pass


class LogsExpired(Exception):
    pass


class ManagedBattleMap(BattleMap):
    map_set: MapSet
    background_image: Optional[bytes] = None
    log_offset: int = 0
    logs: List[Action] = []
    token_actions_by_uuid: Dict[UUID, TokenAction] = {}
    tokens_by_id_str: Dict[str, TokenState] = {}
    _all_update_waiters: List[Task] = []

    def __init__(self, **data: Any) -> object:
        super().__init__(**data)
        self.tokens_by_id_str: Dict[str, TokenState] = {
            token.get_lookup_key(): token
            for token in self.tokens
        }
        self._reset_logs()

    def _reset_logs(self):
        self.logs = []
        self.token_actions_by_uuid = {}
        self.log_offset = self.action_count

    def process_token_action(self, token_action: TokenAction) -> None:
        action_type = token_action.action_type
        if token_action.uuid in self.token_actions_by_uuid:
            raise IllegalMove(f"Move with UUID {token_action.uuid} is logged already!")
        if action_type == TokenActionType.Added:
            self._add_token(token_action)
        elif action_type == TokenActionType.Removed:
            self._remove_token(token_action)
        else:
            self._move_token(token_action)
        self._do_house_keeping(Action(type=ActionType.Token, payload=token_action))

    def _add_token(self, action: TokenAction) -> None:
        new_token = TokenState(**action.__dict__)
        key = new_token.get_lookup_key()
        if key in self.tokens_by_id_str:
            raise IllegalMove(f"Token '{new_token.get_lookup_key()}' exists already!")
        self.tokens.append(new_token)
        self.tokens_by_id_str[key] = new_token

    def _do_house_keeping(self, action: Action) -> None:
        if action.type == ActionType.Token:
            self.token_actions_by_uuid[action.payload.uuid] = action.payload
        self.logs.append(action)
        while len(self.logs) > _MAX_LOGS:
            expired_log = self.logs.pop(0)
            if expired_log.type == ActionType.Token:
                del self.token_actions_by_uuid[expired_log.payload.uuid]
            self.log_offset += 1
        self.action_count += 1
        self._release_waiters()

    def _remove_token(self, action: TokenAction) -> None:
        key = action.get_lookup_key()
        if key not in self.tokens_by_id_str:
            raise IllegalMove(f"Trying to remove unknown token '{key}!")
        del self.tokens_by_id_str[key]
        for index, token in enumerate(self.tokens):
            if action.is_same_token(token):
                del self.tokens[index]

    def _move_token(self, action: TokenAction) -> None:
        key = action.get_lookup_key()
        if key not in self.tokens_by_id_str:
            raise IllegalMove(f"Trying to move unknown token '{key}!")
        new_token = TokenState(**action.__dict__)
        for index, token in enumerate(self.tokens):
            if action.is_same_token(token):
                self.tokens[index] = new_token
        self.tokens_by_id_str[key] = new_token

    def process_pointer_action(self, pointer_action: PointerAction) -> None:
        action = Action(type=ActionType.Pointer, payload=pointer_action)
        self._do_house_keeping(action)

    def get_history(self, since: int) -> List[Action]:
        if since < self.log_offset:
            raise LogsExpired('Requested data to old.')
        first_index = since - self.log_offset
        return self.logs[first_index:]

    @staticmethod
    async def _history_waiting():
        try:
            await asyncio.sleep(_MAX_HISTORY_WAIT_SECONDS)
        except asyncio.CancelledError:
            pass

    async def wait_for_history_update(self, since: int) -> List[Action]:
        updates = self.get_history(since)
        if len(updates) > 0:
            return updates

        try:
            waiter = asyncio.create_task(
                self._history_waiting()
            )
            self._all_update_waiters.append(waiter)
            await waiter
        finally:
            return self.get_history(since)

    def _release_waiters(self):
        for waiter in self._all_update_waiters:
            waiter.cancel()

    def get_background_image(self) -> Optional[bytes]:
        return self.background_image

    def set_background_image(self, image_data: bytes, media_type: str) -> None:
        self.background_image = image_data
        self.background_media_type = media_type

    def sanitize_token_positions(self, width, height):
        for token in self.tokens:
            if token.position.x > width or token.position.y > height:
                token.position.x = int(0.8 * width) + randrange(int(0.2 * width))
                token.position.y = int(0.8 * height) + randrange(int(0.2 * height))
        self._reset_logs()

    def get_clean_data(self):
        return BattleMap(**self.__dict__)

    def signal_update(self):
        self.revision += 1
        self._release_waiters()
