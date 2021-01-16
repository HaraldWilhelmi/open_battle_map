from enum import Enum
from typing import List, Union
from pydantic import BaseModel

from obm.data.token_state import TokenAction
from obm.data.pointer import PointerAction


class ActionType(Enum):
    Token = 0
    Pointer = 1


class Action(BaseModel):
    type: ActionType
    payload: Union[TokenAction, PointerAction]
