#!/bin/bash

set -e

cd "$( dirname "${BASH_SOURCE[0]}" )"/obm_server

uvicorn obm.app:app
