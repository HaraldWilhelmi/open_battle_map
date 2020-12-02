from pytest import fixture, raises
from obm.common.dep_context import DepContext, reset_context, get_context, InitializationError


@fixture(autouse=True)
def reset_dependencies():
    reset_context()
    yield
    reset_context()


def test_dependency():
    class TestA:
        def __init__(self, message='foo'):
            self._message = message

        def do_something(self):
            return self._message

    class TestB:
        def __init__(self, message='bar', ctx: DepContext = get_context()):
            self._message = message
            self._test_a = ctx.get(TestA)

        def do_something(self):
            return self._test_a.do_something() + self._message

    global_ctx = get_context()
    global_ctx.start()
    global_ctx.register(TestA('abc'))
    global_ctx.register(TestB('xyz'))
    test_b = global_ctx.get(TestB)
    assert test_b.do_something() == 'abcxyz'


def test_dependency_with_missing_register():
    class TestA:
        def __init__(self, message='foo'):
            self._message = message

        def do_something(self):
            return self._message

    class TestB:
        def __init__(self, message='bar', ctx: DepContext = get_context()):
            self._message = message
            self._test_a = ctx.get(TestA)

        def do_something(self):
            return self._test_a.do_something() + self._message

    global_ctx = get_context()
    global_ctx.start()
    with raises(InitializationError):
        global_ctx.register(TestB('xyz'))


def test_dependency_with_local_context():
    class TestA:
        def __init__(self, message='foo'):
            self._message = message

        def do_something(self):
            return self._message

    class TestB:
        def __init__(self, message='bar', ctx: DepContext = get_context()):
            self._message = message
            self._test_a = ctx.get(TestA)

        def do_something(self):
            return self._test_a.do_something() + self._message

    local_ctx = DepContext()
    local_ctx.register(TestA('abc'))
    local_ctx.register(TestB('xyz', ctx=local_ctx))
    test_b = local_ctx.get(TestB)
    assert test_b.do_something() == 'abcxyz'
