#!/bin/bash

set -ex

mkdir -p .tmp

# TODO restore
exit 0
# curl -L https://api.github.com/repos/ZQuestClassic/ZQuestClassic/releases/latest > .tmp/latest.json
curl -L https://api.github.com/repos/ZQuestClassic/ZQuestClassic/releases/tags/nightly-2023-10-12 > .tmp/latest.json
VERSION=$(jq -r '.tag_name' .tmp/latest.json)

if [ ! -d .tmp/release-$VERSION ]; then
    URL=$(jq -r '.assets[] | select(.name|endswith("web.zip")) | .browser_download_url' .tmp/latest.json)
    wget $URL -O .tmp/web.zip
    unzip .tmp/web.zip -d .tmp

    rm .tmp/dist/index.html
    sed -i 's@/zc/@/@g' .tmp/dist/create/index.html || (sed 's@/zc/@/@g' .tmp/dist/create/index.html > out.html && mv out.html .tmp/dist/create/index.html)
    sed -i 's@/zc/@/@g' .tmp/dist/play/index.html || (sed 's@/zc/@/@g' .tmp/dist/play/index.html > out.html && mv out.html .tmp/dist/play/index.html)
    npx --yes json -I -f .tmp/dist/manifest.json -e "this.scope='https://web.zquestclassic.com'"
    mv .tmp/dist .tmp/release-$VERSION
fi

rm -rf .tmp/web.zip .tmp/latest.json

rm -rf dist
mkdir dist
cp -r .tmp/release-$VERSION/* dist
cp _headers _redirects dist
