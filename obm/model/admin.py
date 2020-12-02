from fastapi import Depends, Header, status, HTTPException

from obm.data.config import Config, get_config


def check_admin_token(
        x_obm_token: Header(''),
        config: Config = Depends(get_config)
):
    if config.admin_secret is None or config.admin_secret == '':
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, 'Sorry no admin secret found!')
    if x_obm_token != config.admin_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Go away hacker!')
