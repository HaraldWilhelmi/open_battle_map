from fastapi import FastAPI

from obm.data.config import setup_config_for_production
from obm.fileio.map_set_io import setup_map_set_io_for_production
from obm.model.map_set_directory import setup_map_set_directory_for_production
from obm.model.map_set_cache import setup_map_set_cache_for_production
from obm.model.map_set_manager import setup_map_set_manager_for_production


setup_config_for_production()
setup_map_set_io_for_production()
setup_map_set_directory_for_production()
setup_map_set_cache_for_production()
setup_map_set_manager_for_production()


app = FastAPI()
app.include_router()
