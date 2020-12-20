from typing import List
from uuid import UUID

from fastapi import Depends, APIRouter
from pydantic import BaseModel

from obm.model.admin import check_admin_secret
from obm.dependencies import get_map_set_directory
from obm.model.map_set_directory import MapSetDirectory


router = APIRouter()


class MapSetItem(BaseModel):
    uuid: UUID
    name: str


@router.get('/',
            description='List the existing map sets, mapping the UUID to the name, sorted by name.',
            response_model=List[MapSetItem]
            )
async def list_all(
        directory: MapSetDirectory = Depends(get_map_set_directory),
        _: None = Depends(check_admin_secret)
):
    return [
        MapSetItem(uuid=uuid, name=name)
        for uuid, name in directory.get_uuid_to_name_mapping().items()
    ]
