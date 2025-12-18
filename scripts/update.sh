# bash update.sh path/to/zc

set -ex

ZC_DIR="${1:-$HOME/code/ZQuestClassic}"

cd "$ZC_DIR"
VERSION=$(git describe --tags --abbrev=0 --match "*.*.*")
echo "building $VERSION ..."
export ZC_EMCC_CMAKE_EXTRA_FLAGS="-DZC_OFFICIAL=ON -DZC_VERSION=$VERSION -DRELEASE_CHANNEL=web -DREPO=ZQuestClassic/ZQuestClassic"
echo "$ZC_EMCC_CMAKE_EXTRA_FLAGS"
bash scripts/configure_emscripten.sh
rm -fr "build_emscripten/Release/packages/web/"
cmake --build build_emscripten --config Release -t web web_zscript_playground
cd -

rsync -r --delete --exclude _headers --exclude _redirects "$ZC_DIR/build_emscripten/Release/packages/web/" dist/
echo "$VERSION" > dist/version
