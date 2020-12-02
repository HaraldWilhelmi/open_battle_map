from os.path import isfile
from pytest import fixture

from obm.common.dep_context import DepContext
from obm.data.config import Config
from obm.data.battle_map import Background
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory
from obm.model.map_set_cache import MapSetCache
from obm.model.map_set_manager import MapSetManager


@fixture
def ctx(tmpdir):
    ctx = DepContext()
    ctx.register(Config(admin_secret='bla', data_dir=str(tmpdir)))
    ctx.register(MapSetIO(ctx=ctx))
    ctx.register(MapSetCache(ctx=ctx))
    ctx.register(MapSetDirectory(ctx=ctx))
    ctx.register(MapSetManager(ctx=ctx))
    yield ctx


def test_simple(ctx: DepContext):
    map_set_io: MapSetIO = ctx.get(MapSetIO)
    map_set_cache: MapSetCache = ctx.get(MapSetCache)
    map_set_manager: MapSetManager = ctx.get(MapSetManager)

    assert map_set_io.get_map_set_uuid_to_name_mapping() == {}
    map_set = map_set_manager.create('Test1')
    assert map_set.name == 'Test1'

    map_set_file = map_set_io.get_map_set_path(map_set.uuid)
    assert isfile(map_set_file)

    battle_maps = map_set.get_battle_maps()
    assert len(battle_maps) == 1

    battle_map_file = map_set_io.get_battle_map_path(map_set.uuid, battle_maps[0].uuid)
    background_file = map_set_io.get_background_path(map_set.uuid, battle_maps[0].uuid)
    assert isfile(battle_map_file)
    assert not isfile(background_file)

    map_set.name = 'Changed1'
    battle_maps[0].name = 'Changed2'
    battle_maps[0].background = Background(media_type='nonsense', image_data=b'trash')
    map_set_manager.save(map_set)
    assert isfile(background_file)

    map_set_cache.delete(map_set)
    fresh_map_set = map_set_manager.get_by_uuid(map_set.uuid)
    assert fresh_map_set.name == 'Changed1'
    fresh_battle_maps = fresh_map_set.get_battle_maps()
    assert len(fresh_battle_maps) == 1
    assert fresh_battle_maps[0].name == 'Changed2'
    assert fresh_battle_maps[0].background.image_data == b'trash'

    map_set_manager.delete(fresh_map_set)
    assert not isfile(map_set_file)
    assert not isfile(battle_map_file)
    assert not isfile(background_file)
