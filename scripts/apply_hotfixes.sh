# bash scripts/apply_hotfixes.sh
# Adds the scripts in hotfixes/ to dist/, loaded before main.js on the player and editor pages.

set -e

cd "$(dirname "$0")/.."

for hotfix in hotfixes/*.js; do
	name=$(basename "$hotfix")
	cp "$hotfix" "dist/$name"
	for page in dist/play/index.html dist/create/index.html; do
		if ! grep -q "src=\"../$name\"" "$page"; then
			perl -0pi -e "s#(\n[ \t]*)<script src=\"../main.js\"></script>#\$1<script src=\"../$name\"></script>\$&#" "$page"
			grep -q "src=\"../$name\"" "$page" || { echo "failed to add $name to $page"; exit 1; }
		fi
	done
done
