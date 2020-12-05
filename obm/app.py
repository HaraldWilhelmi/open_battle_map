from fastapi import FastAPI

from obm.common.dep_context import get_context
from obm.data.config import get_config_for_production, get_config_file_name
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager

from obm.routers.admin_map_set import router as admin_map_set_router
from obm.routers.map_set import router as map_set_router
from obm.routers.redirect import router as redirect_router
from obm.routers.battle_map import router as battle_map_router


TAGS_META_DATA = [
    {
        'name': 'Admin Map Set',
        'description':
            'These Map Set operations are meant to be used by the administrator. '
            + 'A map set is a collection of battle maps, which share a set '
            + 'of custom tokens to be used with them. All operations on map sets '
            + 'require the request to contain the admin secret in the '
            + 'X-OBM-Admin-Secret header. The admin secret is automatically '
            + 'generated on the first run of the application and can be found '
            + 'and changed in the configuration file '
            + get_config_file_name() + '.'
    },
    {
        'name': 'Map Set',
        'description':
            'Map Set operations for users. Please note that most operations are '
            + 'for administrators only.'
    },
    {
        'name': 'Battle Map',
        'description':
            'This calls help to administer Battle Baps of a given Map Set. '
            + 'A battle map may have a background image (the actual map) '
            + 'and a number of parameters, e.g. the scale of the map.'
    },
    {
        'name': 'Redirects',
        'description':
            'A few redirects simply the use of the application. They are mostly '
            'useful to set some cookies for new users.'
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
app.include_router(admin_map_set_router, prefix='/map_set', tags=['Admin Map Set'])
app.include_router(map_set_router, prefix='/map_set', tags=['Map Set'])
app.include_router(battle_map_router, prefix='/battle_map', tags=['Battle Map'])
app.include_router(redirect_router, tags=['Redirects'])
