#!/usr/bin/env bash
# 啟用 Git 自動備份 hook(提交後自動打包)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

chmod +x scripts/backup.sh .githooks/post-commit

git config core.hooksPath .githooks

echo "✅ 已啟用自動備份 hook"
echo "   提交後若改動 index.html / css / js / sw.js / manifest / version.json"
echo "   會自動建立 backups/cnc-toolkit-<version>-<時間戳>.zip"
echo ""
echo "手動備份:"
echo "  ./scripts/backup.sh           # 時間戳備份"
echo "  ./scripts/backup.sh --release # 里程碑備份 (例 v1.0.0)"
