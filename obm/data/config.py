from os.path import expanduser, join, isfile
from os import umask
from typing import Optional
from datetime import timedelta
import json
from pydantic import BaseModel
from secrets import token_hex

from obm.common.error import check_dependency


class Config(BaseModel):
    admin_secret: str
    data_dir: str = join(expanduser('~'), 'open_battle_map_data')
    cache_expire: timedelta = timedelta(days=1)
    auto_save_interval: timedelta = timedelta(minutes=5)


config: Optional[Config] = None


def get_config() -> Config:
    check_dependency(config, 'config')
    return config


def get_config_file_name() -> str:
    return join(expanduser('~'), '.open_battle_map_rc')


def setup_config_for_production():
    global config
    file_name = get_config_file_name()
    if isfile(file_name):
        with open(file_name, 'r') as fp:
            raw_data = json.load(fp)
            config = Config(**raw_data)
    else:
        config = Config(admin_secret=token_hex())
        umask(0o177)
        with open(file_name, 'w') as fp:
            fp.write(config.json())
