#!/bin/bash

SRC=$1
DEST=$2

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='{"x":\1,"y":\2,"v":{"r":\3,"g":\4,"b":\5}},'
FORMAT='{"x":\1,"y":\2,"v":[\3,\4,\5]},'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"

LINES=$(convert $SRC -shave 10x40 -resize 200 -colorspace RGB text:- | tail -n +2 | sed -e "$REGEX")
if [ "$LINES" == "" ]; then
    exit 1
fi

printf "[\n${LINES%?}\n]" > $DEST
