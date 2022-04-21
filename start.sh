#!/bin/bash

if [ ! -d mch2021designgenerator ]; then
  git submodule update --init
fi

if [ ! -d mch2021designgenerator/node_modules ]; then
  pushd mch2021designgenerator
  npm ci --no-dev
  popd
fi

SOCK=./mch2021designgenerator/listen.sock

if [ -e $SOCK ]; then
  rm $SOCK;
fi

mch2021designgenerator/cli.mjs -s $SOCK >/dev/null &

# Await the socket
while [ ! -S $SOCK ]; do
  sleep 0.1
done

python3 badger.py $@
kill %1
