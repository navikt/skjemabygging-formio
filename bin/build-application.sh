#!/bin/bash -e

# output color
RED='\033[0;31m'
GREEN='\033[0;32m'
NO_COLOR='\033[0m'

if [[ $(git diff --stat) != '' ]]; then
  echo -e "${RED}[error] cannot run script when working directory contains unstaged changes${NO_COLOR}"
  echo -e "${RED}[error] stage for commit, and try again${NO_COLOR}"
  exit 1
fi

root_dir=$(pwd)

function cleanup {
  # [cleanup] git revert files changed by this script
  cd "$root_dir"
  git checkout -- packages/**/package.json > /dev/null 2>&1 || :
  git checkout -- packages/**/yarn.lock > /dev/null 2>&1 || :
  git checkout -- packages/**/server/package.json > /dev/null 2>&1 || :
  git checkout -- packages/**/server/yarn.lock > /dev/null 2>&1 || :
}
trap cleanup EXIT

SCRIPT=$0
function usage {
  echo -e "Usage: ${SCRIPT} <bygger|fyllut>"
}

APP=$1
if [ -z "${APP}" ]; then
  echo -e "${RED}[error] missing application${NO_COLOR}"
  echo -e ""
  usage
  exit 1
fi

echo -e "--------------------------------------------"
echo -e "\t${GREEN}Building application: $APP${NO_COLOR}"
echo -e "--------------------------------------------"

cd_package() {
    cd "$root_dir/packages/$1" || exit 1
}

install() {
    yarn install --frozen-lockfile || exit 1
}

build() {
    yarn build || exit 1
}

build_prod() {
    yarn build:prod || exit 1
}

yarn && yarn clean
node bin/prepare-production-build.mjs

cd_package "shared-domain" && install && build
cd_package "shared-components" && install && build

if [ "$APP" == "bygger" ]; then
    cd_package "bygger" && install && build
    cd_package "bygger/server" && install && build
fi

if [ "$APP" == "fyllut" ]; then
    cd_package "fyllut" && install && build_prod
    cd_package "fyllut/server" && install && build
fi
