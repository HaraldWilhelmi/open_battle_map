from typing import List
from uuid import UUID
from fastapi import Depends, APIRouter, status
from pydantic import BaseModel, validator

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
            'description': 'Wrong admin token was sent.'
        },
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            'description': 'No admin secret was found in the configuration - so admin access is disabled.'
        },
    }
)


class CreateRequest(BaseModel):
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.put('/',
            status_code=status.HTTP_201_CREATED,
            description='Creates a new map set.',
            response_model=MapSet,
            response_model_include={'name', 'uuid'}
            )
async def create_map_set(
        data: CreateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
) -> MapSet:
    return manager.create(data.name)


class DeleteRequest(BaseModel):
    uuid: UUID


@router.delete('/', description='Deletes a map set permanently.')
async def delete_map_set(
        data: DeleteRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = manager.get_by_uuid(data.uuid)
    manager.delete(map_set)


class UpdateRequest(BaseModel):
    uuid: UUID
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update map set.')
async def update_map_set(
        data: UpdateRequest,
        manager: MapSetManager = Depends(get_map_set_manager),
):
    map_set = manager.get_by_uuid(data.uuid)
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
