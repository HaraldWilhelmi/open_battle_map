#!/bin/bash

service nginx start
cd /srv/app
su - app -c 'cd /srv/app && uvicorn obm.app:app'
