# CNC 工程師工具包 — iOS / iPadOS

**主發佈渠道**：功能與公式以 repo 根目錄的 `index.html`、`css/`、`js/` 為單一來源；本目錄為 SwiftUI 殼 + WKWebView + 原生分享／存檔。

## 第一次建置

1. 同步網頁資源到 App 包：

   ```bash
   ./scripts/sync-ios-assets.sh
   ```

2. 用 Xcode 打開 `ios/CNCToolkit.xcodeproj`。

3. 在 **Signing & Capabilities** 選擇你的 **Team**（`DEVELOPMENT_TEAM`）。

4. （建議）把 `apple-touch-icon.png` 拖入 `Assets.xcassets` → App Icon（1024×1024）。

5. 選 iPhone 或 iPad 模擬器 → **Run**。

## 每次發佈 App 前

1. 在根目錄完成功能／版本更新（`version.json`、`js/version.js`、`CHANGELOG.md`）。
2. 執行 `./scripts/sync-ios-assets.sh`。
3. 將 `Info.plist` 的 `CFBundleShortVersionString` / Xcode **Marketing Version** 與 `version.json` 對齊。
4. Archive → TestFlight / App Store。

**付費 Developer + TestFlight 完整步驟** → [TESTFLIGHT.md](TESTFLIGHT.md)

## 原生橋接

| JS API | 用途 |
|--------|------|
| `CNCNative.shareFile(name, mime, blob)` | 匯出截圖 PNG → 系統分享表 |
| `CNCNative.saveText(name, text)` | G-code → `.nc` 分享／儲存到「檔案」 |

實作：`js/ios-native.js` ↔ `NativeBridge.swift`（`messageHandlers.cnctoolkit`）。

## 目錄

```
ios/
  CNCToolkit.xcodeproj
  CNCToolkit/
    *.swift
    Info.plist
    Assets.xcassets
    WebAssets/          ← sync-ios-assets.sh 產生（勿手改）
```

`WebAssets/` 內容預設不納入 git（見根目錄 `.gitignore`）。Xcode **Build** 會自動執行 `Sync Web Assets`；亦可手動 `./scripts/sync-ios-assets.sh`。

## 除錯：lldb 停在 `ret` 或一開就閃退

1. **先看完整堆疊**（Debug 區域輸入）：
   ```
   bt all
   thread backtrace all
   ```
   若見 `dyld`、`Library not loaded` → 簽名／Team 問題；見 `WebKit`／`WKUserContentController` → 已於 `ToolkitWebView` 在 `deinit` 移除 message handler。

2. **Signing**：Target → Signing & Capabilities → 選好 **Team**，Bundle ID 勿與其他 App 衝突。

3. **WebAssets**：Run 後若彈「WebAssets 缺失」→ 執行 sync 或 Clean Build Folder（⇧⌘K）再 Run。

4. **符號化**：`ret` 單行只表示「程式執行到某函式結尾」，本身唔係錯誤碼；要睇 **上一層 frame** 係邊個模組（`CNCToolkit` / `UIKit` / `dyld`）。

### `Sandbox: rm(...) deny file-read-data .../WebAssets`

Xcode 15+ 預設會 **User Script Sandboxing**，Build Phase 裡嘅 `rm -rf WebAssets` 會被拒絕。

本 repo 已將 **`ENABLE_USER_SCRIPT_SANDBOXING = NO`**（專案 Debug/Release），並把 sync 改成 `ditto` 覆寫、唔再 `rm -rf` 整個 `WebAssets`。

若你喺 Xcode 手動改返 **YES**，請改 Target → Build Settings → **User Script Sandboxing** → **No**，或只在終端執行 `./scripts/sync-ios-assets.sh` 後再 Build。
