#!/bin/bash

SRC=$1
CELL=$2
X=$3
Y=$4

X0=$(echo "$X-$CELL/2" | bc)
Y0=$(echo "$Y-$CELL/2" | bc)
X1=$(echo "$X+$CELL/2" | bc)
Y1=$(echo "$Y+$CELL/2" | bc)

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='{"x":\1,"y":\2,"v":[\3,\4,\5]}'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"
CROP="${CELL}x${CELL}+$X0+$Y0"

echo $CROP

convert $SRC \
    -colorspace RGB  \
    -crop "${CELL}x${CELL}+$X0+$Y0" +repage
    -scale 1x1 \
    text:- | tail -n +2 | sed -e "$REGEX"
