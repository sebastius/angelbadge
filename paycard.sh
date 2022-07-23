#!/bin/bash
if [ ! -d mch2021designgenerator ]; then
  git submodule update --init
fi

if [ ! -d mch2021designgenerator/node_modules ]; then
  pushd mch2021designgenerator
    npm ci --no-dev
  popd
fi

SOCK=$(pwd)/mch2021designgenerator/listen.sock

if [ -e $SOCK ]; then
  rm $SOCK;
fi

pushd mch2021designgenerator
  ./cli.mjs -s $SOCK >/dev/null &
popd

# Await the socket
while [ ! -S $SOCK ]; do
  sleep 0.1
done

python3 flatball.py $@
kill %1
