#!/bin/bash

BIN=./src/js/server/api/bin/
SOURCE=http://www.shmu.sk/data/datanwp/zrazky/zrazky_15092015-09.png
DOWNLOADED=cache/15092015-09.png
REFERENCE=./src/js/server/api/res/reference.png
RESULT=cache/15092015-09.txt

# Download first
time $BIN/download.sh $SOURCE $DOWNLOADED

# time $BIN/analyse.sh $REFERENCE $DOWNLOADED > $RESULT

time $BIN/compare.sh $REFERENCE $DOWNLOADED | xargs -L 1 $BIN/evaluate.js
