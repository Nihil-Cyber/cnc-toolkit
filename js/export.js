/* =========================================================
 * CNC 工程師工具包 — 面板截圖匯出
 * 用 Canvas 將當前分頁嘅輸入、結果、表格畫成 PNG,
 * 手機行 Web Share(可存入相簿),桌面直接下載。
 * ========================================================= */

/**
 * 由 DOM 收集當前面板嘅結構化內容
 * 回傳 [{title, blocks:[{type, ...}]}]
 */
function collectPanelData(panel) {
  const sections = [];
  for (const card of panel.querySelectorAll(".card")) {
    const blocks = [];
    let title = null;

    const pushKv = (pairs) => {
      if (!pairs.length) return;
      const last = blocks[blocks.length - 1];
      if (last && last.type === "kv") last.pairs.push(...pairs);
      else blocks.push({ type: "kv", pairs });
    };

    for (const child of card.children) {
      if (child.tagName === "H3") {
        if (title == null) title = child.textContent.trim();
        else blocks.push({ type: "sub", text: child.textContent.trim() });
      } else if (
        child.classList.contains("field") ||
        child.classList.contains("field-row") ||
        child.classList.contains("compare-inputs")
      ) {
        const fields = child.classList.contains("field") ? [child] : Array.from(child.querySelectorAll(".field"));
        const pairs = [];
        for (const f of fields) {
          if (f.classList.contains("hidden")) continue;
          const label = (f.querySelector("label")?.textContent || "").replace(/\s+/g, " ").trim();
          const inp = f.querySelector("input, select");
          let val = "";
          if (inp) val = inp.tagName === "SELECT" ? (inp.selectedOptions[0]?.textContent || "") : inp.value;
          pairs.push([label, val.trim()]);
        }
        pushKv(pairs);
      } else if (child.classList.contains("tri-stage")) {
        // 三角形舞台:收集圍住圖形嘅欄位
        const pairs = [];
        for (const f of child.querySelectorAll(".tri-field")) {
          const label = (f.querySelector("label")?.textContent || "").trim();
          const val = f.querySelector("input")?.value || "";
          if (val !== "") pairs.push([label, val]);
        }
        pushKv(pairs);
      } else if (child.classList.contains("seg")) {
        const act = child.querySelector(".seg-btn.active");
        if (act) pushKv([["▸", act.textContent.trim()]]);
      } else if (child.classList.contains("results")) {
        const items = Array.from(child.querySelectorAll(".result-item")).map((ri) => ({
          label: (ri.querySelector(".rlabel")?.textContent || "").trim(),
          value: `${(ri.querySelector(".rvalue")?.textContent || "").trim()} ${(ri.querySelector(".runit")?.textContent || "").trim()}`.trim(),
          primary: ri.classList.contains("primary"),
        }));
        if (items.length) blocks.push({ type: "results", items });
      } else if (child.classList.contains("table-wrap")) {
        const head = Array.from(child.querySelectorAll("thead th")).map((th) => th.textContent.trim());
        const rows = Array.from(child.querySelectorAll("tbody tr")).map((tr) =>
          Array.from(tr.children).map((td) => td.textContent.trim())
        );
        if (rows.length) blocks.push({ type: "table", head, rows });
      } else if (child.classList.contains("note")) {
        const text = child.textContent.trim();
        if (text) blocks.push({ type: "note", text });
      } else if (child.classList.contains("advice")) {
        const badge = child.querySelector(".iso-badge");
        if (badge) pushKv([["ISO", badge.textContent.replace(/\s+/g, " ").trim()]]);
        for (const b of child.querySelectorAll(".advice-block")) {
          blocks.push({
            type: "advice",
            title: (b.querySelector(".atitle")?.textContent || "").trim(),
            text: (b.querySelector("p")?.textContent || "").trim(),
          });
        }
      }
    }
    sections.push({ title, blocks });
  }
  return sections;
}

/** 讀取當前主題嘅 CSS 變數色 */
function exportColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim();
  return {
    bg: v("--bg"), card: v("--bg-card"), input: v("--bg-input"),
    border: v("--border"), text: v("--text"), dim: v("--text-dim"),
    accent: v("--accent"), yellow: v("--yellow"),
  };
}

/** 文字換行:回傳行陣列 */
function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  // 逐字符處理(中文無空格),拉丁詞盡量唔拆
  const tokens = text.split(/(\s+)/).flatMap((tk) => (/\s+/.test(tk) ? [" "] : tk.match(/[\u2E80-\u9FFF\uF900-\uFAFF]|\S+/g) || []));
  for (const tk of tokens) {
    const test = line + tk;
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trimEnd());
      line = tk === " " ? "" : tk;
    } else {
      line = test;
    }
  }
  if (line.trim()) lines.push(line.trimEnd());
  return lines;
}

const EXPORT_FONT = '-apple-system, "PingFang TC", "Noto Sans TC", "Segoe UI", sans-serif';
const EXPORT_MONO = '"SF Mono", "JetBrains Mono", Menlo, monospace';

// 舊瀏覽器無 roundRect 嘅 fallback
if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
  };
}

/**
 * 繪製面板內容;draw=false 時只量高度
 * 回傳總高度(邏輯 px)
 */
function paintPanel(ctx, sections, meta, W, draw) {
  const C = meta.colors;
  const M = 36;                 // 邊距
  const CW = W - M * 2;         // 內容寬
  let y = M;

  const setFont = (size, weight = 400, mono = false) => {
    ctx.font = `${weight} ${size}px ${mono ? EXPORT_MONO : EXPORT_FONT}`;
  };

  // ---- 頁首 ----
  if (draw) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, meta.totalH || 10000);
    ctx.fillStyle = C.accent;
    setFont(13, 700);
    ctx.fillText(meta.appTitle.toUpperCase(), M, y + 12);
  }
  y += 22;
  if (draw) {
    ctx.fillStyle = C.text;
    setFont(24, 700);
    ctx.fillText(meta.panelTitle, M, y + 22);
    ctx.fillStyle = C.dim;
    setFont(12);
    const dateW = ctx.measureText(meta.dateStr).width;
    ctx.fillText(meta.dateStr, W - M - dateW, y + 22);
  }
  y += 44;

  for (const sec of sections) {
    // 區塊有實際內容先畫
    if (!sec.blocks.length) continue;
    y += 10;
    if (sec.title) {
      if (draw) {
        ctx.fillStyle = C.accent;
        setFont(13, 700);
        ctx.fillText(sec.title, M, y + 13);
        ctx.strokeStyle = C.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(M + ctx.measureText(sec.title).width + 12, y + 8);
        ctx.lineTo(W - M, y + 8);
        ctx.stroke();
      }
      y += 28;
    }

    for (const b of sec.blocks) {
      if (b.type === "sub") {
        if (draw) {
          ctx.fillStyle = C.dim;
          setFont(12, 700);
          ctx.fillText(b.text, M, y + 12);
        }
        y += 24;
      } else if (b.type === "kv") {
        // 兩欄 key: value
        const colW = CW / 2;
        const rowH = 22;
        setFont(13);
        for (let i = 0; i < b.pairs.length; i++) {
          const col = i % 2, row = Math.floor(i / 2);
          const x = M + col * colW;
          const yy = y + row * rowH;
          if (draw) {
            const [k, v] = b.pairs[i];
            ctx.fillStyle = C.dim;
            setFont(12);
            ctx.fillText(k, x, yy + 12);
            const kw = ctx.measureText(k).width;
            ctx.fillStyle = C.text;
            setFont(13, 600, true);
            ctx.fillText(String(v), x + kw + 10, yy + 12);
          }
        }
        y += Math.ceil(b.pairs.length / 2) * rowH + 8;
      } else if (b.type === "results") {
        const colW = (CW - 12) / 2;
        const boxH = 52;
        for (let i = 0; i < b.items.length; i++) {
          const col = i % 2, row = Math.floor(i / 2);
          const x = M + col * (colW + 12);
          const yy = y + row * (boxH + 10);
          if (draw) {
            const it = b.items[i];
            ctx.fillStyle = it.primary ? C.accent + "22" : C.input;
            ctx.strokeStyle = it.primary ? C.accent : C.border;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x, yy, colW, boxH, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = C.dim;
            setFont(11);
            ctx.fillText(it.label, x + 12, yy + 18);
            ctx.fillStyle = it.primary ? C.accent : C.text;
            setFont(17, 700, true);
            ctx.fillText(it.value, x + 12, yy + 40);
          }
        }
        y += Math.ceil(b.items.length / 2) * (boxH + 10) + 4;
      } else if (b.type === "table") {
        const nCols = b.head.length;
        const colW = CW / nCols;
        const rowH = 24;
        if (draw) {
          ctx.fillStyle = C.input;
          ctx.fillRect(M, y, CW, rowH);
          ctx.fillStyle = C.dim;
          setFont(11, 700);
          b.head.forEach((h, i) => ctx.fillText(h, M + i * colW + 8, y + 16));
        }
        y += rowH;
        setFont(12, 400, true);
        for (const row of b.rows) {
          if (draw) {
            ctx.strokeStyle = C.border;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(M, y);
            ctx.lineTo(M + CW, y);
            ctx.stroke();
            ctx.fillStyle = C.text;
            setFont(12, 400, true);
            row.forEach((cell, i) => ctx.fillText(cell, M + i * colW + 8, y + 16));
          }
          y += rowH;
        }
        y += 10;
      } else if (b.type === "note") {
        setFont(12);
        const lines = wrapLines(ctx, b.text, CW - 24);
        const h = lines.length * 18 + 14;
        if (draw) {
          ctx.fillStyle = C.yellow + "14";
          ctx.fillRect(M, y, CW, h);
          ctx.fillStyle = C.yellow;
          ctx.fillRect(M, y, 3, h);
          ctx.fillStyle = C.dim;
          setFont(12);
          lines.forEach((ln, i) => ctx.fillText(ln, M + 14, y + 20 + i * 18));
        }
        y += h + 8;
      } else if (b.type === "advice") {
        if (draw) {
          ctx.fillStyle = C.accent;
          setFont(12, 700);
          ctx.fillText(b.title, M, y + 12);
        }
        y += 20;
        setFont(13);
        const lines = wrapLines(ctx, b.text, CW);
        if (draw) {
          ctx.fillStyle = C.text;
          setFont(13);
          lines.forEach((ln, i) => ctx.fillText(ln, M, y + 14 + i * 19));
        }
        y += lines.length * 19 + 10;
      }
    }
    y += 6;
  }

  // ---- 頁尾 ----
  y += 8;
  if (draw) {
    ctx.strokeStyle = C.border;
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(W - M, y);
    ctx.stroke();
    ctx.fillStyle = C.dim;
    setFont(11);
    ctx.fillText(`${meta.appTitle} · ${meta.footer}`, M, y + 20);
  }
  y += 34;
  return y;
}

/** 匯出當前面板為 PNG(手機優先行系統分享,否則下載) */
async function exportActivePanel(appTitle, footerText, lang) {
  const panel = document.querySelector(".tab-panel.active");
  if (!panel) return;

  const sections = collectPanelData(panel);
  const panelTitle = panel.querySelector(".panel-header h2")?.textContent.trim() || "";
  const meta = {
    colors: exportColors(),
    appTitle,
    panelTitle,
    footer: footerText,
    dateStr: new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
  };

  const W = 880;
  const SCALE = 2;

  // 第一遍:量高度
  const scratch = document.createElement("canvas");
  scratch.width = 10; scratch.height = 10;
  const totalH = paintPanel(scratch.getContext("2d"), sections, meta, W, false);
  meta.totalH = totalH;

  // 第二遍:實際繪製
  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = totalH * SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(SCALE, SCALE);
  ctx.textBaseline = "alphabetic";
  paintPanel(ctx, sections, meta, W, true);

  const ts = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
  const filename = `CNC_${panel.id.replace("tab-", "")}_${ts}.png`;

  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return;

  // 手機:優先用系統分享面板(可直接存入相簿)
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && navigator.canShare) {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: panelTitle });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return; // 用戶取消分享
        // 分享失敗則回退到下載
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
