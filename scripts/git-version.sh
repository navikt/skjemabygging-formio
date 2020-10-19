#!/bin/sh

GIT_REVISION=${SOURCE_VERSION:-`git describe --always --match 'NOT A TAG' --abbrev=0 --dirty`}

echo $GIT_REVISION
