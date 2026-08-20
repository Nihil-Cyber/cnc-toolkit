# CNC 工程師工具包 — 完整技術手冊

> 版本對應現況程式庫（純前端 + PWA）  
> 線上示範：https://nihil-cyber.github.io/cnc-toolkit/  
> 適用對象：開發者、維護者、想理解系統架構嘅工程師

---

## 目錄

1. [系統總覽](#1-系統總覽)
2. [網絡架構](#2-網絡架構)
3. [資料層（「DB」）](#3-資料層db)
4. [後端（Backend）](#4-後端backend)
5. [前端（Frontend）](#5-前端frontend)
6. [編碼規範與模組說明](#6-編碼規範與模組說明)
7. [計算核心與公式](#7-計算核心與公式)
8. [開發、測試、部署](#8-開發測試部署)
9. [擴展指南](#9-擴展指南)
10. [未來架構路線圖（可選）](#10-未來架構路線圖可選)
11. [安全、私隱、免責](#11-安全私隱免責)

---

## 1. 系統總覽

### 1.1 這是什麼

**CNC 工程師工具包**係一個**純前端、零建置（zero build）、零依賴**嘅 Web 應用，提供 14 個 CNC 加工相關計算器／查表工具，並可安裝為離線 PWA。

技術棧：

| 層 | 技術 |
|----|------|
| 語言 | HTML5 / CSS3 / Vanilla JavaScript（ES2018+） |
| UI | 自寫 CSS（CSS Variables 主題） |
| 狀態 | 記憶體內變數 + `localStorage` |
| 離線 | Service Worker（`sw.js`）+ Web App Manifest |
| 託管 | 任何靜態網站主機（現況：GitHub Pages） |
| 建置 | **無** — 唔使 npm / webpack / Vite |

### 1.2 一句話架構

```
瀏覽器 ──GET──▶ 靜態主機(CDN)
                │
                ▼
         index.html + css/ + js/
                │
                ▼
     全部計算喺客戶端完成；偏好存 localStorage
     （無伺服器 API、無資料庫連線）
```

### 1.3 功能地圖（14 工具）

| 分頁 ID | 工具 | 核心模組 |
|---------|------|----------|
| `milling` | 銑削計算 | `calc.js` + `app.js` sync |
| `turning` | 車削計算 | 同上 |
| `drilling` | 鑽孔・攻牙 | 鑽尖、啄鑽、螺紋表 |
| `surface` | 表面粗糙度 | Ra/Rz、scallop |
| `hardness` | 硬度換算 | ASTM E140 內插 |
| `convert` | 英寸換算 | 分數／小數解析 |
| `triangle` | 直角三角形 | 雙已知值求解 |
| `fits` | 公差配合 | ISO 286 |
| `compare` | 參數對比 + ROI | Taylor + 成本 |
| `advisor` | 刀具建議 | ISO 513 知識庫 |
| `insert` | 刀片代碼 | ISO 1832 解碼 |
| `interp` | 插補補償 | 圓弧／螺旋 |
| `gcode` | G-code 產生 | bolt / helical / face |
| `weight` | 材料重量 | 體積 × 密度 |

附加能力：多語言（6）、公／英制、日／夜主題、截圖匯出、銷售詢價漏斗。

---

## 2. 網絡架構

### 2.1 現行部署拓撲

```
┌─────────────────────────────────────────────────────────┐
│  用戶裝置（瀏覽器 / PWA）                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ index.html  │  │ Service      │  │ localStorage    │ │
│  │ + CSS/JS    │◀─│ Worker 快取  │  │ 偏好 / 詢價單   │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└──────────────────────────▲──────────────────────────────┘
                           │ HTTPS GET（首次／更新）
                           │
┌──────────────────────────┴──────────────────────────────┐
│  靜態託管（GitHub Pages / Cloudflare / Netlify…）         │
│  · 只提供靜態檔案                                         │
│  · 無應用伺服器、無反向代理業務邏輯                         │
│  · HTTPS 由平台預設提供                                   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 請求生命週期

1. **首次訪問**：瀏覽器向主機拉取 `index.html`、CSS、JS、圖示。
2. **註冊 SW**：僅喺 `http:` / `https:` 協議下執行  
   （`file://` 唔會註冊 — 瀏覽器限制）。
3. **install**：SW 將 `ASSETS` 列表寫入 Cache Storage（`cnc-toolkit-v1`）。
4. **之後訪問**：`fetch` 事件採 **Cache First**：
   - 命中快取 → 即時回應（離線可用）
   - 未命中 → 網絡請求，成功則寫入快取
   - 離線且未快取嘅導航 → 回退 `index.html`

### 2.3 對外連線一覽

| 連線 | 何時發生 | 說明 |
|------|----------|------|
| 靜態資源 GET | 載入／更新 | 同源 |
| WhatsApp / `mailto:` | 用戶按「送出詢價」 | **只開撰寫視窗**，唔經本站伺服器 |
| 產品 `url` 外連 | 用戶撳產品卡連結 | 可選，由 `CATALOG` 設定 |

**本應用唔會**：呼叫 REST API、寫入伺服器資料庫、上載用戶計算結果、收集分析流量（現況）。

### 2.4 端口與本機開發

```bash
# 建議用本地伺服器（啟用 PWA）
python3 -m http.server 8000
# → http://localhost:8000
```

直接雙擊 `index.html`（`file://`）計算功能正常，但 **SW／離線快取唔會啟用**。

### 2.5 CORS / Cookie / Session

唔適用。無跨域 API、無 Cookie Session、無 JWT。

---

## 3. 資料層（「DB」）

> **重要**：現行版本**冇** PostgreSQL / MySQL / MongoDB。  
> 「資料庫」角色由兩層組成：**內嵌 JS 常數表** + **瀏覽器 localStorage**。

### 3.1 邏輯資料模型

```
┌──────────────────────────────────────────────┐
│  靜態知識庫（打包喺 js/data.js、js/i18n.js）     │
│  · MATERIALS[]          材料切削參數           │
│  · HARDNESS_TABLE       硬度對照               │
│  · *_THREADS            螺紋規格               │
│  · IT_GRADES / FUND_DEV ISO 286 公差           │
│  · INSERT_*             ISO 1832 刀片碼        │
│  · CATALOG / SHOP_CONFIG 產品目錄（銷售）       │
│  · I18N                 六語言字典             │
└──────────────────────────────────────────────┘
                     │ 頁面載入時讀入記憶體
                     ▼
┌──────────────────────────────────────────────┐
│  執行期狀態（RAM，重整即失）                     │
│  · LANG / UNITS / theme                       │
│  · 各面板輸入值、聯動欄位                        │
│  · triEdited、tapStd、gcodeMode…              │
└──────────────────────────────────────────────┘
                     │ 用戶偏好持久化
                     ▼
┌──────────────────────────────────────────────┐
│  localStorage（同源、客戶端）                   │
│  · cnc-lang     語言代碼                       │
│  · cnc-units    metric | imperial             │
│  · cnc-theme    light | dark                  │
│  · cnc-inquiry  詢價單 JSON 陣列               │
└──────────────────────────────────────────────┘
```

### 3.2 主要實體（Schema 說明）

#### 材料 `MATERIALS[]`

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | string | 主鍵，對應 `I18N[lang].mat[id]` |
| `iso` | `P\|M\|K\|N\|S\|H` | ISO 513 群組 |
| `grade` | string | 牌號（語言中性） |
| `vcCarbide` | `[lo, hi]` | 硬質合金建議 vc（m/min） |
| `vcHss` | `[lo, hi]` \| null | HSS 建議；淬硬鋼為 null |
| `kc1` | number | 單位切削力 kc1.1（N/mm²） |
| `mc` | number | 切屑厚度指數 |
| `fzFactor` | number | 每齒進給係數 |
| `hardness` | string | 顯示用硬度範圍 |
| `density` | number | g/cm³（重量計算） |

#### 產品目錄 `CATALOG[]`

| 欄位 | 說明 |
|------|------|
| `sku` | 料號 |
| `type` | `mill` \| `insert` \| `drill` |
| `name` | 顯示名 |
| `iso` | 適用材料群組陣列 |
| `dia` | 可選 `[min, max]` mm |
| `coating` / `note` / `url` / `shape` | 展示與配對用 |

#### 詢價單（localStorage `cnc-inquiry`）

```json
[
  { "id": "EM-P-4F", "name": "4刃鍍層立銑刀", "ctx": "低碳鋼 · 銑削 · Ø10mm", "qty": 1 }
]
```

### 3.3 為何唔用真正 DB？

- 查表／計算結果**唔需要**多人共享或伺服器持久化
- 離線優先（廠房現場常無網）
- 維護成本低、無後端攻擊面
- 知識庫更新 = 改 `data.js` 後重新部署靜態檔

若將來要「帳號雲端同步參數／報價紀錄」，見 [§10](#10-未來架構路線圖可選)。

---

## 4. 後端（Backend）

### 4.1 現行狀態

**無 Backend。**

- 無 Node / Python / Go 服務
- 無 REST / GraphQL
- 無伺服器端渲染（SSR）
- 「業務邏輯」全部喺瀏覽器 JS

銷售詢價流程：

```
用戶加入詢價單 → localStorage
     → 撳送出 → 開啟 WhatsApp / mailto 預填內容
     → 用戶喺通訊 App 自行按傳送
```

### 4.2 靜態主機扮演嘅「偽後端」角色

| 能力 | 誰負責 |
|------|--------|
| HTTPS | GitHub Pages / CDN |
| 檔案傳輸 | 靜態主機 |
| 快取策略 | Service Worker（客戶端）|
| 路由 | 單頁；無伺服器路由 |

### 4.3 何時先需要 Backend？

僅當你要做例如：

- 用戶帳號、雲端保存常用參數
- 後台管理產品目錄（唔使改 code 部署）
- 伺服器記錄詢價、CRM 整合
- 授權金鑰、付費版功能閘

建議方案見 §10。

---

## 5. 前端（Frontend）

### 5.1 目錄結構

```
CNC 工程師工具包/
├── index.html              # 頁面骨架、14 個 tab-panel、設定彈窗
├── css/style.css           # 佈局、主題變數、元件樣式
├── js/
│   ├── i18n.js             # 六語言字典（最大檔）
│   ├── data.js             # 靜態知識庫 + 銷售設定
│   ├── calc.js             # 純計算函式（一律公制）
│   ├── export.js           # Canvas 截圖匯出
│   ├── shop.js             # 產品卡 + 詢價單
│   └── app.js              # UI 綁定、聯動、刷新
├── manifest.webmanifest    # PWA 清單
├── sw.js                   # Service Worker
├── icon-192.png / icon-512.png / apple-touch-icon.png
├── README.md               # 產品說明
└── HANDBOOK.md             # 本手冊
```

### 5.2 腳本載入順序（重要）

```html
<script src="js/i18n.js"></script>   <!-- 字典 -->
<script src="js/data.js"></script>   <!-- 常數表 -->
<script src="js/calc.js"></script>   <!-- 純函式 -->
<script src="js/export.js"></script>
<script src="js/shop.js"></script>   <!-- 依賴 t/fmt 等，由 app 稍後提供全域 -->
<script src="js/app.js"></script>    <!-- 最後：綁定 DOM、初始化 -->
```

全域命名空間：所有 `const`／`function` 掛喺 `window`（非 module）。**唔好改成 ES modules 除非同步改 SW 快取與 script type。**

### 5.3 UI 架構

```
.layout
├── aside.sidebar          導航 + 設定/主題
└── main.content
    └── section.tab-panel  ×14（.active 顯示一個）
            ├── .panel-header（標題 + 匯出）
            └── .grid-2 → .card（輸入 / 結果）
```

- 分頁切換：`.nav-item[data-tab]` ↔ `#tab-{id}`
- 國際化：`[data-i18n="key"]` + 執行期 `t("key")`
- 單位：`[data-ukind="len|vc|…"]` 標記可換算輸入
- 主題：`<html data-theme="dark|light">` + CSS Variables

### 5.4 狀態與刷新

| 全域狀態 | 用途 |
|----------|------|
| `LANG` | 當前語言 |
| `UNITS` | `metric` / `imperial` |
| `triEdited` | 三角形最近兩個已知欄 |
| `tapStd` | 攻牙標準 M/UNC/UNF/NPT |
| `INQUIRY` | 詢價單陣列（shop.js） |

語言／單位切換會呼叫 `refreshAll()`：重填材料選單、重算所有面板輸出，並盡量保留已輸入數值。

### 5.5 聯動輸入模式（銑／車／鑽）

```
vc ←→ n （經直徑 D）
fz/f ←→ vf （經 n、刃數 z）
```

規則：**最後編輯嘅欄位為準**（`syncMilling(changed)` 等）。  
虛線邊框（`.linked` / `.computed`）標示聯動或自動計算欄。

### 5.6 主題啟動防閃爍

`index.html` `<head>` 內聯腳本喺 CSS 前讀取 `localStorage`／系統偏好，寫入 `dataset.theme`。

### 5.7 PWA 前端介面

- `manifest.webmanifest`：`standalone`、圖示、主題色
- 註冊：`navigator.serviceWorker.register("sw.js")`
- 更新：改程式後必須把 `sw.js` 內 `CACHE` 版本號 +1（例 `v1`→`v2`）

---

## 6. 編碼規範與模組說明

### 6.1 設計原則

1. **計算與 UI 分離**：`calc.js` 只做純函式，唔掂 DOM。
2. **內部一律公制**：英制只係顯示／輸入轉換層（`toDisp` / `toMetricVal`）。
3. **字串唔寫死喺邏輯**：用戶可見文字走 `i18n.js`；牌號／代碼保持語言中性。
4. **零依賴**：方便離線、方便託管、方便審計。
5. **失敗要可預期**：無效輸入回 `null`／`"—"`／錯誤碼，唔 throw 打斷成頁。

### 6.2 命名約定

| 類型 | 約定 | 例子 |
|------|------|------|
| 常數表 | `UPPER_SNAKE` | `MATERIALS`, `IT_GRADES` |
| 函式 | camelCase | `rpmFromVc`, `solveRightTriangle` |
| DOM id | kebab + 模組前綴 | `mill-vc`, `tri-a`, `fit-d` |
| i18n key | 點分隔 | `nav.milling`, `note.deep5` |
| CSS 變數 | `--*` | `--bg`, `--accent` |

### 6.3 模組職責

#### `js/calc.js` — 計算核心

禁止：`document`、`localStorage`、`alert`。  
允許：數學、表內插、字串解析（英寸、刀片碼）。

主要匯出函式（節錄）：

- 切削：`rpmFromVc`, `feedMilling`, `mrrMilling`, `powerFromMrr`, `chipThinningFactor`…
- 表面：`surfaceRoughness`, `scallopHeight`
- 鑽攻：`drillPointLength`, `peckCycle`, `tapDrillCutting`
- 換算：`convertHardness`, `parseInches`, `nearestFraction`
- 幾何／公差：`solveRightTriangle`, `fitDeviation`
- 刀片：`decodeInsert`
- 插補：`interpFeedComp`
- 工具：`fmt`

#### `js/data.js` — 靜態庫

只放資料與設定，唔放業務流程。  
改銷售資料只改 `SHOP_CONFIG` / `CATALOG`。

#### `js/i18n.js` — 字典

結構：

```js
I18N = {
  "zh-Hant": { _name, ui:{}, iso:{}, mat:{}, advice:{}, insert?:{} },
  en: { … },
  …
}
```

新增語言：複製一整個語言區塊 → 改內容 → 選單自動出現。

#### `js/app.js` — 控制器

- DOM 查詢：`$` / `$$`
- `t()` / `tMat()` / `tIso()` / `tAdvice()`
- 單位系統、主題、設定彈窗
- 各 `updateXxx` / `syncXxx`
- `refreshAll()` / `updateAllOutputs()`

#### `js/export.js` — 截圖

1. `collectPanelData(panel)` 從 DOM 抽結構化內容  
2. Canvas 量高 → 繪製（2× 解析度）  
3. 手機：`navigator.share({ files })`；桌面：`<a download>`

#### `js/shop.js` — 銷售

- `matchProducts`：依 type / iso / dia 篩 CATALOG  
- 詢價單 CRUD + WhatsApp / Email 組裝

### 6.4 HTML 標記約定

```html
<!-- 可翻譯 -->
<span data-i18n="mill.title">…</span>

<!-- 可換單位嘅長度輸入 -->
<input id="mill-d" data-ukind="len" …>
<em data-ukind="len">mm</em>

<!-- 聯動欄 -->
<input id="mill-n" class="linked">
```

### 6.5 CSS 主題

`:root` = 夜間預設；`html[data-theme="light"]` 覆寫變數。  
新元件請用變數色，避免寫死 `#fff`／`#000`。

### 6.6 錯誤處理模式

| 情境 | 做法 |
|------|------|
| 計算輸入不足 | 結果顯示 `—` |
| 三角形非法 | `solveRightTriangle` → `{ error: "hyp"|"angles"|"invalid" }` |
| 英寸解析失敗 | 輸入加 `.input-error` |
| localStorage 被禁 | `try/catch` 吞掉，功能降級為僅當次會話 |

---

## 7. 計算核心與公式

### 7.1 單位不變式

所有 `calc.js` 函式假設：

- 長度：mm  
- 速度 vc：m/min  
- 進給 vf：mm/min；fz/f：mm  
- 功率：kW；扭矩：N·m  
- 粗糙度：µm；應力：MPa  

英制只喺 `app.js` 進出轉換。

### 7.2 常用公式

| 項目 | 公式 |
|------|------|
| 轉速 | \( n = 1000·vc / (π·D) \) |
| 銑削進給 | \( vf = n·z·fz \) |
| MRR（銑） | \( Q = ap·ae·vf / 1000 \)（cm³/min） |
| 比切削力 | \( kc = kc_{1.1} · hm^{-mc} \) |
| 功率 | \( Pc = Q·kc / 60000 \)（kW） |
| 扭矩 | \( M = 9550·Pc / n \) |
| 切屑變薄 | \( RCTF = 1/\sqrt{1-(1-2·ae/D)^2}\; (ae/D<0.5) \) |
| 理論 Ra | \( Ra ≈ f^2/(32·r_ε) \)（µm，f、r 為 mm） |
| Taylor | \( T_2/T_1 = (v_1/v_2)^{1/n} \) |
| 攻牙底孔 | 切削 \( D-P \)；擠壓 \( ≈ D-P/2 \) |
| 鑽尖長 | \( L=(D/2)/\tan(θ/2) \) |
| 插補補償 | \( K = D_c / D_{target} \)；程式進給 \( = vf_{edge}·K \) |

### 7.3 參考標準（內建表）

- ISO 513 — 材料群組  
- ASTM E140 / ISO 18265 — 硬度（近似）  
- ISO 286 — 極限偏差  
- ISO 1832 — 可轉位刀片代碼  
- ISO 261 — 公制螺紋  

建議值僅供起始參考，實際以刀具商目錄為準。

---

## 8. 開發、測試、部署

### 8.1 本機開發

```bash
cd "/Users/nihil/Desktop/CNC 工程師工具包"
python3 -m http.server 8000
# 瀏覽器開 http://localhost:8000
```

修改後硬性重新整理（必要時清 Cache／升 `CACHE` 版本）。

### 8.2 建議測試清單

- [ ] 銑削：改 vc ↔ n、fz ↔ vf 聯動正確  
- [ ] 單位切換：數值與標籤同步、結果唔爆  
- [ ] 六語言：側欄／結果卡／刀具建議無缺 key  
- [ ] 三角形：「?」掣清空並重算  
- [ ] 公差：Ø25 H7 → ES +21 / EI 0  
- [ ] 英寸：`1 3/8`、`25/64`、`0.375`  
- [ ] 匯出截圖：桌面下載／手機分享  
- [ ] PWA：離線後仍可開主要頁面  
- [ ] 詢價：加入 → localStorage → WhatsApp/Email 視窗  

語法快速檢查：

```bash
node --check js/calc.js
node --check js/app.js
node --check js/i18n.js
```

### 8.3 部署（GitHub Pages 現況）

1. push 到 `main`  
2. Settings → Pages → 以 `main` / root 發佈  
3. 網址形如 `https://<user>.github.io/cnc-toolkit/`  
4. **改檔後更新 `sw.js` 的 `CACHE` 字串**，否則用戶可能長期見到舊版

其他：Cloudflare Pages、Netlify、Vercel 靜態部署同樣適用。

### 8.4 發佈檢查表

- [ ] [`CHANGELOG.md`](CHANGELOG.md) 已更新（`[Unreleased]` 或新版本區塊；大型功能寫入 **Added**）
- [ ] `version.json`、`js/version.js`、`sw.js` `CACHE`、`manifest.webmanifest` 版本一致
- [ ] `SHOP_CONFIG` 是否已改成真公司資料（若啟用銷售）  
- [ ] `CACHE` 版本已 bump  
- [ ] `CHANGELOG.md` 已列入 `sw.js` 的 `ASSETS`（離線可讀）
- [ ] HTTPS 可用（分享圖／PWA 需要）  
- [ ] README 線上連結正確  

---

## 9. 擴展指南

### 9.1 加一種材料

1. `data.js` 的 `MATERIALS` 加一筆（含 `id`、`iso`、切削參數、`density`）  
2. `i18n.js` **每個語言**的 `mat[id]` 加譯名  
3. （可選）`advice` 已按 ISO 群組，通常唔使改  

### 9.2 加一種語言

1. 複製 `I18N.en`（或 `zh-Hant`）成新 key（例 `ja`）  
2. 翻譯 `ui` / `iso` / `mat` / `advice`（及 insert 相關）  
3. 語言選單會自動列出 `_name`  

### 9.3 加一個計算工具

1. `calc.js` 加純函式  
2. `index.html` 加 nav + `section#tab-xxx`  
3. `app.js` 加 `updateXxx`、事件、`refreshAll` 呼叫  
4. `i18n.js` 六語言補 key  
5. `sw.js` 若有新檔案加入 `ASSETS`  

### 9.4 改銷售目錄

只改 `data.js`：

```js
const SHOP_CONFIG = {
  business: "你的刀具公司",
  whatsapp: "85298765432",
  email: "sales@example.com",
  currency: "HK$",
};
```

---

## 10. 未來架構路線圖（可選）

若產品要變成「帳號 + 雲端參數 + 後台目錄」，建議演進如下（**非現況**）：

```
┌──────────┐     HTTPS/JSON      ┌──────────────┐
│ Frontend │ ◀────────────────▶ │ API Gateway  │
│ (現有SPA │                     │ (Auth + REST)│
│  可保留) │                     └──────┬───────┘
└──────────┘                            │
                                        ▼
                               ┌────────────────┐
                               │ Backend        │
                               │ Node/Go/…      │
                               └──────┬─────────┘
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                    PostgreSQL    Object Store   CRM Webhook
                    用戶/參數      匯出圖檔        詢價單
```

| 階段 | 內容 |
|------|------|
| A | 維持靜態；產品目錄改由 JSON 檔 CDN 拉取 |
| B | 加輕量 Backend：詢價 POST 入 DB／Email  
| C | 用戶登入、同步常用刀具參數 |
| D | 後台 CMS 管理 CATALOG |

遷移時建議：**保留 `calc.js` 不變**（可共用喺前端同後端單元測試），只把 `data.js` 動態化。

---

## 11. 安全、私隱、免責

### 安全

- 無伺服器攻擊面；主要風險係**靜態託管帳號**同**供應鏈**（依賴為零，風險低）  
- 外連產品 URL 請用可信網域；`rel="noopener"` 已用於新分頁  
- XSS：目前內容多為自有數字／字典；若將來顯示用戶自訂 HTML，必須跳脫  

### 私隱

- 計算數據唔上傳  
- localStorage 僅存語言、單位、主題、詢價單  
- 詢價內容經用戶裝置上嘅 WhatsApp／Email 送出  

### 免責

所有切削建議、公差、刀片解讀僅供參考。實際加工請依刀具商目錄、機床剛性、夾持與現場經驗驗證。錯誤參數可能導致刀具損壞或工件報廢。

---

## 附錄 A — localStorage Key

| Key | 型別 | 說明 |
|-----|------|------|
| `cnc-lang` | string | 例 `zh-Hant`, `en` |
| `cnc-units` | `metric` \| `imperial` | |
| `cnc-theme` | `light` \| `dark` | |
| `cnc-inquiry` | JSON array | 詢價項目 |

## 附錄 B — 單位換算係數（顯示層）

| kind | 公制 | 英制 | 係數（公→英） |
|------|------|------|----------------|
| len | mm | in | 1/25.4 |
| vc | m/min | SFM | 3.28084 |
| feedRate | mm/min | in/min | 1/25.4 |
| mrr | cm³/min | in³/min | 1/16.387064 |
| power | kW | HP | 1.3410221 |
| torque | N·m | lbf·ft | 0.7375621 |
| rough | µm | µin | 39.370079 |
| stress | MPa | ksi | 0.1450377 |

## 附錄 C — 相關文件

- [README.md](README.md) — 產品功能與使用說明  
- [js/calc.js](js/calc.js) — 公式實作  
- [js/data.js](js/data.js) — 知識庫與銷售設定  
- [sw.js](sw.js) — 離線快取  

---

*手冊完。若需要把某章拆成獨立 API Spec／ER 圖（未來 Backend），或要我根據本手冊實際加後端雛形，切換到 Agent 模式再指定即可。*
