from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, status
from pydantic import BaseModel, validator

from obm.common.api_tools import RESPONSE_MAP_SET_NOT_FOUND, get_map_set
from obm.dependencies import get_map_set_manager, get_map_set_directory
from obm.common.validators import name_validator
from obm.data.map_set import MapSet
from obm.model.admin import check_admin_secret
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_manager import MapSetManager

router = APIRouter(
    dependencies=[Depends(check_admin_secret)],
    responses={
        status.HTTP_401_UNAUTHORIZED: {
            'description': 'Wrong admin secret token was sent.'
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            'description': 'No admin secret was found in the configuration - so admin access is disabled.'
        },
    }
)


class MapSetCreateRequest(BaseModel):
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.put('/',
            status_code=status.HTTP_201_CREATED,
            description='Creates a new map set.',
            response_model=MapSet,
            response_model_include={'name', 'uuid'}
            )
async def create_map_set(
        data: MapSetCreateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> MapSet:
    return manager.create(data.name)


class MapSetDeleteRequest(BaseModel):
    uuid: UUID


@router.delete('/', description='Deletes a map set permanently.',
               responses=RESPONSE_MAP_SET_NOT_FOUND
               )
async def delete_map_set(
        data: MapSetDeleteRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = get_map_set(manager, data.uuid)
    manager.delete(map_set)


class MapSetUpdateRequest(BaseModel):
    uuid: UUID
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update map set.',
             responses=RESPONSE_MAP_SET_NOT_FOUND
             )
async def update_map_set(
        data: MapSetUpdateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = get_map_set(manager, data.uuid)
    map_set.name = data.name
    manager.save(map_set)


class MapSetItem(BaseModel):
    uuid: UUID
    name: str


@router.get('/list_all',
            description='List the existing map sets, mapping the UUID to the name, sorted by name.',
            response_model=List[MapSetItem]
            )
async def list_all(
        directory: MapSetDirectory = Depends(get_map_set_directory)
):
    return [
        MapSetItem(uuid=uuid, name=name)
        for uuid, name in directory.get_uuid_to_name_mapping().items()
    ]
