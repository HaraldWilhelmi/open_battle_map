from os.path import dirname, join

_IMAGE_DIR = join(dirname(dirname(dirname(__file__))), 'images')
_DEFAULT_MAP = join(_IMAGE_DIR, 'default_map.svg')


def get_default_map() -> bytes:
    with open(join(_IMAGE_DIR, 'default_map.svg'), 'rb') as fp:
        return fp.read()


def get_default_token() -> bytes:
    with open(join(_IMAGE_DIR, 'default_token.svg'), 'rb') as fp:
        return fp.read()
