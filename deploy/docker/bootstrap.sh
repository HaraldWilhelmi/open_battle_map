#!/bin/bash

set -e

if [[ ! -d /data/tls ]]
then
    mkdir /data/tls
    chown www-data:www-data /data/tls
    chmod 700 /data/tls
fi

if [[ ! -d /data/obm_data ]]
then
    mkdir /data/obm_data
    chown app /data/obm_data
    chmod 700 /data/obm_data
fi

[[ -L /home/app/open_battle_map_data ]] \
    || ln -s /data/obm_data /home/app/open_battle_map_data

service nginx start
cd /srv/app
su - app -c 'cd /srv/app && uvicorn obm.app:app'
