from fastapi import FastAPI

from obm.common.dep_context import get_context
from obm.data.config import get_config_for_production, get_config_file_name
from obm.fileio.map_set_paths import MapSetPaths
from obm.fileio.token_set_io import TokenSetIO
from obm.fileio.map_set_io import MapSetIO
from obm.fileio.backup_io import BackupIo
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager
from obm.model.magic_color_svg import MagicColorSvg

from obm.routers.map_set_list import router as map_set_list_router
from obm.routers.map_set import router as map_set_router
from obm.routers.battle_map import router as battle_map_router
from obm.routers.image_data import router as image_data_router
from obm.routers.token import router as token_router
from obm.routers.token_image import router as token_image_router
from obm.routers.backup import router as backup_router


TAGS_META_DATA = [
    {
        'name': 'Background Set',
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
        'name': 'Background Set List',
        'description':
            'Access the complete list of all Background Sets hosted on the server. '
            + 'The single API call of ths group requires a Admin Secret like '
            + 'most of the normal Background Set operations. Look there for details.'
    },
    {
        'name': 'Battle Background',
        'description':
            'This calls help to administer Battle Baps of a given Background Set. '
            + 'A battle map may have a background image (the actual map) '
            + 'and a number of parameters, e.g. the scale of the map.'
    },
    {
        'name': 'Image Data',
        'description':
            'This calls allow to access the image data used as background image '
            + 'of a Battle Background.'
    },
    {
        'name': 'Token',
        'description':
            'The Token service grants access to the Tokens on a Battle Map and their actions.'
    },
    {
        'name': 'Backup',
        'description':
            'These operations allow to download and upload the complete data of '
            + 'a Background Set. The format of the data (.obm file) is a gzipped TAR file '
            + 'with mostly JSON and a few binary images inside. Basically the files '
            + 'look like the result of a "tar cfz <file name> ." command in the '
            + 'directory of the Background Set on the server.'
    },
]

ctx = get_context()
ctx.start()
ctx.register(get_config_for_production())

ctx.register(MapSetPaths())
ctx.register(TokenSetIO())
ctx.register(MapSetIO())
ctx.register(BackupIo())

ctx.register(MapSetCache())
ctx.register(MapSetDirectory())
ctx.register(MapSetManager())
ctx.register(MagicColorSvg())

app = FastAPI(openapi_tags=TAGS_META_DATA)
app.include_router(map_set_list_router, prefix='/api/map_set_list', tags=['Background Set List'])
app.include_router(map_set_router, prefix='/api/map_set', tags=['Background Set'])
app.include_router(battle_map_router, prefix='/api/battle_map', tags=['Battle Background'])
app.include_router(image_data_router, prefix='/api/image_data', tags=['Image Data'])
app.include_router(token_router, prefix='/api/token', tags=['Token'])
app.include_router(token_image_router, prefix='/api/token_image', tags=['Token Image'])
app.include_router(backup_router, prefix='/api/backup', tags=['Backup'])
