#!/bin/bash

# Returns the number with explicit + sign if it's non-negative
with_signum() {
    SIGN=
    if [ "$1" -ge 0 ]; then
        SIGN=+
    fi

    echo "$SIGN$1"
}

value_of() {
    IFS=',' read -a PROBE <<< "$1"
    PR=${PROBE[0]}
    PG=${PROBE[1]}
    PB=${PROBE[2]}

    MIND=99999999
    MINV=

    while IFS=',' read -a TESTED; do
        TR=${TESTED[0]}
        TG=${TESTED[1]}
        TB=${TESTED[2]}
        TV=${TESTED[3]}

        DR=$(expr \( $TR \- $PR \) \* \( $TR \- $PR \))
        DG=$(expr \( $TG \- $PG \) \* \( $TG \- $PG \))
        DB=$(expr \( $TB \- $PB \) \* \( $TB \- $PB \))
        D=$(expr $DR \+ $DG \+ $DB)

        if [ "$D" -lt "$MIND" ]; then
            MIND=$D
            MINV=$TV
        fi
    done < $BINS

    echo $MINV
}

SRC=$1
BINS=$2
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

RGB=$(convert $SRC \
    -depth 8 \
    -crop $CROP +repage \
    -scale 1x1 \
    text:- | tail -n +2 | sed -e "$REGEX")

value_of $RGB
