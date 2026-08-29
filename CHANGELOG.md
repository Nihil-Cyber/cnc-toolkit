# 更新記錄 · Changelog

本檔案記錄 CNC 工程師工具包每次版本更新與大型功能變更。  
格式參考 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/)，版本號遵循 [語意化版本](https://semver.org/lang/zh-TW/)。

---

## 撰寫規範（開發者）

每次**發佈新版本**或**加入大型功能**時，必須：

1. 喺本檔案頂部 `[Unreleased]` 區塊填寫變更（或建立新版本標題）
2. 同步更新：
   - [`version.json`](version.json)
   - [`js/version.js`](js/version.js) 嘅 `APP_META`
   - [`sw.js`](sw.js) 嘅 `CACHE` 名稱
   - [`manifest.webmanifest`](manifest.webmanifest) 嘅 `description` 版本號（如有）
3. 大型功能：喺 **Added** 下寫清楚用戶可見嘅改動
4. 修復：喺 **Fixed** 下說明問題與影響
5. 若改動 `js/` / `css/` / `index.html`，確保 `CHANGELOG.md` 已加入 `sw.js` 嘅 `ASSETS`（已預設包含）

### 版本號建議

| 變更類型 | 範例 |
|----------|------|
| 修復、小調整 | 1.1.1 → 1.1.2 |
| 新工具、新參考資料、明顯新功能 | 1.1.x → 1.2.0 |
| 破壞性變更、資料結構大改 | 1.x → 2.0.0 |

---

## [Unreleased]

---

## [1.2.2] — 2026-08-29

### Fixed
- **參數合理性標示**：修復銑削分頁未讀取 `vc` 導致狀態列永遠顯示綠色嘅 bug
- **Service Worker**：改為 network-first,上線後改動可即時生效

### Changed
- 狀態列新增 vc / fz / ap / ae 即時標籤 chips

---

## [1.2.1] — 2026-08-29

### Added
- **加工參數合理性標示**：銑削 / 車削 / 鑽孔輸入欄以綠 / 黃 / 紅色顯示參數是否在建議範圍；結果區切屑厚度等亦會標色，並附狀態說明列

---

## [1.2.0] — 2026-08-20

### Added
- **工程參考**分頁：材料特性、模具鋼牌號、加工面粗度、合金元素、IT 公差速查（`js/ref-data.js`、`js/i18n-ref.js`）
- **全新視覺 icon**：側欄 15 項工具改用 SVG 線條圖；左上角品牌 logo 換成立銑刀圖形
- **PWA icon 重設計**：`icon-192/512`、`apple-touch-icon`、新增 `icon-maskable-512`（`any` / `maskable` 分開）
- **版本與備份**：`version.json`、`js/version.js`；設定內可查看更新記錄；`scripts/backup.sh`、可選 post-commit 自動備份
- **技術手冊** [HANDBOOK.md](HANDBOOK.md)、[CHANGELOG.md](CHANGELOG.md)
- **手機版面**：頂部列、側邊抽屜、觸控優化、安全區域支援
- **安全**：`escapeHtml()` / `safeUrl()`；`innerHTML` 輸出跳脫

### Changed
- 詢價與設定流程小幅優化；`manifest.webmanifest` icons 結構更新
- README 補充版本管理與備份說明

### Fixed
- 恢復 `.tab-panel { display: none }`，修復所有工具同頁顯示
- iOS 輸入欄 16px，避免自動放大

---

### Added
- **更新記錄**：新增 `CHANGELOG.md`；設定面板可查看完整更新歷史

### Fixed
- （本版本主要為流程與文檔）

---

## [1.1.1] — 2026-08-18

### Added
- **手機版面**：頂部列、側邊抽屜選單、較大觸控區域、安全區域（瀏海/Home 條）支援

### Fixed
- 修復 `.tab-panel { display: none }` 遺失導致所有工具同時顯示喺同一頁嘅問題
- 輸入欄字體調整為 16px，避免 iOS 自動放大

---

## [1.1.0] — 2026-08-17

### Added
- **📚 工程參考**分頁：材料特性、模具鋼牌號對照（JIS/AISI/廠牌）、加工面粗度、合金元素、IT1–IT14 公差表
- 硬度換算表擴充 HRA、HRB、HS 欄位
- 公差配合分頁新增完整 IT 公差對照表

### Security
- 新增 `escapeHtml()` / `safeUrl()`，所有 `innerHTML` 插值跳脫（`renderResults`、詢價單、產品卡等）

---

## [1.0.0] — 2026-08-17（代號 v1）

### Added
- 15 項加工計算工具：銑削、車削、鑽孔・攻牙、表面粗糙度、硬度換算、英寸換算、直角三角形、公差配合、參數對比、刀具建議、刀片代碼、插補補償、G-code、材料重量
- 六語言介面（繁中、简中、英、德、法、印地）
- 公制 / 英制切換，數值自動換算
- 日間 / 夜間主題
- 面板截圖匯出（Canvas PNG，支援 Web Share）
- 銑削 / 車削 / 鑽孔：主軸轉速 n 與進給 vf 雙向聯動輸入
- PWA 離線快取（Service Worker）
- 可選銷售功能：情境產品卡、詢價單（WhatsApp / Email）
- 版本顯示、備份腳本（`scripts/backup.sh`）、里程碑壓縮包 `cnc-toolkit-v1.0.0.zip`
- 技術手冊 [`HANDBOOK.md`](HANDBOOK.md)

[Unreleased]: https://github.com/nihil-cyber/cnc-toolkit/compare/v1.1.2...HEAD
[1.1.2]: https://github.com/nihil-cyber/cnc-toolkit/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/nihil-cyber/cnc-toolkit/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nihil-cyber/cnc-toolkit/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/nihil-cyber/cnc-toolkit/releases/tag/v1.0.0
