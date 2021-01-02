#!/usr/bin/env bash

set -e
umask 077

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd ../obm_server
python -m pytest

cd ../obm_react
CI=true npm test
npm run build

cd ../deploy/docker

rm -rf build/srv/www || true
rm -rf build/srv/app || true
mkdir -p build/srv/{www,app}
cp -r ../../obm_react/build/* build/srv/www
cp -r ../../obm_server/{obm,data,requirements.txt} build/srv/app