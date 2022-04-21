#!/bin/bash

if [ ! -d mch2021designgenerator ]; then
  git submodule update --init
fi

if [ ! -d mch2021designgenerator/node_modules ]; then
  pushd mch2021designgenerator
  npm ci --no-dev
  popd
fi

mch2021designgenerator/cli.mjs -s ./mch2021designgenerator/listen.sock >/dev/null &
python3 badger.py
kill %1
