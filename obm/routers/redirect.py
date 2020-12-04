from typing import Optional, Set
from uuid import UUID
from fastapi import Depends, APIRouter, Cookie, status, HTTPException
from fastapi.responses import RedirectResponse

from obm.model.map_set_directory import MapSetDirectory
from obm.dependencies import get_map_set_directory

router = APIRouter()


@router.get('/admin',
            description='Enters admin mode by setting the OMB-Mode cookie to Admin and redirects to main page.'
            )
def admin():
    response = RedirectResponse('/')
    response.set_cookie(key='OBM-Mode', value='Admin')
    return response


@router.get('/goto/{map_set_uuid}',
            description='Goes to the Map Set given by the UUID by setting the the cookies '
            + 'OBM-Mode to User, OBM-Selected-Map-Set to the UUID. The OBM-Known-Map-Sets '
            + 'cookie is also updated if the Map Set is not already present or if it '
            + 'contains unknown (=deleted) Map Sets.',
            responses={
                status.HTTP_404_NOT_FOUND: {
                    'description': 'The UUID given for the Map Set is unknown.'
                }
            }
            )
def goto(
        map_set_uuid: UUID,
        obm_known_map_sets: Optional[str] = Cookie(None),
        map_set_directory: MapSetDirectory = Depends(get_map_set_directory)
):
    existing_map_sets = _get_existing_map_sets(map_set_directory)
    if map_set_uuid not in existing_map_sets:
        raise HTTPException(status.HTTP_404_NOT_FOUND, 'The Map Set does not exist - please check your URL.')

    response = RedirectResponse('/')
    response.set_cookie(key='OBM-Mode', value='User')
    response.set_cookie(key='OBM-Selected-Map-Set', value=str(map_set_uuid))

    new_known_map_sets_cookie = _calculate_new_known_map_sets_cookie(
        map_set_uuid, obm_known_map_sets, existing_map_sets
    )
    if new_known_map_sets_cookie is not None:
        response.set_cookie(key='OBM-Known-Map-Sets', value=new_known_map_sets_cookie)
    return response


def _get_existing_map_sets(map_set_directory) -> Set[UUID]:
    return set(
        [x for x in map_set_directory.get_uuid_to_name_mapping()]
    )


def _calculate_new_known_map_sets_cookie(
        map_set_uuid: UUID,
        obm_known_map_sets: str,
        existing_map_sets: Set[UUID]
) -> Optional[str]:
    if obm_known_map_sets is None:
        old_known_map_sets = set()
    else:
        old_known_map_sets = set(obm_known_map_sets.split(','))

    new_known_map_sets = (old_known_map_sets & existing_map_sets) | {map_set_uuid}

    if new_known_map_sets != old_known_map_sets:
        return ','.join(new_known_map_sets)
    else:
        return None
