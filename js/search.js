/* =========================================================
 * CNC 工程師工具包 — 全局搜尋 + 收藏
 * 依賴 app.js 嘅 $ / $$ / t / tMat / showTab
 * ========================================================= */

const FAV_KEY = "cnc-favs";

// 跨語言關鍵字:任何介面語言都搵得到(例如英文介面打「攻牙」、中文介面打「tap」)
const SEARCH_KEYWORDS = {
  milling: "mill milling end mill rpm vc fz vf mrr power torque time 銑 銑削 铣削 轉速 转速 進給 进给 加工時間 加工时间",
  turning: "turn turning lathe rpm ra rz nose radius time 車 車削 车削 刀鼻 刀尖 加工時間",
  drilling: "drill drilling tap tapping peck g83 thread 鑽 鑽孔 钻孔 攻牙 攻丝 底孔 螺紋 螺纹 啄鑽",
  surface: "surface roughness ra rz scallop ball nose stepover 表面 粗糙度 殘料 残料 球刀 行距",
  hardness: "hardness hrc hv hb hrb tensile 硬度 洛氏 維氏 布氏 抗拉",
  convert: "inch mm fraction convert 英寸 英吋 吋 分數 分数 換算",
  triangle: "triangle trig sin cos tan chamfer taper 三角 倒角 錐度 锥度",
  fits: "fit tolerance iso 286 h7 g6 it 公差 配合 偏差",
  compare: "compare roi taylor tool life cost 對比 对比 壽命 寿命 成本",
  advisor: "tool advisor coating geometry coolant 刀具 塗層 涂层 冷卻",
  insert: "insert iso 1832 cnmg dnmg 刀片 代碼",
  interp: "interpolation helical circular feed compensation 插補 插补 圓弧 圆弧 螺旋",
  gcode: "gcode g-code nc program g81 g83 g73 g84 m29 bolt circle grid helix face 程式 程序 孔陣 孔阵 攻牙 面銑",
  weight: "weight cost density kg lb stock 重量 密度 成本 胚料",
  ref: "reference material jis aisi din mold steel element roughness 參考 参考 牌號 牌号 模具鋼",
};

let searchIndex = null;
let searchItems = [];
let searchActive = 0;
let navOrder = null;

/* ---------- 收藏 ---------- */
function loadFavs() {
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
    return Array.isArray(v) ? v.filter((tab) => $(`.nav-item[data-tab="${tab}"]`)) : [];
  } catch (e) {
    return [];
  }
}

let favs = loadFavs();

function isFav(tab) { return favs.includes(tab); }

function toggleFav(tab) {
  favs = isFav(tab) ? favs.filter((x) => x !== tab) : [...favs, tab];
  try { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); } catch (e) {}
  renderFavUi();
  if (!$("#search-modal").classList.contains("hidden")) renderSearch();
}

/** 收藏嘅分頁排喺側欄最頂,其餘維持原本次序 */
function renderFavUi() {
  const nav = $(".nav");
  if (!nav) return;
  if (!navOrder) navOrder = $$(".nav-item");
  let sep = $(".nav-sep");
  if (!sep) {
    sep = document.createElement("div");
    sep.className = "nav-sep";
    sep.setAttribute("aria-hidden", "true");
  }
  favs.forEach((tab) => nav.appendChild($(`.nav-item[data-tab="${tab}"]`)));
  if (favs.length) nav.appendChild(sep);
  else sep.remove();
  navOrder.forEach((btn) => {
    btn.classList.toggle("is-fav", isFav(btn.dataset.tab));
    if (!isFav(btn.dataset.tab)) nav.appendChild(btn);
  });

  $$(".fav-btn").forEach((b) => {
    const on = isFav(b.dataset.tab);
    b.textContent = on ? t("fav.remove") : t("fav.add");
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.classList.toggle("is-on", on);
  });
}

function mountFavButtons() {
  $$(".tab-panel").forEach((panel) => {
    const header = panel.querySelector(".panel-header");
    if (!header || header.querySelector(".fav-btn")) return;
    const tab = panel.id.replace("tab-", "");
    const actions = document.createElement("div");
    actions.className = "panel-actions";
    const fav = document.createElement("button");
    fav.type = "button";
    fav.className = "btn-secondary fav-btn";
    fav.dataset.tab = tab;
    fav.addEventListener("click", () => toggleFav(tab));
    const exportBtn = header.querySelector(".export-btn");
    if (exportBtn) exportBtn.replaceWith(actions);
    actions.appendChild(fav);
    if (exportBtn) actions.appendChild(exportBtn);
    else header.appendChild(actions);
  });
}

/* ---------- 搜尋索引 ---------- */
function normText(s) {
  return String(s || "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

function labelText(el) {
  const span = el.querySelector("span[data-i18n]");
  return (span || el).textContent.replace(/\s+/g, " ").trim();
}

function buildSearchIndex() {
  const items = [];
  $$(".nav-item").forEach((btn) => {
    const tab = btn.dataset.tab;
    const panel = $("#tab-" + tab);
    const name = labelText(btn);
    const h2 = panel?.querySelector(".panel-header h2")?.textContent || "";
    const desc = panel?.querySelector(".panel-header p")?.textContent.trim() || "";
    items.push({ kind: "tool", tab, title: name, sub: desc, hay: normText(`${name} ${h2} ${desc} ${SEARCH_KEYWORDS[tab] || ""}`) });

    const seen = new Set([normText(name), normText(h2)]);
    panel?.querySelectorAll(".card h3, .field > label, .seg-btn").forEach((el) => {
      const text = labelText(el);
      const key = normText(text);
      if (!text || text.length > 60 || seen.has(key)) return;
      seen.add(key);
      items.push({ kind: "section", tab, title: text, sub: name, el, hay: key });
    });
  });

  MATERIALS.forEach((m) => {
    const title = `${tMat(m.id)} (${m.grade})`;
    items.push({ kind: "material", id: m.id, title, sub: tIso(m.iso), hay: normText(`${title} ${m.id} ${m.iso}`) });
  });
  return items;
}

function scoreItem(it, tokens) {
  let s = 0;
  for (const tok of tokens) {
    const i = it.hay.indexOf(tok);
    if (i < 0) return -1;
    s += 100 - Math.min(i, 60);
    const end = it.hay.indexOf(tok, i) + tok.length;
    if (/^[a-z0-9]+$/.test(tok) && !/[a-z0-9]/.test(it.hay[end] || "")) s += 40;
  }
  const title = normText(it.title);
  if (title.startsWith(tokens[0])) s += 60;
  else if (title.includes(tokens[0])) s += 30;
  if (it.kind === "tool") s += 40;
  else if (it.kind === "material") s += 10;
  if (it.tab && isFav(it.tab)) s += 5;
  return s;
}

function querySearch(q) {
  if (!searchIndex) searchIndex = buildSearchIndex();
  const tools = searchIndex.filter((it) => it.kind === "tool");
  const query = normText(q);
  if (!query) {
    const favTools = favs.map((tab) => tools.find((it) => it.tab === tab)).filter(Boolean);
    return [
      ...favTools.map((it) => ({ ...it, group: "fav" })),
      ...tools.filter((it) => !isFav(it.tab)).map((it) => ({ ...it, group: "all" })),
    ];
  }
  const tokens = query.split(" ");
  const hits = searchIndex
    .map((it) => ({ it, s: scoreItem(it, tokens) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 30)
    .map((x) => ({ ...x.it, group: "hit" }));
  if (query.length >= 2) hits.push({ kind: "ref", tab: "ref", title: t("search.refFor", { q: q.trim() }), sub: t("nav.ref"), q: q.trim(), group: "hit" });
  return hits;
}

/* ---------- 渲染 ---------- */
function kindLabel(kind) {
  return t(`search.kind.${kind}`);
}

function renderSearch() {
  const box = $("#search-results");
  searchItems = querySearch($("#search-input").value);
  searchActive = Math.min(searchActive, Math.max(0, searchItems.length - 1));
  if (!searchItems.length) {
    box.innerHTML = `<div class="search-empty">${escapeHtml(t("search.empty"))}</div>`;
    return;
  }
  let html = "";
  let lastGroup = null;
  searchItems.forEach((it, i) => {
    if (it.group !== lastGroup && it.group !== "hit") {
      html += `<div class="search-group">${escapeHtml(t(it.group === "fav" ? "search.favs" : "search.tools"))}</div>`;
    }
    lastGroup = it.group;
    const star = it.kind === "tool"
      ? `<button type="button" class="search-fav${isFav(it.tab) ? " is-on" : ""}" data-fav="${escapeHtml(it.tab)}" aria-label="${escapeHtml(t(isFav(it.tab) ? "fav.remove" : "fav.add"))}">${isFav(it.tab) ? "★" : "☆"}</button>`
      : "";
    html += `
      <div class="search-item${i === searchActive ? " active" : ""}" role="option" data-idx="${i}" aria-selected="${i === searchActive}">
        <span class="search-kind">${escapeHtml(kindLabel(it.kind))}</span>
        <span class="search-text">
          <span class="search-item-title">${escapeHtml(it.title)}</span>
          ${it.sub ? `<span class="search-item-sub">${escapeHtml(it.sub)}</span>` : ""}
        </span>
        ${star}
      </div>`;
  });
  box.innerHTML = html;
}

function setSearchActive(i) {
  if (!searchItems.length) return;
  searchActive = (i + searchItems.length) % searchItems.length;
  $$("#search-results .search-item").forEach((el) => {
    const on = Number(el.dataset.idx) === searchActive;
    el.classList.toggle("active", on);
    el.setAttribute("aria-selected", on ? "true" : "false");
    if (on) el.scrollIntoView({ block: "nearest" });
  });
}

/* ---------- 開關 + 執行 ---------- */
function openSearch() {
  const modal = $("#search-modal");
  searchIndex = null;
  searchActive = 0;
  $("#search-input").value = "";
  modal.classList.remove("hidden");
  closeMobileNav();
  renderSearch();
  $("#search-input").focus();
}

function closeSearch() {
  $("#search-modal").classList.add("hidden");
}

function flash(el) {
  if (!el) return;
  el.classList.remove("search-flash");
  void el.offsetWidth;
  el.classList.add("search-flash");
  setTimeout(() => el.classList.remove("search-flash"), 1600);
}

function runSearchItem(it) {
  if (!it) return;
  closeSearch();
  if (it.kind === "material") {
    showTab("milling");
    const sel = $("#mill-material");
    sel.value = it.id;
    sel.dispatchEvent(new Event("input", { bubbles: true }));
    sel.closest(".field")?.scrollIntoView({ block: "center", behavior: "smooth" });
    flash(sel.closest(".field"));
    return;
  }
  showTab(it.tab);
  if (it.kind === "ref") {
    const search = $("#ref-search");
    if (search.classList.contains("hidden")) $('#ref-seg .seg-btn[data-val="metal"]')?.click();
    search.value = it.q;
    search.dispatchEvent(new Event("input", { bubbles: true }));
    search.scrollIntoView({ block: "center", behavior: "smooth" });
    flash(search);
    return;
  }
  if (it.kind === "section" && it.el) {
    if (it.el.classList.contains("seg-btn")) it.el.click();
    const visible = it.el.offsetParent ? it.el : null;
    const target = visible?.closest(".field") || visible || it.el.closest(".card");
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    flash(target);
    return;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function refreshSearchUi() {
  searchIndex = null;
  renderFavUi();
  if (!$("#search-modal").classList.contains("hidden")) renderSearch();
}

/* ---------- 事件 ---------- */
$("#search-open")?.addEventListener("click", openSearch);
$("#mobile-search")?.addEventListener("click", openSearch);
$("#search-close")?.addEventListener("click", closeSearch);
$("#search-modal").addEventListener("click", (e) => {
  if (e.target.id === "search-modal") closeSearch();
});

$("#search-input").addEventListener("input", () => {
  searchActive = 0;
  renderSearch();
});

$("#search-input").addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") { e.preventDefault(); setSearchActive(searchActive + 1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setSearchActive(searchActive - 1); }
  else if (e.key === "Enter") { e.preventDefault(); runSearchItem(searchItems[searchActive]); }
});

$("#search-results").addEventListener("click", (e) => {
  const favBtn = e.target.closest(".search-fav");
  if (favBtn) {
    e.stopPropagation();
    toggleFav(favBtn.dataset.fav);
    return;
  }
  const row = e.target.closest(".search-item");
  if (row) runSearchItem(searchItems[Number(row.dataset.idx)]);
});

document.addEventListener("keydown", (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "")
    || document.activeElement?.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    openSearch();
  } else if (e.key === "/" && !typing) {
    e.preventDefault();
    openSearch();
  }
});

mountFavButtons();
renderFavUi();
