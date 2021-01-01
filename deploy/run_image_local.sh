#!/bin/bash

set -e

cd "$( dirname "${BASH_SOURCE[0]}" )"

data_dir=~/open_battle_map_data
tls_dir=~/open_battle_map_tls

mkdir -p "$data_dir" "$tls_dir"

docker run -it \
    -p 127.0.0.1:80:80/tcp \
    --mount type=bind,source="$data_dir",target=/home/app/open_battle_map_data \
    --mount type=bind,source="$tls_dir",target=/home/www/tls \
    open_battle_map
