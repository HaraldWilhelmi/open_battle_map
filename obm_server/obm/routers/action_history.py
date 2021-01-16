from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, status, HTTPException, Response
from pydantic import BaseModel

from obm.common.api_tools import RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND, get_battle_map
from obm.data.token_state import TokenAction, TokenState
from obm.data.pointer import PointerAction
from obm.data.action import Action, ActionType
from obm.dependencies import get_map_set_manager
from obm.model.managed_battle_map import IllegalMove, LogsExpired
from obm.model.map_set_manager import MapSetManager

router = APIRouter()


class TokenActionPut(TokenAction):
    map_set_uuid: UUID
    battle_map_uuid: UUID


RESPONSE_ILLEGAL_MOVE = {
    status.HTTP_409_CONFLICT: {
        'description': 'The Token Action sent makes no sense (e.g. a token was added, which is already on the map).'
    }
}


@router.put('/log_token_action',
            status_code=status.HTTP_201_CREATED,
            description='Log a Token Action.',
            responses={
                **RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
                **RESPONSE_ILLEGAL_MOVE,
            },
            )
async def put_token_action(
        data: TokenActionPut,
        manager: MapSetManager = Depends(get_map_set_manager)
) -> None:
    battle_map = get_battle_map(manager, data.map_set_uuid, data.battle_map_uuid)
    try:
        battle_map.process_token_action(data)
        manager.save_battle_map(battle_map)
    except IllegalMove as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e))


class PointerActionPut(PointerAction):
    map_set_uuid: UUID
    battle_map_uuid: UUID


@router.put('/log_pointer_action',
            status_code=status.HTTP_201_CREATED,
            description='Log a Pointer move.',
            responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
            )
async def put_pointer_action(
        data: PointerActionPut,
        manager: MapSetManager = Depends(get_map_set_manager)
) -> None:
    battle_map = get_battle_map(manager, data.map_set_uuid, data.battle_map_uuid)
    battle_map.process_pointer_action(data)


class AllTokenStatesResponse(BaseModel):
    next_action_index: int
    tokens: List[TokenState]


@router.get('/all_tokens/{map_set_uuid}/{battle_map_uuid}',
            description='Get the present state of all tokens on the map.',
            responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
            response_model=AllTokenStatesResponse,
            )
def get_all_token_states(
        map_set_uuid: UUID, battle_map_uuid: UUID,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> AllTokenStatesResponse:
    battle_map = get_battle_map(manager, map_set_uuid, battle_map_uuid)
    return AllTokenStatesResponse(
        next_action_index=battle_map.action_count,
        tokens=battle_map.tokens,
    )


class HistoryResponse(BaseModel):
    map_set_uuid: UUID
    uuid: UUID
    last_action_index: int
    battle_map_revision: int
    token_actions: List[TokenAction]
    pointer_actions: List[PointerAction]


RESPONSE_LOGS_EXPIRED = {
    status.HTTP_410_GONE: {
        'description': "The parameter 'since' requests log entries, which were already deleted."
    }
}


@router.get('/log/{map_set_uuid}/{battle_map_uuid}/{since}',
            description='Get all Actions starting with the given sequence number.',
            responses=RESPONSE_MAP_SET_OR_BATTLE_MAP_NOT_FOUND,
            response_model=HistoryResponse,
            )
async def get_history(
        map_set_uuid: UUID, battle_map_uuid: UUID, since: int,
        response: Response,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    battle_map = get_battle_map(manager, map_set_uuid, battle_map_uuid)
    try:
        actions = await battle_map.wait_for_history_update(since)
        token_actions, pointer_actions = _split_actions(actions)
    except LogsExpired as e:
        raise HTTPException(status.HTTP_410_GONE, str(e))
    response.headers['Cache-Control'] = 'no-cache'
    return HistoryResponse(
        map_set_uuid=battle_map.map_set.uuid,
        uuid=battle_map.uuid,
        last_action_index=battle_map.action_count - 1,
        battle_map_revision=battle_map.revision,
        token_actions=token_actions,
        pointer_actions=pointer_actions,
    )


def _split_actions(actions: List[Action]) -> (List[TokenAction], List[PointerAction]):
    token_actions = []
    pointer_actions = []

    for action in actions:
        if action.type == ActionType.Token:
            token_actions.append(action.payload)
        else:
            pointer_actions.append(action.payload)

    return token_actions, pointer_actions
