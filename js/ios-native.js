/* =========================================================
 * iOS App（WKWebView）原生橋接
 * 由 Swift 注入 messageHandler「cnctoolkit」後啟用
 * ========================================================= */
(function () {
  const handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.cnctoolkit;
  if (!handler) return;

  document.documentElement.classList.add("cnc-native-app");

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const dataUrl = String(r.result || "");
        const i = dataUrl.indexOf(",");
        resolve(i >= 0 ? dataUrl.slice(i + 1) : dataUrl);
      };
      r.onerror = () => reject(r.error || new Error("read failed"));
      r.readAsDataURL(blob);
    });
  }

  window.CNCNative = {
    isApp: true,
    /** 系統分享表（PNG 截圖等） */
    async shareFile(filename, mimeType, blob) {
      const base64 = await blobToBase64(blob);
      handler.postMessage({ action: "shareFile", filename, mimeType, base64 });
    },
    /** 儲存文字檔（G-code → .nc，走分享／「儲存到檔案」） */
    saveText(filename, text) {
      handler.postMessage({ action: "saveText", filename, text });
    },
  };
})();
