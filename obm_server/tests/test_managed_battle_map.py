from pydantic.color import Color
from pytest import fixture, raises
from uuid import UUID, uuid4

from obm.data.common import Coordinate
from obm.data.map_set import MapSet
from obm.data.token_state import TokenAction, TokenActionType
from obm.model.managed_battle_map import ManagedBattleMap, LogsExpired, IllegalMove


@fixture
def battle_map() -> ManagedBattleMap:
    map_set = MapSet(name='Test', uuid=uuid4())
    yield ManagedBattleMap(
        uuid=UUID('cc24fb89-318d-4912-884d-6a7213a562a2'),
        name='Test',
        map_set=map_set
    )


def get_test_move(data=None):
    if data is None:
        data = {}
    raw_data = {
        'action_type': TokenActionType.Added,
        'uuid': uuid4(),
        'token_type': 17, 'color': Color('Black'),
        'mark': '23', 'mark_color': Color('White'),
        'position': Coordinate(x=27, y=13),
        'rotation': 2.3,
        **data
    }
    return TokenAction(**raw_data)


def test_trivial(battle_map: ManagedBattleMap):
    assert len(battle_map.get_history(0)) == 0
    assert battle_map.action_count == 0
    assert len(battle_map.tokens) == 0


def test_simple(battle_map: ManagedBattleMap):
    move = get_test_move()

    battle_map.process_token_action(move)

    assert battle_map.action_count == 1
    assert len(battle_map.tokens) == 1
    assert battle_map.tokens[0].mark == '23'

    history = battle_map.get_history(0)
    assert len(history) == 1
    assert history[0].uuid == move.uuid

    assert len(battle_map.get_history(1)) == 0


def test_overflow(battle_map: ManagedBattleMap):
    test_moves = []
    for i in range(120):
        move = get_test_move({'mark': str(i)})
        battle_map.process_token_action(move)
        test_moves.append(move)

    assert battle_map.action_count == 120
    assert len(battle_map.tokens) == 120

    history = battle_map.get_history(20)
    assert len(history) == 100
    assert history[50].mark == '70'
    assert history[50].uuid == test_moves[70].uuid

    with raises(LogsExpired):
        battle_map.get_history(19)


def test_move(battle_map: ManagedBattleMap):
    add = get_test_move()

    battle_map.process_token_action(add)

    move = get_test_move({
        'action_type': TokenActionType.Moved,
        'position': Coordinate(x=100, y=45)
    })
    battle_map.process_token_action(move)

    assert battle_map.tokens[0].position.x == 100
    assert battle_map.tokens[0].position.y == 45

    history = battle_map.get_history(0)
    assert len(history) == 2
    assert history[1].uuid == move.uuid
    assert history[1].action_type == TokenActionType.Moved


def test_remove(battle_map: ManagedBattleMap):
    add = get_test_move()

    battle_map.process_token_action(add)

    remove = get_test_move({'action_type': TokenActionType.Removed})
    battle_map.process_token_action(remove)

    assert len(battle_map.tokens) == 0

    history = battle_map.get_history(0)
    assert len(history) == 2
    assert history[1].uuid == remove.uuid
    assert history[1].action_type == TokenActionType.Removed


def test_duplicated_move(battle_map: ManagedBattleMap):
    move = get_test_move()

    battle_map.process_token_action(move)
    move.action_type = TokenActionType.Moved
    with raises(IllegalMove):
        battle_map.process_token_action(move)


def test_illegal_add(battle_map: ManagedBattleMap):
    battle_map.process_token_action(get_test_move())
    with raises(IllegalMove):
        battle_map.process_token_action(get_test_move())


def test_illegal_move(battle_map: ManagedBattleMap):
    battle_map.process_token_action(get_test_move())
    with raises(IllegalMove):
        battle_map.process_token_action(get_test_move({'action_type': TokenActionType.Moved, 'mark': '7'}))


def test_illegal_remove(battle_map: ManagedBattleMap):
    battle_map.process_token_action(get_test_move())
    with raises(IllegalMove):
        battle_map.process_token_action(get_test_move({'action_type': TokenActionType.Removed, 'mark': '7'}))
