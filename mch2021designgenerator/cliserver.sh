#!/bin/bash
rm -rf ./listen.sock
node ./cli.mjs -s ./listen.sock -w 1016 -t 648 -b
