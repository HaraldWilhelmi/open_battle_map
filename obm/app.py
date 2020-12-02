from fastapi import FastAPI

from obm.common.dep_context import get_context
from obm.data.config import get_config_for_production, get_config_file_name
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager

from obm.routers.map_set import router as map_set_router


TAGS_META_DATA = [
    {
        'name': 'Map Set',
        'description':
            'The Map Set operations are meant to be used by the administrator. '
            + 'A map set is a collection of battle maps, which share a set '
            + 'of custom tokens to be used with them. All operations on map sets '
            + 'require the request to contain the admin secret in the '
            + 'X-OBM-Admin-Secret header. The admin secret is automatically '
            + 'generated on the first run of the application and can be found '
            + 'and changed in the configuration file '
            + get_config_file_name() + '.'
    },
]

ctx = get_context()
ctx.start()
ctx.register(get_config_for_production())

ctx.register(MapSetIO())
ctx.register(MapSetCache())
ctx.register(MapSetDirectory())
ctx.register(MapSetManager())


app = FastAPI(openapi_tags=TAGS_META_DATA)
app.include_router(map_set_router, prefix='/map_set', tags=['Map Set'])
