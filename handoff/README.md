# CNC Toolkit — icon 換裝交付包

搬去 Cursor 嘅做法：整個 `handoff/` 資料夾拖入 repo 根目錄，然後照下面五步改四個檔。
每步都係「刪一段、貼一段」，冇任何新依賴、冇 build step。

Repo: Nihil-Cyber/cnc-toolkit @ main

---

## 檔案清單

    cnc-icons-sprite.svg      15 個 <symbol>，側欄 icon（貼入 index.html）
    nav-items.html            15 個改好嘅 .nav-item button（覆蓋 index.html:37-50，含新增工程參考資料）
    nav-ico.css               .nav-ico 樣式（貼入 css/style.css）
    icon-192.png              PWA icon（覆蓋根目錄同名檔）
    icon-512.png              PWA icon（覆蓋）
    apple-touch-icon.png      iOS 主畫面（覆蓋）
    icon-maskable-512.png     新檔，放根目錄
    logo.svg                  Logo（精細版，≥64px 用：README、登入頁）
    logo-mark-42.svg          Logo（簡化版，側欄 .brand-icon 42px 用）

---

## 1 · index.html — 貼 sprite

喺 `<body>` 開標籤之後、`<div class="layout">` 之前，貼入 `cnc-icons-sprite.svg` 全份內容。
它 width/height 都係 0，唔佔版面。

## 2 · index.html — 換走側欄 emoji

用 `nav-items.html` 全份內容覆蓋 index.html 第 37–50 行。裡面有 15 個 `.nav-item` —— 最後一個 `data-tab="reference"`（工程參考資料）係新加，如果你嘅 tab id 唔係 `reference`，改返你自己嗰個，同時 i18n 要加 `nav.reference` 一條。
`data-tab`、`data-i18n`、`active` 全部原樣保留，i18n 同 tab 切換邏輯唔用改。

## 3 · css/style.css — 加 .nav-ico

把 `nav-ico.css` 內容加到 `.nav-item.active` 規則之後。
線條用 `currentColor`，所以 `.nav-item` / `.active` / `html[data-theme="light"]` 嘅顏色全部自動跟；
重點色用 `var(--accent)`，即係 `:root` 已有嗰個。

980px 以下側欄收窄、`.nav-item span` 隱藏時，icon 會居中留低 —— 原本 `font-size: 18px` 撐 emoji 嘅寫法已經唔需要，但留住都無害。

## 4 · 換 icon 檔

根目錄覆蓋 `icon-192.png`、`icon-512.png`、`apple-touch-icon.png`，加入 `icon-maskable-512.png`。

## 4b · 側欄 logo（.brand-icon）

`index.html` 嘅 `.brand-icon` 現時係漸變方塊加 emoji。換成：

    <div class="brand-icon">
      <!-- 貼 logo-mark-42.svg 內容，去掉 width/height 屬性 -->
    </div>

`css/style.css` 嘅 `.brand-icon` 改成：

    .brand-icon {
      width: 42px; height: 42px;
      display: grid; place-items: center;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
    }
    .brand-icon svg { width: 30px; height: 30px; }

（原本 `font-size: 24px` 同 `linear-gradient` 可以刪。想保留漸變底就只改 `color: #fff`，其餘唔動。）

大尺寸場合（README、分享圖、登入頁）用 `logo.svg` —— 同一個圖形，但線分五級、有剖面線同中心線。

## 5 · manifest + sw

`manifest.webmanifest` 嘅 icons 改成三項 —— 原本兩項寫 `"any maskable"`，但佢哋係滿版設計，
做 maskable 會被圓形遮罩切到刀頭，所以拆開：

    "icons": [
      { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
      { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
      { "src": "icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
    ]

`sw.js`：ASSETS 加一行 `"./icon-maskable-512.png",`，同時把 `const CACHE = "cnc-toolkit-v1"` 升去 `v2`，否則舊 icon 會由快取繼續派出。

---

## Emoji → symbol id 對照

| 原本 | tool | symbol |
| --- | --- | --- |
| 🌀 | 銑削計算 | `#ic-milling` |
| 🔩 | 車削計算 | `#ic-turning` |
| 🕳️ | 鑽孔・攻牙 | `#ic-drilling` |
| ✨ | 表面粗糙度 | `#ic-finish` |
| 💎 | 硬度換算 | `#ic-hardness` |
| 📏 | 英寸換算 | `#ic-inch` |
| 📐 | 直角三角形 | `#ic-triangle` |
| 🎯 | 公差配合 | `#ic-fits` |
| ⚖️ | 參數對比 | `#ic-compare` |
| 🛠️ | 刀具建議 | `#ic-advisor` |
| 💠 | 刀片代碼 | `#ic-insert` |
| 🔄 | 插補補償 | `#ic-interp` |
| ⌨️ | G-code | `#ic-gcode` |
| ⚖️ | 材料重量 | `#ic-weight` |
| — | 工程參考資料 | `#ic-reference` |

參數對比同材料重量原本撞用 ⚖️，現已分開（雙柱對比 / 料塊加重量箭頭）。

---

## 未動嘅 emoji

`.brand-icon`（側欄左上）同 theme toggle 嘅 emoji 我冇改。想換嘅話，brand 可以直接用 app icon 嘅立銑刀圖形。

---

## 給 Cursor 嘅提示（可直接貼入 chat）

> 讀 handoff/README.md，照住 1–5 步改 index.html、css/style.css、manifest.webmanifest、sw.js。
> 只做檔案內指定嘅替換，唔要改動其他 markup、CSS 或 JS 邏輯；nav-item 嘅 data-tab / data-i18n / active class 必須原樣保留。
