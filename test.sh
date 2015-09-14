#!/bin/bash

# Download first
./src/js/server/api/bin/download.sh http://www.shmu.sk/data/datanwp/zrazky/zrazky_15092015-09.png cache/data.png

time ./src/js/server/api/bin/evaluate.sh cache/data.png 4 20 20
