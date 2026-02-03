# WP Playground TW

這是一個基於 [WordPress Playground](https://playground.wordpress.net/) 的繁體中文快速啟動器。讓您無需安裝任何伺服器軟體（如 AMP, Docker），直接在瀏覽器中執行真實的 WordPress 網站。

## 🌍 瀏覽器支援 (Browser Support)

本專案依賴 **WebAssembly (WASM)** 技術在瀏覽器中運行 PHP 與 SQLite。

**完美支援以下主流瀏覽器（最新版本）：**

*   ✅ **Google Chrome** (Windows, macOS, Android)
*   ✅ **Microsoft Edge** (Windows, macOS)
*   ✅ **Mozilla Firefox**
*   ✅ **Apple Safari** (macOS, iOS/iPadOS)
*   ✅ **Brave / Vivaldi** 等 Chromium 核心瀏覽器

> ⚠️ **注意**：不支援 Internet Explorer (IE)。

## 🚀 功能特色

*   **無需安裝**：下載即用，只需打開 `index.html`。
*   **繁體中文優化**：預設設定時區為 `Asia/Taipei`，語系為 `zh_TW`。
*   **一鍵安裝**：支援預裝 WooCommerce, Elementor, Yoast SEO 等熱門外掛。
*   **版本切換**：可選擇 PHP 版本 (7.4 - 8.2) 與 WordPress 版本 (Latest / Nightly)。
*   **響應式設計**：支援桌面與手機瀏覽。

## 🛠 使用方式

1.  下載此專案代碼。
2.  雙擊 `index.html` 開啟。
3.  在左側選單選擇您需要的環境與外掛。
4.  點擊 **「啟動環境」**。

## ⚠️ 常見問題

*   **重整後資料會消失嗎？**
    *   是的，因為這是「暫存」環境，所有資料皆儲存在瀏覽器記憶體中。若重新整理網頁，環境將會重置。
*   **為什麼第一次載入比較慢？**
    *   瀏覽器需要下載約 10-20MB 的 PHP WASM 核心檔案，第二次之後會因為快取而變快。

## 授權

GNU General Public License v3.0
