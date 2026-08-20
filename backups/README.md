# 備份目錄

本目錄存放專案壓縮備份,**不納入 Git 版本庫**。

## 命名規則

| 類型 | 檔名範例 | 指令 |
|------|----------|------|
| 里程碑 | `cnc-toolkit-v1.0.0.zip` | `./scripts/backup.sh --release` |
| 自動/手動 | `cnc-toolkit-1.0.0-20260817-143052.zip` | `./scripts/backup.sh` |

格式:`<套件名>-<語意版本>-<YYYYMMDD-HHMMSS>.zip`

## 自動備份

```bash
./scripts/install-hooks.sh
```

啟用後,每次 `git commit` 若改動 app 原始碼,會自動在此目錄建立時間戳備份。

## 版本號

統一由根目錄 [`version.json`](../version.json) 管理;軟件內顯示與備份檔名共用同一版本。
