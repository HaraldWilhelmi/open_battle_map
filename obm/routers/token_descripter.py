from typing import List
from fastapi import Depends, APIRouter

from obm.data.token_descriptor import TokenDescriptor
from obm.model.token_set_manager import TokenSetManager
from obm.dependencies import get_token_set_manager


router = APIRouter()


@router.get('/default/',
            description='Get the default token descriptors shared by all Map Sets',
            )
def get_default_token_descriptors(
        token_set_manager: TokenSetManager = Depends(get_token_set_manager)
) -> List[TokenDescriptor]:
    return token_set_manager.get_default_token_set()
