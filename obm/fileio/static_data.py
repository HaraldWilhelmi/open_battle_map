from os.path import dirname, join


_DEFAULT_MAP = join(dirname(dirname(dirname(__file__))), 'images', 'default_map.svg')


def get_default_map() -> bytes:
    with open(_DEFAULT_MAP, 'rb') as fp:
        return fp.read()
