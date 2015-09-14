#!/bin/bash

# Download first
time ./src/js/server/api/bin/download.sh http://www.shmu.sk/data/datanwp/zrazky/zrazky_15092015-09.png downloaded.png

time ./src/js/server/api/bin/compare.sh ./src/js/server/api/res/reference.png downloaded.png difference.png

time ./src/js/server/api/bin/evaluate.sh ./difference.png ./src/js/server/api/res/bins.txt 229 123
