from os.path import isfile
from pydantic.color import Color
from uuid import uuid4
from pytest import fixture

from obm.common.dep_context import DepContext
from obm.data.common import Coordinate
from obm.data.config import Config
from obm.data.token_state import TokenAction, TokenActionType
from obm.fileio.map_set_paths import MapSetPaths
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager


SOME_SVG = b"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
	version="1.1" baseProfile="full"
	width="30px" height="20px" viewBox="0 0 29 19"
>
    <circle cx="15" cy="10" r="7" fill="black"/>
</svg>
"""


@fixture
def ctx(tmpdir):
    ctx = DepContext()
    ctx.register(Config(admin_secret='bla', data_dir=str(tmpdir)))
    ctx.register(MapSetPaths(ctx=ctx))
    ctx.register(MapSetIO(ctx=ctx))
    ctx.register(MapSetCache(ctx=ctx))
    ctx.register(MapSetDirectory(ctx=ctx))
    ctx.register(MapSetManager(ctx=ctx))
    yield ctx


def test_simple(ctx: DepContext):
    map_set_paths: MapSetPaths = ctx.get(MapSetPaths)
    map_set_io: MapSetIO = ctx.get(MapSetIO)
    map_set_cache: MapSetCache = ctx.get(MapSetCache)
    map_set_manager: MapSetManager = ctx.get(MapSetManager)

    assert map_set_io.get_map_set_uuid_to_name_mapping() == {}
    map_set = map_set_manager.create('Test1')
    assert map_set.name == 'Test1'

    map_set_file = map_set_paths.get_map_set_path(map_set.uuid)
    assert isfile(map_set_file)

    battle_maps = map_set.get_battle_maps()
    assert len(battle_maps) == 1

    battle_map_file = map_set_paths.get_battle_map_path(map_set.uuid, battle_maps[0].uuid)
    background_file = map_set_paths.get_background_path(map_set.uuid, battle_maps[0].uuid)
    assert isfile(battle_map_file)
    assert not isfile(background_file)

    map_set.name = 'Changed1'
    battle_maps[0].name = 'Changed2'
    battle_maps[0].set_background_image(media_type='image/svg+xml', image_data=SOME_SVG)
    battle_maps[0].process_action(
        TokenAction(
            action_type=TokenActionType.Added,
            uuid=uuid4(),
            token_type=0, color=Color('Black'), mark='23', mark_color=Color('White'),
            position=Coordinate(x=17, y=27),
            rotation=1.2
        )
    )
    map_set_manager.save(map_set)
    assert isfile(background_file)

    map_set_cache.delete(map_set)
    fresh_map_set = map_set_manager.get_by_uuid(map_set.uuid)
    assert fresh_map_set.name == 'Changed1'
    fresh_battle_maps = fresh_map_set.get_battle_maps()
    assert len(fresh_battle_maps) == 1
    assert fresh_battle_maps[0].name == 'Changed2'
    assert fresh_battle_maps[0].get_background_image() == SOME_SVG
    assert len(fresh_battle_maps[0].tokens)
    assert fresh_battle_maps[0].tokens[0].mark == '23'

    map_set_manager.delete(fresh_map_set)
    assert not isfile(map_set_file)
    assert not isfile(battle_map_file)
    assert not isfile(background_file)
