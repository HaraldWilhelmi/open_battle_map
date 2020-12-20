from fastapi import FastAPI

from obm.common.dep_context import get_context
from obm.data.config import get_config_for_production, get_config_file_name
from obm.fileio.map_set_paths import MapSetPaths
from obm.fileio.map_set_io import MapSetIO
from obm.fileio.backup_io import BackupIo
from obm.fileio.static_data import get_default_token
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager
from obm.model.magic_color_svg import MagicColorSvg

from obm.routers.map_set_list import router as map_set_list_router
from obm.routers.map_set import router as map_set_router
from obm.routers.battle_map import router as battle_map_router
from obm.routers.image_data import router as image_data_router
from obm.routers.token_image import router as token_image_router
from obm.routers.backup import router as backup_router


TAGS_META_DATA = [
    {
        'name': 'Map Set',
        'description':
            'A map set is a collection of battle maps, which share some settings '
            + 'and resources. The object itself only contains meta data used for '
            + 'administrative purposes. All modifying operations on map sets '
            + 'require the request to contain the Admin Secret in the '
            + 'X-OBM-Admin-Secret header. The Admin Secret is automatically '
            + 'generated on the first run of the application and can be found '
            + 'and changed in the configuration file '
            + get_config_file_name() + '.'
    },
    {
        'name': 'Map Set List',
        'description':
            'Access the complete list of all Map Sets hosted on the server. '
            + 'The single API call of ths group requires a Admin Secret like '
            + 'most of the normal Map Set operations. Look there for details.'
    },
    {
        'name': 'Battle Map',
        'description':
            'This calls help to administer Battle Baps of a given Map Set. '
            + 'A battle map may have a background image (the actual map) '
            + 'and a number of parameters, e.g. the scale of the map.'
    },
    {
        'name': 'Image Data',
        'description':
            'This calls allow to access the image data used as background image '
            + 'of a Battle Map.'
    },
    {
        'name': 'Token Image',
        'description': 'Grants access to token images. Usually SVGs are used (always? tbd).'
    },
    {
        'name': 'Backup',
        'description':
            'These operations allow to download and upload the complete data of '
            + 'a Map Set. The format of the data (.obm file) is a gzipped TAR file '
            + 'with mostly JSON and a few binary images inside. Basically the files '
            + 'look like the result of a "tar cfz <file name> ." command in the '
            + 'directory of the Map Set on the server.'
    },
]

ctx = get_context()
ctx.start()
ctx.register(get_config_for_production())

ctx.register(MapSetPaths())
ctx.register(MapSetIO())
ctx.register(BackupIo())
ctx.register(MapSetCache())
ctx.register(MapSetDirectory())
ctx.register(MapSetManager())
ctx.register(MagicColorSvg())

magic_color_svg: MagicColorSvg = ctx.get(MagicColorSvg)
magic_color_svg.register_svg('global/default_token', get_default_token())

app = FastAPI(openapi_tags=TAGS_META_DATA)
app.include_router(map_set_list_router, prefix='/api/map_set_list', tags=['Map Set List'])
app.include_router(map_set_router, prefix='/api/map_set', tags=['Map Set'])
app.include_router(battle_map_router, prefix='/api/battle_map', tags=['Battle Map'])
app.include_router(image_data_router, prefix='/api/image_data', tags=['Image Data'])
app.include_router(token_image_router, prefix='/api/token_image', tags=['Token Image'])
app.include_router(backup_router, prefix='/api/backup', tags=['Backup'])
