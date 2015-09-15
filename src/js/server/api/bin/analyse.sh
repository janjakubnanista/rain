#!/bin/bash

A=$1
B=$2

# ImageMagick params
BLUR=6x2

# SED matching stuff
NUM='\([0-9]\{1,\}\)'
FORMAT='{"x":\1,"y":\2,"v":[\3,\4,\5]},'
FORMAT='\1,\2,\3,\4,\5'
REGEX="s/^$NUM,$NUM: ($NUM,$NUM,$NUM).*/$FORMAT/g"

# Bins for RGB -> mm rain/3hrs conversion
read -r -d '' BINS << EOM
255,255,255,0.00
226,226,226,0.25
188,188,188,0.50
166,254,255,1.00
7,189,255,2.00
46,130,255,3.00
140,255,144,5.00
86,214,125,10.00
85,170,0,15.00
0,116,0,20.00
214,255,33,25.00
248,255,41,30.00
255,229,29,35.00
255,170,127,40.00
255,85,0,45.00
255,0,0,50.00
200,0,0,60.00
160,0,0,100.00
116,0,0,200.00
85,0,127,300.00
EOM

# Get RGB info from image
LINES=$(convert \
    $A -gaussian-blur $BLUR \
    $B -gaussian-blur $BLUR \
    -compose difference -composite \
    -negate -selective-blur 12x4+08% \
    -shave 10x40 \
    text:- | tail -n +2 | head -n 20 | sed -e "$REGEX")

while IFS=',' read -a XYRGB; do
    X=${XYRGB[0]}
    Y=${XYRGB[1]}
    R=${XYRGB[2]}
    G=${XYRGB[3]}
    B=${XYRGB[4]}

    # Initial value for distance in RGB space
    MIND=99999999

    # Value in mm/3h
    VALUE=0.00

    while IFS=',' read -a TESTED; do
        TR=${TESTED[0]}
        TG=${TESTED[1]}
        TB=${TESTED[2]}
        TV=${TESTED[3]}

        DR=$(expr \( $TR \- $R \) \* \( $TR \- $R \))
        DG=$(expr \( $TG \- $G \) \* \( $TG \- $G \))
        DB=$(expr \( $TB \- $B \) \* \( $TB \- $B \))
        D=$(expr $DR \+ $DG \+ $DB)

        if [ "$D" -lt "$MIND" ]; then
            MIND=$D
            VALUE=$TV
        fi
    done <<< "$BINS"

    echo "$X,$Y,$VALUE"
done <<< "$LINES"
