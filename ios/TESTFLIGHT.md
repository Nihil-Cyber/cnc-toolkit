# TestFlight 發佈指南（Developer Program）

把 **CNC 工具包** 發給自己或測試員安裝，唔使上架 App Store。前提：**已加入 [Apple Developer Program](https://developer.apple.com/programs/)**（約 US$99/年），審批通常 24–48 小時。

---

## 0. 一次性準備

| 項目 | 本專案現況 | 你要做 |
|------|------------|--------|
| Bundle ID | `com.nihilcyber.cnctoolkit` | 若 Apple 上已被佔用，改 Xcode **Bundle Identifier**（全小寫、唯一） |
| 顯示名稱 | CNC 工具包 | 可改 `Info.plist` → `CFBundleDisplayName` |
| 版本 | Marketing `1.6.0`，Build `1` | 與 `version.json` 對齊；**每次上傳 TestFlight 必須遞增 Build** |
| App Icon | `Assets.xcassets` 尚為佔位 | 用根目錄 `icon-512.png` 或 `apple-touch-icon.png 放大至 **1024×1024** 拖入 App Icon |
| 帳號 | — | [App Store Connect](https://appstoreconnect.apple.com) 用 **同一個** Developer Apple ID |

---

## 1. 在 App Store Connect 建立 App

1. 登入 [App Store Connect](https://appstoreconnect.apple.com) → **我的 App** → **＋** → **新建 App**。
2. 平台：**iOS**。
3. 名稱：例如 `CNC 工程師工具包`（商店名，可與主畫面不同）。
4. 主要語言：繁體中文（或英文）。
5. **套装 ID**：選與 Xcode 一致的 ID（若列表冇，先到 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) → **Identifiers** → **＋** → **App IDs** → 填 `com.nihilcyber.cnctoolkit`）。
6. SKU：任意唯一字串，例如 `cnc-toolkit-ios`。
7. 使用者存取：**完整存取**（個人開發者一般只有此選項）。

建立後先唔使填齊所有商店資料；TestFlight **內部測試** 可以較快開始。

---

## 2. Xcode 簽名與建置

### 用 Xcode 打開專案（唔好開錯層）

1. **File → Open…**（或雙擊 Finder 裡的藍色圖示）
2. 選 **`CNC 工程師工具包/ios/CNCToolkit.xcodeproj`**  
   - ✅ 要開 **`.xcodeproj`**  
   - ❌ 唔好只開 repo 根目錄、唔好開 `ios` 資料夾當工程

終端（路徑含空格請加引號）：

```bash
cd "/path/to/CNC 工程師工具包"
./scripts/sync-ios-assets.sh
open ios/CNCToolkit.xcodeproj
```

若見 **「Project … does not exist at ios/CNCToolkit.xcodeproj」**：多數係 **Xcode Cloud** 或 clone 的 repo **冇 `ios/`**（尚未 push 上 Git）。本機請用上面方式直接開 `.xcodeproj`；Cloud 須先 commit + push `ios/`。

```bash
cd "/path/to/CNC 工程師工具包"
./scripts/sync-ios-assets.sh
```

1. Target **CNCToolkit** → **Signing & Capabilities**
   - ✅ Automatically manage signing
   - **Team**：你的 **Developer Program** 團隊（唔好選 Personal Team）
2. **General**
   - **Version**：與 `version.json` 相同（例如 `1.6.0`）
   - **Build**：整數，每次上傳 +1（`1` → `2` → `3`…）
3. 上方 Scheme 選 **Any iOS Device (arm64)**（唔好選 Simulator）。
4. 選單 **Product → Archive**（成功後會開 **Organizer**）。

若 Archive 灰色：先改裝置為 **Any iOS Device**，或先 **⌘B** Build 一次。

---

## 3. 上傳到 App Store Connect

在 **Organizer** 選剛才的 Archive → **Distribute App**：

1. **App Store Connect** → Next  
2. **Upload** → Next  
3. 選項一般保持預設（含符號上傳、自動管理簽名）→ Next  
4. **Upload**

完成後等 **5–30 分鐘**，App Store Connect 會收到建置版本。郵件主旨常為「App Store Connect: Version … has completed processing」。

---

## 4. TestFlight 設定

App Store Connect → 你的 App → **TestFlight** 分頁。

### A. 內部測試（最快，最多 100 人，須為 App Store Connect 團隊成員）

1. **內部測試** → 建立群組（或預設 Internal Testing）。
2. 選剛處理完成的 **建置版本**。
3. 團隊成員 iPhone 裝 **TestFlight** App，用同一 Apple ID 登入即可見到安裝。

內部測試通常 **唔使** Beta App 審核。

### B. 外部測試（給朋友／客戶，最多 1 萬人）

1. **外部測試** → 建立群組 → 加測試員 **email**。
2. 第一次需填 **Beta App 描述**、測試說明；Apple 會 **Beta 審核**（通常 1–2 天）。
3. 測試員收 email → 裝 TestFlight → 接受邀請 → 安裝。

---

## 5. 合規與審核常見問題

### 出口合規（上傳時 Xcode 會問）

本 App 為離線計算工具、無自訂加密通訊：

- 一般選 **否**，不使用除標準 HTTPS/TLS 以外的加密  
- 或在 App Store Connect **App 資訊** → **出口合規** 聲明

### App 隱私（Privacy Nutrition Label）

- **不收集** 用戶資料（計算在本地、`localStorage` 僅本機）
- 問卷可選：不收集資料 / Data Not Collected
- **隱私政策／使用條款 URL**（若 Connect 要求填）：  
  `https://nihil-cyber.github.io/cnc-toolkit/disclaimer.html`  
  （部署後與 App 內「設定 → 免責聲明 → 在瀏覽器開啟完整頁面」同一內容）

### 審核備註（若被問「是否只是網站」）

可寫：離線內建資源、無載入遠端 URL；具原生分享 PNG、儲存 G-code；面向 CNC 工程師離線工具。

---

## 6. 之後每次更新

1. 改 `js/` / `index.html` → `version.json`、`CHANGELOG.md`  
2. `./scripts/sync-ios-assets.sh`  
3. Xcode：**Version**（有功能變更可改）+ **Build**（必須 +1）  
4. **Product → Archive** → Upload  
5. TestFlight 選新 Build → 測試員 TestFlight 內點更新  

TestFlight 建置 **90 天** 有效；過期需上傳新 Build。

---

## 7. 故障排除

| 現象 | 處理 |
|------|------|
| No accounts with App Store Connect access | 用已付費 Developer 的 Apple ID 登入 Xcode |
| Bundle ID 與 Connect 不一致 | Xcode Bundle Identifier 與 App Store Connect / Identifiers 完全一致 |
| Missing compliance | App Store Connect → 該版本 → 管理出口合規 |
| Processing 很久 | 等 1 小時；仍無則看 **Activity** 郵件／Connect 警示 |
| 安裝後白屏 | 確認 Archive 前 sync 成功；Organizer 該 Archive 日期是否最新 |
| Invalid Icon | 補 1024×1024 無透明通道的 App Icon |

---

## 8. 與網頁版關係

TestFlight 裝的是 **ios/** 原生包內的 `WebAssets`，唔會自動跟 GitHub Pages 更新。每次發 TestFlight 都要 **sync + Archive**。
