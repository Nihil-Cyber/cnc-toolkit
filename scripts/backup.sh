#!/usr/bin/env bash
# CNC 工程師工具包 — 備份壓縮腳本
# 用法:
#   ./scripts/backup.sh           # 時間戳備份 → backups/cnc-toolkit-1.0.0-20260817-123456.zip
#   ./scripts/backup.sh --release # 里程碑備份 → backups/cnc-toolkit-v1.0.0.zip
#   ./scripts/backup.sh --auto    # Git hook 用:僅當 app 原始碼有變更時才備份

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

read_meta() {
  node -e "
    const m = require('./version.json');
    console.log([m.name, m.version, m.codename || ''].join('\t'));
  "
}

IFS=$'\t' read -r PKG_NAME VERSION CODENAME < <(read_meta)
BACKUP_DIR="$ROOT/backups"
mkdir -p "$BACKUP_DIR"

MODE="timestamp"
if [[ "${1:-}" == "--release" ]]; then
  MODE="release"
elif [[ "${1:-}" == "--auto" ]]; then
  MODE="auto"
fi

if [[ "$MODE" == "auto" ]]; then
  # post-commit:上一個 commit 若無改到 app 檔就跳過
  if ! git rev-parse HEAD >/dev/null 2>&1; then
    exit 0
  fi
  if ! git diff-tree --no-commit-id --name-only -r HEAD | grep -qE '^(index\.html|css/|js/|sw\.js|manifest\.webmanifest|version\.json)'; then
    exit 0
  fi
  MODE="timestamp"
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
if [[ "$MODE" == "release" ]]; then
  ZIP_NAME="${PKG_NAME}-v${VERSION}.zip"
else
  ZIP_NAME="${PKG_NAME}-${VERSION}-${STAMP}.zip"
fi

ZIP_PATH="$BACKUP_DIR/$ZIP_NAME"

# 避免覆寫里程碑包:若已存在則加時間戳
if [[ -f "$ZIP_PATH" ]]; then
  ZIP_NAME="${PKG_NAME}-v${VERSION}-${STAMP}.zip"
  ZIP_PATH="$BACKUP_DIR/$ZIP_NAME"
fi

echo "📦 建立備份: $ZIP_NAME"

zip -r "$ZIP_PATH" . \
  -x "*.git*" \
  -x "backups/*" \
  -x ".claude/*" \
  -x "node_modules/*" \
  -x "*.DS_Store" \
  -x "scripts/.last-backup" \
  -q

SIZE="$(du -h "$ZIP_PATH" | cut -f1)"
echo "✅ 完成 ($SIZE) → backups/$ZIP_NAME"

# 記錄最後備份(供開發參考)
printf '%s\t%s\n' "$ZIP_NAME" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$ROOT/scripts/.last-backup"
