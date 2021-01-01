from fastapi import Depends, Cookie, status, HTTPException, Response

from obm.data.config import Config
from obm.dependencies import get_config


def check_admin_secret(
        response: Response,
        obm_admin_secret: str = Cookie(''),
        config: Config = Depends(get_config)
):
    if config.admin_secret is None or config.admin_secret == '':
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, 'Sorry no admin secret found!')
    if obm_admin_secret != config.admin_secret:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Go away hacker!')
    response.set_cookie(
        'obm_admin_secret',
        obm_admin_secret,
        max_age=int(config.admin_secret_cookie_max_age.total_seconds()),
        samesite='Strict'
    )
