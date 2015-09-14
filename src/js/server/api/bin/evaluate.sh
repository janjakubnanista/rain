#!/bin/bash

# Returns the number with explicit + sign if it's non-negative
with_signum() {
    SIGN=
    if [ "$1" -ge 0 ]; then
        SIGN=+
    fi

    echo "$SIGN$1"
}

SRC=$1
DEST=$2
X=$3
Y=$4
R=2

RR=$(expr $R \* 2)
X0=$(expr $X \- $R)
Y0=$(expr $Y \- $R)

CROPW=$RR
CROPH=$RR
CROPX=$(with_signum $X0)
CROPY=$(with_signum $Y0)

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='\3,\4,\5'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"

# Crop geometry
CROP="${CROPW}x${CROPH}$CROPX$CROPY"

convert $SRC \
    -colorspace RGB  \
    -crop $CROP +repage \
    -scale 1x1 \
    text:- | tail -n +2 | sed -e "$REGEX"
