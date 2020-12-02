class InitializationError(Exception):
    pass


class DepContext:
    def __init__(self, is_global: bool = False):
        self._instances = {}
        self._is_locked = is_global  # Lock global contexts by default so that they are not used by accident

    def start(self):
        self._is_locked = False

    def register(self, dependency):
        self._check_if_ready()
        dependency_type = type(dependency)
        if dependency_type in self._instances:
            raise InitializationError(f"Class {dependency_type} registered twice!")
        self._instances[dependency_type] = dependency

    def _check_if_ready(self):
        if self._is_locked:
            raise InitializationError('Please "start()" global context before using it!')

    def get(self, dependency_type):
        self._check_if_ready()
        if dependency_type not in self._instances:
            raise InitializationError(
                f"Class {dependency_type} not registered. Have you registered your dependencies in the right order?"
            )
        return self._instances[dependency_type]


_context: DepContext = DepContext(is_global=True)


def get_context() -> DepContext:
    return _context


def reset_context():
    global _context
    _context = DepContext(is_global=True)
