#!/bin/bash

A=$1
B=$2
DEST=$3

# ImageMagick params
BLUR=6x2

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='{"x":\1,"y":\2,"v":[\3,\4,\5]},'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"

convert \
    $A -gaussian-blur $BLUR \
    $B -gaussian-blur $BLUR \
    -compose difference -composite \
    -negate -selective-blur 12x4+08% \
    -shave 10x40 \
    $DEST
