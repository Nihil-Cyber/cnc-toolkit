#!/usr/bin/env bash
# 將網站本體複製到 iOS App 包內資源目錄（單一來源：repo 根目錄）
# 唔用 rm -rf WebAssets：Xcode「User Script Sandboxing」會拒絕讀取該目錄
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/ios/CNCToolkit/WebAssets"

mkdir -p "$DEST"

cp -f "$ROOT/index.html" "$DEST/"
cp -f "$ROOT/disclaimer.html" "$DEST/"
# ditto 覆寫 css/js，避免整個 WebAssets 目錄 rm -rf
/usr/bin/ditto "$ROOT/css" "$DEST/css"
/usr/bin/ditto "$ROOT/js" "$DEST/js"

for f in apple-touch-icon.png icon-192.png icon-512.png icon-maskable-512.png manifest.webmanifest version.json; do
  if [[ -f "$ROOT/$f" ]]; then
    cp -f "$ROOT/$f" "$DEST/"
  fi
done

rm -f "$DEST/sw.js" 2>/dev/null || true

COUNT_JS="$(find "$DEST/js" -name '*.js' 2>/dev/null | wc -l | tr -d ' ')"
echo "sync-ios-assets: copied to ios/CNCToolkit/WebAssets ($COUNT_JS js files)"
