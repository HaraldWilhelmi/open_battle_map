#!/usr/bin/env bash

set -e

my_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$my_dir/obm_react"
npm start