from pytest import fixture
from pytest_mock import MockerFixture
from uuid import UUID

from obm.data.config import Config
from obm.data.map_set import MapSet
from obm.fileio.map_set_io import MapSetIO
from obm.model.map_set_directory import MapSetDirectory


@fixture
def uuids():
    yield [
        UUID('cc24fb89-318d-4912-884d-6a7213a562a2'),
        UUID('356dadfd-7c8f-47c6-9b3e-e146a841ad8d'),
        UUID('b213e5a6-2b6e-41c6-b120-e941711b2ca4'),
        UUID('b069895f-6aa9-4b34-93e1-68c1f07cc880'),
        UUID('5fd0ed18-9a2b-4909-8a2d-3e088629be42'),
    ]


@fixture
def map_set_directory(mocker: MockerFixture, uuids):
    config = Config(admin_secret='bla')
    map_set_io = MapSetIO(config=config)
    mocker.patch.object(
        map_set_io,
        'get_map_set_uuid_to_name_mapping',
        return_value={
            uuids[0]: 'c',
            uuids[1]: 'b',
            uuids[2]: 'y',
            uuids[3]: 'a',
            uuids[4]: 'x',
        }
    )
    map_set_directory = MapSetDirectory(map_set_io=map_set_io)
    yield map_set_directory


def test_simple_init(map_set_directory: MapSetDirectory, uuids):
    result = map_set_directory.get_uuid_to_name_mapping()
    assert result == {
        uuids[3]: 'a',
        uuids[1]: 'b',
        uuids[0]: 'c',
        uuids[4]: 'x',
        uuids[2]: 'y',
    }


def test_add(map_set_directory: MapSetDirectory, uuids):
    map_set = MapSet(
        name='k',
        uuid=UUID('3e8dbd20-7659-4c29-8309-2e9289496c22')
    )
    map_set_directory.add(map_set)
    result = map_set_directory.get_uuid_to_name_mapping()
    assert result == {
        uuids[3]: 'a',
        uuids[1]: 'b',
        uuids[0]: 'c',
        map_set.uuid: 'k',
        uuids[4]: 'x',
        uuids[2]: 'y',
    }


def test_remove(map_set_directory: MapSetDirectory, uuids):
    map_set = MapSet(
        name='c',
        uuid=uuids[0]
    )
    map_set_directory.remove(map_set)
    result = map_set_directory.get_uuid_to_name_mapping()
    assert result == {
        uuids[3]: 'a',
        uuids[1]: 'b',
        uuids[4]: 'x',
        uuids[2]: 'y',
    }
