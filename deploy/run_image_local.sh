#!/bin/bash

set -e

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd docker

docker build -t open_battle_map .

(docker volume ls | grep -q obm_test_data) \
    || docker volume create obm_test_data

docker container rm obm_test || true >/dev/null 2>&1

(
    sleep 3
    docker exec obm_test cat /data/obm_data/config
    echo ''
) &

docker run -it \
    --name obm_test \
    -p 127.0.0.1:80:80/tcp \
    --mount source=obm_test_data,target=/data \
    --env ENABLE_TLS=no \
    open_battle_map
