from typing import Dict
from uuid import UUID
from fastapi import Depends, APIRouter, status
from pydantic import BaseModel, validator

from obm.common.dep_context import DepContext, get_context
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
        ctx: DepContext = Depends(get_context),
) -> MapSet:
    manager = ctx.get(MapSetManager)
    return manager.create(data.name)


class DeleteRequest(BaseModel):
    uuid: UUID


@router.delete('/', description='Deletes a map set permanently.')
async def delete_map_set(
        data: DeleteRequest,
        ctx: DepContext = Depends(get_context),
):
    manager = ctx.get(MapSetManager)
    map_set = manager.get_by_uuid(data.uuid)
    manager.delete(map_set)


class UpdateRequest(BaseModel):
    uuid: UUID
    name: str
    _check_name = validator('name', allow_reuse=True)(name_validator)


@router.post('/', description='Update map set.')
async def update_map_set(
        data: UpdateRequest,
        ctx: DepContext = Depends(get_context),
):
    manager = ctx.get(MapSetManager)
    map_set = manager.get_by_uuid(data.uuid)
    map_set.name = data.name
    map_set.touch()


@router.get('/list_all',
            description='List the existing map sets, mapping the UUID to the name, sorted by name.',
            response_model=Dict[UUID, str]
            )
async def list_all(
        ctx: DepContext = Depends(get_context)
):
    directory: MapSetDirectory = ctx.get(MapSetDirectory)
    return directory.get_uuid_to_name_mapping()
