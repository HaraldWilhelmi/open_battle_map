class NotInitializedError(Exception):
    pass


def check_dependency(x, name: str):
    if x is None:
        raise NotInitializedError(f"{name} is not setup!")


def name_validator(name: str):
    if len(name) > 64:
        raise ValueError('Longer than 64 characters.')
