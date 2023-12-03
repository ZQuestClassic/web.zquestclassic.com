#!/bin/bash

set -ex

mkdir -p .tmp

# TODO restore
exit 0
# curl -L https://api.github.com/repos/ZQuestClassic/ZQuestClassic/releases/latest > .tmp/latest.json
curl -L https://api.github.com/repos/ZQuestClassic/ZQuestClassic/releases/tags/3.0.0-prerelease.10+2023-12-02 > .tmp/latest.json
VERSION=$(jq -r '.tag_name' .tmp/latest.json)

if [ ! -d ".tmp/release-$VERSION" ]; then
    URL=$(jq -r '.assets[] | select(.name|endswith("web.zip")) | .browser_download_url' .tmp/latest.json)
    wget $URL -O .tmp/web.zip
    mkdir -p ".tmp/release-$VERSION"
    unzip .tmp/web.zip -d ".tmp/release-$VERSION"
fi

rm -rf .tmp/web.zip .tmp/latest.json

rm -rf dist
mkdir dist
cp -r ".tmp/release-$VERSION"/* dist
cp _headers _redirects dist
