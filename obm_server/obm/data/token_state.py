from enum import Enum
from uuid import UUID

from obm.data.common import Coordinate, ColorCombo


class TokenId(ColorCombo):
    token_type: int
    mark: str

    def get_lookup_key(self):
        return f"{self.token_type}/{self.color}/{self.mark}/{self.mark_color}"

    def is_same_token(self, other) -> bool:
        if isinstance(other, TokenId):
            return (
                self.token_type == other.token_type
                and self.color.as_hex() == other.color.as_hex()
                and self.mark == other.mark
                and self.mark_color.as_hex() == other.mark_color.as_hex()
            )
        else:
            return False


class TokenState(TokenId):
    position: Coordinate
    rotation: float


class TokenActionType(Enum):
    Added = 'added'
    Removed = 'removed'
    Moved = 'moved'


class TokenAction(TokenState):
    uuid: UUID
    action_type: TokenActionType
