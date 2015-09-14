#!/bin/bash

SRC=$1
DEST=$2

STATUS=$(curl -o /dev/null -I -L -w "%{http_code}" $SRC 2>/dev/null)
if [ "$STATUS" != "200" ]; then
    exit 1
fi

curl -L -sS -o $DEST $SRC
