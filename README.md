# CNC Engineer's Toolkit · CNC 工程師工具包

A pure front-end (HTML / CSS / JavaScript) collection of CNC machining calculators — no dependencies, no build step, installable as an offline PWA.
純前端(HTML / CSS / JavaScript)嘅 CNC 加工計算器合集,零依賴、免建置,可安裝為離線 PWA。

**🔗 Live demo / 線上試用:** https://nihil-cyber.github.io/cnc-toolkit/

**English** | [中文](#中文)

---

## English

### Highlights

- **14 tools** covering milling, turning, drilling/tapping, surface finish, hardness, tolerances, insert codes, interpolation, G-code and more.
- **6 languages** — Traditional Chinese, Simplified Chinese, English, Deutsch, Français, हिन्दी (material names and the tool-advice knowledge base are fully translated).
- **Metric / Imperial** with automatic conversion (mm↔inch, m/min↔SFM, cm³/min↔in³/min, kW↔HP, N·m↔lbf·ft, µm↔µin, MPa↔ksi). Values already entered convert on toggle; internal calculation is always metric.
- **Light / Dark theme**, following system preference by default.
- **Installable & offline** — a Service Worker caches everything; works with no network.
- Language, unit and theme choices persist in `localStorage`.

### Tools

| Tool | What it does |
|------|--------------|
| 🌀 Milling | Speed, feed, material removal rate (MRR), cutting power, torque, chip-thinning compensation |
| 🔩 Turning | Speed, MRR, power, theoretical surface roughness Ra/Rz |
| 🕳️ Drilling & Tapping | Drill parameters & cut time, drill-point length & break-through depth, peck (G83) cycle time, deep-hole warnings; tap-drill lookup — Metric M / UNC / UNF / NPT taper pipe, cutting & forming taps |
| ✨ Surface Finish | Feed ↔ Ra bidirectional; ball-nose scallop height ↔ stepover |
| 💎 Hardness | HRC · HV · HB · HRB conversion + tensile-strength estimate (ASTM E140) |
| 📏 Inch Conversion | Fraction/decimal inch ⇄ mm (accepts `1 3/8`, `5/16`, `0.375`…), nearest-fraction approximation + error, 1/64 table |
| 📐 Right Triangle | Solve remaining sides/angles/area/perimeter from any two knowns, with diagram |
| 🎯 Fits & Tolerances | ISO 286 limit deviations (24 tolerance bands, 1–500 mm) + H6–H9 table |
| ⚖️ Parameter Compare | Side-by-side efficiency, power, Taylor tool-life change; **ROI**: cut time, tool life and cost per part with batch savings |
| 🛠️ Tool Advisor | By ISO 513 group × operation → grade, coating, geometry, coolant and starting parameters |
| 💠 Insert Code | Decode ISO 1832 indexable-insert codes (shape / clearance / tolerance / type / edge length / thickness / corner radius + edge prep / hand) with max-ap and finishing-feed tips |
| 🔄 Interpolation Comp | Circular/helical interpolation feed compensation (internal boring / external), comp factor, programmed feed, uncompensated fz, helix ramp angle |
| ⌨️ G-code | Generator for bolt-circle drilling (G81/G83), helical boring (G2/G3), face milling (zigzag) — copyable output, metric/imperial (G21/G20) |
| ⚖️ Material Weight | Block / round bar / tube volume × density → per-piece & batch weight (kg/lb) and material cost from a per-kg price (for quoting) |

> On the Milling / Turning / Drilling panels, **spindle speed `n` and feed rate `vf` are directly editable** and link two-way with `vc`, `fz`/`f`: edit `vc` → `n` updates and vice-versa; edit `fz` → `vf` updates and vice-versa (last edited field wins).

### Built-in material library

16 common materials across the six ISO 513 groups:

- **P (steel):** S45C, SCM440, SKD11 (annealed)
- **M (stainless):** SUS304, SUS316L, 17-4PH
- **K (cast iron):** FC250, FCD450
- **N (non-ferrous):** 6061-T6, 7075-T6, brass, copper
- **S (superalloys / Ti):** Ti-6Al-4V, Inconel 718
- **H (hardened steel):** HRC 48–55, HRC 56–62

Each carries a recommended cutting-speed range, specific cutting force `kc1.1`, chip-thickness exponent `mc`, feed factor and density.

### Screenshot export

Each panel has a **📸 Export** button that renders the current inputs, results, tables and notes into a PNG (matching the active theme). On mobile it opens the system share sheet (save to Photos / send to a colleague); on desktop it downloads the PNG. The engine is native Canvas — no external dependency, works offline.

### Run locally

```bash
open index.html
```

```bash
python3 -m http.server 8000
```

Then browse `http://localhost:8000`. Opening via `file://` works for all calculations but does **not** enable the offline PWA cache (a browser restriction); serve over http/https for that.

### Install as a PWA (offline)

Served over **http/https**, the app registers a Service Worker and caches all assets:

- **Mobile:** Chrome/Safari → "Add to Home Screen" → opens full-screen like an app, works offline.
- **Desktop:** Chrome/Edge → the "Install" icon in the address bar → standalone window.
- **Offline:** after the first load it runs with no network (all calculation is client-side).

> After changing any `js/`, `css/` or `index.html`, bump the `CACHE` version in [sw.js](sw.js) (e.g. `v1`→`v2`) so users get the update on next visit.

### Selling with the toolkit (optional)

The toolkit doubles as a lead funnel for a cutting-tool business: contextual product cards on the **Tool Advisor** and **Insert Code** tabs, an **ROI** trigger on **Parameter Compare**, and a floating **inquiry list** that is sent via WhatsApp / Email. To activate, edit `SHOP_CONFIG` and `CATALOG` in [js/data.js](js/data.js):

```js
const SHOP_CONFIG = {
  business: "Your Tool Co.",   // display name
  whatsapp: "",                // country code + number, e.g. "85298765432" (empty = Email only)
  email: "sales@example.com",
  currency: "US$",
};
```

### Key formulas

- Speed: `n = 1000·vc / (π·D)`
- Milling feed: `vf = n·z·fz`; MRR: `Q = ap·ae·vf / 1000`
- Cutting power: `Pc = Q·kc / 60000`, `kc = kc1.1 · hm^(−mc)`
- Theoretical roughness: `Ra ≈ f² / (32·rε)`; `Rz ≈ f² / (8·rε)`
- Chip thinning: `RCTF = 1 / √(1 − (1 − 2·ae/D)²)`
- Taylor tool life: `vc·Tⁿ = C` (carbide `n ≈ 0.25`)
- Tap drill: cutting `= D − P`; forming `≈ D − P/2` (UNC/UNF use `P = 25.4/TPI`; NPT uses a standard-drill lookup)
- Material weight: `W (kg) = volume (cm³) × density (g/cm³) / 1000`; cost `= W × price/kg`
- Drill point length: `L = (D/2) / tan(point angle / 2)`; through depth `= hole depth + L`
- Peck (G83): pecks `= ⌈depth / q⌉`; cycle time `= feed time + retract/return (rapid) time`
- Interpolation comp: centre circle `D_c = target Ø ∓ tool Ø` (internal −, external +); factor `K = D_c / target Ø`; programmed feed `= target edge feed × K`

### File structure

```
index.html            Page structure
css/style.css         Dark / light theme styles
js/i18n.js            Six-language dictionary (UI, material names, advice knowledge base)
js/data.js            Material library, hardness table, thread specs, product catalog
js/calc.js            Calculation core (pure functions, always metric)
js/export.js          Screenshot export engine (Canvas + Web Share / download)
js/shop.js            Sales: contextual product cards + inquiry list
js/app.js             UI logic (i18n, theme, unit system, calculation bindings)
manifest.webmanifest  PWA manifest (name, icons, theme color)
sw.js                 Service Worker (offline app-shell cache)
icon-192/512.png      PWA icons; apple-touch-icon.png = iOS home-screen icon
```

**Add a language:** copy a language block in `js/i18n.js` (e.g. `en`), change the key values, and the language menu picks it up automatically.

### Disclaimer

All suggested values are starting references only. Adjust to your tool maker's catalog, machine rigidity and workholding for real cutting.

### License

No license specified yet — add one (e.g. MIT) if you want others to reuse the code.

---

## 中文

[English](#english) | **中文**

### 特點

- **14 個工具**,涵蓋銑削、車削、鑽孔・攻牙、表面粗糙度、硬度、公差、刀片代碼、插補補償、G-code 等。
- **六種語言** — 繁體中文、简体中文、English、Deutsch、Français、हिन्दी(材料名稱同刀具建議知識庫全文翻譯)。
- **公制 / 英制**自動換算(mm↔inch、m/min↔SFM、cm³/min↔in³/min、kW↔HP、N·m↔lbf·ft、µm↔µin、MPa↔ksi);切換時已輸入嘅數值自動換算,內部計算一律公制。
- **日間 / 夜間主題**,預設跟隨系統偏好。
- **可安裝、可離線** — Service Worker 快取全部資源,無網路都用得。
- 語言、單位、主題選擇儲存喺 `localStorage`,下次自動套用。

### 功能一覽

| 工具 | 功能 |
|------|------|
| 🌀 銑削計算 | 轉速、進給、材料移除率 (MRR)、切削功率、扭矩、切屑變薄補償 |
| 🔩 車削計算 | 轉速、MRR、功率、理論表面粗糙度 Ra/Rz |
| 🕳️ 鑽孔・攻牙 | 鑽孔參數與切削時間、鑽尖長度與貫穿總深、啄鑽 (G83) 循環時間、深孔警示;攻牙底孔速查 — 公制 M / UNC / UNF / NPT 錐管牙,切削/擠壓攻牙 |
| ✨ 表面粗糙度 | 進給 ↔ Ra 雙向換算;球刀殘料高度 (scallop) ↔ 行距換算 |
| 💎 硬度換算 | HRC · HV · HB · HRB 互換 + 抗拉強度估算(ASTM E140 內插) |
| 📏 英寸換算 | 分數/小數英寸 ⇄ 毫米(支援 `1 3/8`、`5/16`、`0.375` 等格式)、最近分數近似 + 誤差、1/64 對照表 |
| 📐 直角三角形 | 任意輸入兩個已知值(至少一條邊)求其餘邊長、角度、面積、周長,附示意圖 |
| 🎯 公差配合 | ISO 286 極限偏差查詢(24 個公差帶,1–500 mm)+ H6–H9 對照表 |
| ⚖️ 參數對比 | 兩組銑削參數並排對比:效率、功率、Taylor 刀具壽命變化;**成本效益 (ROI)**:每件加工時間、刀具壽命、每件成本與整批節省 |
| 🛠️ 刀具建議 | 依 ISO 513 材料群組 × 加工類型,建議刀具材質、塗層、幾何、冷卻與起始參數 |
| 💠 刀片代碼 | 解讀可轉位刀片 ISO 1832 代碼(形狀/後角/公差/型式/切刃長/厚度/刀尖 R + 刃口處理/方向),附最大切深 ap 與精加工進給建議 |
| 🔄 插補補償 | 圓弧/螺旋插補進給補償:內圓(鏜孔)/外圓,補償係數、程式進給、未補償時實際 fz、螺旋斜升角 |
| ⌨️ G-code | G-code 產生器:鑽孔陣列(螺栓圓,G81/G83)、螺旋鏜孔(G2/G3)、面銑走刀(zigzag),即時可複製,支援公/英制 (G21/G20) |
| ⚖️ 材料重量 | 方料 / 圓棒 / 管料體積 × 密度 → 單件與整批重量 (kg/lb),依每 kg 單價估算材料成本(報價用) |

> 銑削/車削/鑽孔面板嘅**主軸轉速 `n` 同進給速度 `vf` 均可直接輸入**,與 `vc`、`fz`/`f` 雙向聯動:改 `vc` 自動算 `n`、改 `n` 反推 `vc`;改 `fz` 自動算 `vf`、改 `vf` 反推 `fz`(以最後編輯嘅欄位為準)。

### 內建材料庫

涵蓋 ISO 513 六大群組共 16 種常用材料:

- **P(鋼)**:S45C、SCM440、SKD11(退火)
- **M(不鏽鋼)**:SUS304、SUS316L、17-4PH
- **K(鑄鐵)**:FC250、FCD450
- **N(非鐵)**:6061-T6、7075-T6、黃銅、紫銅
- **S(耐熱合金)**:Ti-6Al-4V、Inconel 718
- **H(淬硬鋼)**:HRC 48–55、HRC 56–62

每種材料含建議切削速度範圍、單位切削力 `kc1.1`、切屑厚度指數 `mc`、進給係數與密度。

### 匯出截圖

每個分頁右上角有「📸 匯出截圖」掣,將當前輸入、結果、表格同備註繪成一張 PNG(跟隨主題配色):手機行系統分享面板(存相簿或傳同事),電腦直接下載。引擎用原生 Canvas,無外部依賴,離線可用。

### 本機執行

```bash
open index.html
```

```bash
python3 -m http.server 8000
```

然後瀏覽 `http://localhost:8000`。直接 `file://` 打開所有計算一樣正常,但**唔會**啟用離線 PWA 快取(瀏覽器限制),要離線就用 http/https 開。

### 離線安裝(PWA)

透過 **http/https** 打開時,自動註冊 Service Worker 快取全部資源:

- **手機**:Chrome/Safari →「加到主畫面」→ 全螢幕似 App,離線用得。
- **電腦**:Chrome/Edge → 網址列「安裝」圖示 → 獨立視窗程式。
- **離線**:首次載入後,關網路都照用(計算全部喺前端)。

> 改咗任何 `js/`、`css/` 或 `index.html` 之後,把 [sw.js](sw.js) 最上面嘅 `CACHE` 版本號 +1(例 `v1`→`v2`),使用者下次開啟就更新快取。

### 結合銷售(可選)

工具包同時係刀具生意嘅引流漏斗:**刀具建議**同**刀片代碼**分頁有情境產品卡、**參數對比**有 **ROI** 觸發、浮動**詢價單**經 WhatsApp / Email 送出。啟用只需改 [js/data.js](js/data.js) 嘅 `SHOP_CONFIG` 同 `CATALOG`:

```js
const SHOP_CONFIG = {
  business: "你的刀具公司",     // 顯示名稱
  whatsapp: "",                // 國碼+號碼,例 "85298765432"(留空則只用 Email)
  email: "sales@example.com",
  currency: "US$",
};
```

### 主要公式

- 轉速:`n = 1000·vc / (π·D)`
- 銑削進給:`vf = n·z·fz`;MRR:`Q = ap·ae·vf / 1000`
- 切削功率:`Pc = Q·kc / 60000`,`kc = kc1.1 · hm^(−mc)`
- 理論粗糙度:`Ra ≈ f² / (32·rε)`;`Rz ≈ f² / (8·rε)`
- 切屑變薄:`RCTF = 1 / √(1 − (1 − 2·ae/D)²)`
- Taylor 刀具壽命:`vc·Tⁿ = C`(硬質合金 `n ≈ 0.25`)
- 攻牙底孔:切削 `= D − P`;擠壓 `≈ D − P/2`(UNC/UNF 以 `P = 25.4/TPI` 代入;NPT 用標準底孔查表)
- 材料重量:`W (kg) = 體積 (cm³) × 密度 (g/cm³) / 1000`;成本 `= W × 每 kg 單價`
- 鑽尖長度:`L = (D/2) / tan(鑽尖角 / 2)`;通孔貫穿深 `= 孔深 + L`
- 啄鑽 (G83):啄鑽次數 `= ⌈孔深 / q⌉`;循環時間 `= 進給時間 + 退屑回程(快移)時間`
- 插補進給補償:中心圓 `D_c = 目標圓 ∓ 刀徑`(內圓 −、外圓 +);補償係數 `K = D_c / 目標圓`;程式進給 `= 目標刃口進給 × K`

### 檔案結構

```
index.html            頁面結構
css/style.css         深色/淺色主題樣式
js/i18n.js            六語言字典(UI 文字、材料名、刀具建議知識庫)
js/data.js            材料庫、硬度表、螺紋規格、產品目錄
js/calc.js            計算核心(純函式,一律公制)
js/export.js          截圖匯出引擎(Canvas 繪製 + Web Share / 下載)
js/shop.js            銷售:情境產品卡 + 詢價單
js/app.js             UI 互動邏輯(i18n、主題、單位系統、計算綁定)
manifest.webmanifest  PWA 資訊清單(名稱、圖示、主題色)
sw.js                 Service Worker(離線快取 app shell)
icon-192/512.png      PWA 圖示;apple-touch-icon.png = iOS 主畫面圖示
```

**新增語言**:喺 `js/i18n.js` 複製一個語言區塊(例如 `en`),改 key 同翻譯內容即可,語言選單會自動出現。

### 免責聲明

所有建議值僅供起始參考,實際加工請依刀具商目錄、機床剛性同夾持狀況修正。

### 授權

暫未指定授權條款 —— 如想他人重用,可自行加一個(例如 MIT)。
