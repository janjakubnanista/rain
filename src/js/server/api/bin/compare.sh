#!/bin/bash

A=$1
B=$2
DEST=$3

# ImageMagick params
BLUR=6x2

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='{"x":\1,"y":\2,"v":{"r":\3,"g":\4,"b":\5}},'
FORMAT='{"x":\1,"y":\2,"v":[\3,\4,\5]},'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"

PIXELS=$(convert \
    $A -gaussian-blur $BLUR \
    $B -gaussian-blur $BLUR \
    -compose difference -composite \
    -negate -selective-blur 12x4+08% \
    -shave 10x40 -resize 400 \
    -colorspace RGB text:- \
    | tail -n +2 | sed -e "$REGEX")

printf "[\n${PIXELS%?}\n]" > $DEST
