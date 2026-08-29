/* =========================================================
 * CNC 工程師工具包 — UI 互動邏輯(多語言 + 主題 + 單位)
 * 所有計算內部一律用公制;英制只係輸入/顯示層轉換
 * ========================================================= */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ---------- 多語言 ---------- */
const DEFAULT_LANG = "zh-Hant";
let LANG = (() => {
  try {
    const saved = localStorage.getItem("cnc-lang");
    if (saved && I18N[saved]) return saved;
  } catch (e) {}
  return DEFAULT_LANG;
})();

function t(key, params) {
  let s = I18N[LANG]?.ui[key] ?? I18N[DEFAULT_LANG].ui[key] ?? key;
  if (params) {
    for (const k of Object.keys(params)) s = s.split(`{${k}}`).join(params[k]);
  }
  return s;
}

function tMat(id) {
  return I18N[LANG]?.mat[id] ?? I18N[DEFAULT_LANG].mat[id] ?? id;
}

function tIso(group) {
  return I18N[LANG]?.iso[group] ?? I18N[DEFAULT_LANG].iso[group] ?? group;
}

function tAdvice(group, op) {
  return I18N[LANG]?.advice?.[group]?.[op] ?? I18N[DEFAULT_LANG].advice[group][op];
}

// 由點分路徑讀取 insert 字典(例:"geom.rhombic"、"type.M")
function tIns(path) {
  const get = (root) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), root);
  return get(I18N[LANG]?.insert) ?? get(I18N[DEFAULT_LANG].insert) ?? path;
}

function applyStaticI18n() {
  document.documentElement.lang = LANG;
  document.title = t("app.title");
  $$("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  $$("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  $$(".tri-q").forEach((b) => { b.title = t("tri.calcThis"); });
  applyVersion();
  updateMobileTitle();
}

function applyVersion() {
  const label = t("app.version", { v: APP_META.version });
  const foot = $("#app-version");
  const set = $("#settings-version");
  if (foot) foot.textContent = label;
  if (set) set.textContent = label;
}

function versionFooter() {
  return `${t("footer")} · ${t("app.version", { v: APP_META.version })}`;
}

/* ---------- 單位系統 ---------- */
// f = 每 1 公制單位對應嘅英制數值
const UNIT_DEFS = {
  len:     { m: "mm",      i: "in",      f: 1 / 25.4 },
  feedRev: { m: "mm/rev",  i: "in/rev",  f: 1 / 25.4 },
  feedRate:{ m: "mm/min",  i: "in/min",  f: 1 / 25.4 },
  vc:      { m: "m/min",   i: "SFM",     f: 3.28084 },
  mrr:     { m: "cm³/min", i: "in³/min", f: 1 / 16.387064 },
  power:   { m: "kW",      i: "HP",      f: 1.3410221 },
  torque:  { m: "N·m",     i: "lbf·ft",  f: 0.7375621 },
  rough:   { m: "µm",      i: "µin",     f: 39.370079 },
  stress:  { m: "MPa",     i: "ksi",     f: 0.1450377 },
};

let UNITS = (() => {
  try {
    const saved = localStorage.getItem("cnc-units");
    if (saved === "metric" || saved === "imperial") return saved;
  } catch (e) {}
  return "metric";
})();

function uLabel(kind) {
  const d = UNIT_DEFS[kind];
  return UNITS === "imperial" ? d.i : d.m;
}

/** 公制值 → 當前顯示單位 */
function toDisp(v, kind) {
  if (v == null || !isFinite(v)) return v;
  return UNITS === "imperial" ? v * UNIT_DEFS[kind].f : v;
}

/** 當前顯示單位 → 公制值 */
function toMetricVal(v, kind) {
  return UNITS === "imperial" ? v / UNIT_DEFS[kind].f : v;
}

/** 讀輸入框原始數值(顯示單位) */
function num(id) {
  return parseFloat($(id).value) || 0;
}

/** 讀輸入框並轉為公制(依 data-ukind;無標記即原值) */
function numM(id) {
  const el = $(id);
  const v = parseFloat(el.value) || 0;
  const kind = el.dataset.ukind;
  return kind ? toMetricVal(v, kind) : v;
}

/** 以公制值寫入輸入框(自動轉顯示單位,保留 4 位有效數字) */
function setInputMetric(id, metricV, kind) {
  const disp = toDisp(metricV, kind);
  $(id).value = parseFloat(disp.toPrecision(4));
}

/** 將提示模板入面嘅公制單位字眼換成英制(涵蓋各語言寫法:mm/rev、mm/U、mm/tr) */
function unitize(s) {
  if (UNITS === "metric") return s;
  return s
    .split("mm/rev").join("in/rev")
    .split("mm/U").join("in/U")
    .split("mm/tr").join("in/tr")
    .split("m/min").join("SFM")
    .split(" mm)").join(" in)");
}

/** 切換單位:就地換算所有帶 data-ukind 嘅輸入值,更新單位標籤 */
function setUnits(next) {
  if (next === UNITS) return;
  const prev = UNITS;
  $$("input[data-ukind]").forEach((el) => {
    const v = parseFloat(el.value);
    if (!isFinite(v)) return;
    const d = UNIT_DEFS[el.dataset.ukind];
    const metric = prev === "imperial" ? v / d.f : v;
    const disp = next === "imperial" ? metric * d.f : metric;
    el.value = parseFloat(disp.toPrecision(4));
  });
  UNITS = next;
  try { localStorage.setItem("cnc-units", UNITS); } catch (e) {}
  applyUnitLabels();
  updateUnitsSeg();
  updateAllOutputs();
}

function applyUnitLabels() {
  $$("em[data-ukind]").forEach((em) => {
    em.textContent = uLabel(em.dataset.ukind);
  });
  $("#hard-uts-th").textContent = t("th.uts").replace("MPa", uLabel("stress"));
}

function updateUnitsSeg() {
  $$("#units-seg .seg-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.val === UNITS);
  });
}

/* ---------- 主題切換 ---------- */
function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = theme === "light" ? "🌙" : "☀️";
  $("#theme-toggle").textContent = icon;
  const mt = $("#mobile-theme");
  if (mt) mt.textContent = icon;
  // PWA:狀態列顏色跟主題
  const meta = document.getElementById("theme-color-meta");
  if (meta) meta.content = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0d1117";
  try { localStorage.setItem("cnc-theme", theme); } catch (e) {}
}

$("#theme-toggle").addEventListener("click", () => {
  applyTheme(currentTheme() === "light" ? "dark" : "light");
});
$("#mobile-theme")?.addEventListener("click", () => {
  applyTheme(currentTheme() === "light" ? "dark" : "light");
});

/* ---------- 設定彈窗 ---------- */
const settingsModal = $("#settings-modal");

/* ---------- 手機導航 ---------- */
const navBackdrop = $("#nav-backdrop");

function setMobileNav(open) {
  document.body.classList.toggle("nav-open", open);
  const btn = $("#nav-toggle");
  if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  if (navBackdrop) navBackdrop.setAttribute("aria-hidden", open ? "false" : "true");
}

function closeMobileNav() {
  setMobileNav(false);
}

function toggleMobileNav() {
  setMobileNav(!document.body.classList.contains("nav-open"));
}

function updateMobileTitle() {
  const active = $(".nav-item.active span");
  const title = $("#mobile-title");
  if (active && title) title.textContent = active.textContent;
}

$("#nav-toggle")?.addEventListener("click", toggleMobileNav);
navBackdrop?.addEventListener("click", closeMobileNav);
$("#mobile-settings")?.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
  closeMobileNav();
});

$("#settings-open").addEventListener("click", () => settingsModal.classList.remove("hidden"));
$("#settings-close").addEventListener("click", () => settingsModal.classList.add("hidden"));
settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) settingsModal.classList.add("hidden");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    settingsModal.classList.add("hidden");
    changelogModal?.classList.add("hidden");
    closeMobileNav();
  }
});

/* ---------- 更新記錄 ---------- */
const changelogModal = $("#changelog-modal");
let changelogText = null;

async function loadChangelog() {
  if (changelogText != null) return changelogText;
  try {
    const res = await fetch("CHANGELOG.md");
    if (!res.ok) throw new Error("fetch failed");
    changelogText = await res.text();
  } catch (e) {
    changelogText = t("changelog.unavailable");
  }
  return changelogText;
}

async function openChangelog() {
  const body = $("#changelog-body");
  if (!body || !changelogModal) return;
  body.textContent = t("changelog.loading");
  changelogModal.classList.remove("hidden");
  settingsModal.classList.add("hidden");
  body.textContent = await loadChangelog();
}

$("#changelog-open")?.addEventListener("click", openChangelog);
$("#changelog-close")?.addEventListener("click", () => changelogModal?.classList.add("hidden"));
changelogModal?.addEventListener("click", (e) => {
  if (e.target === changelogModal) changelogModal.classList.add("hidden");
});

$$("#units-seg .seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => setUnits(btn.dataset.val));
});

/* ---------- 語言選擇器 ---------- */
const langSelect = $("#lang-select");
for (const code of Object.keys(I18N)) {
  const opt = document.createElement("option");
  opt.value = code;
  opt.textContent = I18N[code]._name;
  if (code === LANG) opt.selected = true;
  langSelect.appendChild(opt);
}

langSelect.addEventListener("input", () => {
  LANG = langSelect.value;
  try { localStorage.setItem("cnc-lang", LANG); } catch (e) {}
  refreshAll();
});

/* ---------- 匯出截圖 ---------- */
$$(".export-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    exportActivePanel(t("app.title"), versionFooter(), LANG);
  });
});

/* ---------- 分頁切換 ---------- */
$$(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".nav-item").forEach((b) => b.classList.remove("active"));
    $$(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    $("#tab-" + btn.dataset.tab).classList.add("active");
    closeMobileNav();
    updateMobileTitle();
  });
});

/* ---------- 通用:材料下拉選單(依 ISO 群組分組) ---------- */
function populateMaterialSelect(selectEl) {
  const prev = selectEl.value;
  selectEl.innerHTML = "";
  const groups = {};
  MATERIALS.forEach((m) => {
    (groups[m.iso] = groups[m.iso] || []).push(m);
  });
  for (const iso of Object.keys(ISO_GROUPS)) {
    if (!groups[iso]) continue;
    const og = document.createElement("optgroup");
    og.label = tIso(iso);
    groups[iso].forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${tMat(m.id)} (${m.grade})`;
      og.appendChild(opt);
    });
    selectEl.appendChild(og);
  }
  if (prev && MATERIALS.some((m) => m.id === prev)) selectEl.value = prev;
}

function getMaterial(id) {
  return MATERIALS.find((m) => m.id === id);
}

function vcHintText(m) {
  const lo = fmt(toDisp(m.vcCarbide[0], "vc"), 0);
  const hi = fmt(toDisp(m.vcCarbide[1], "vc"), 0);
  const c = unitize(t("hint.vc", { lo, hi }));
  const h = m.vcHss
    ? unitize(t("hint.hss", { lo: fmt(toDisp(m.vcHss[0], "vc"), 0), hi: fmt(toDisp(m.vcHss[1], "vc"), 0) }))
    : t("hint.noHss");
  return c + h;
}

/* ---------- 通用:結果卡渲染 ---------- */
function renderResults(container, items) {
  container.innerHTML = items
    .map(
      (it) => `
      <div class="result-item${it.primary ? " primary" : ""}${it.status ? ` status-${it.status}` : ""}">
        <span class="rlabel">${escapeHtml(it.label)}</span>
        <span class="rvalue">${escapeHtml(it.value)}</span><span class="runit">${escapeHtml(it.unit || "")}</span>
      </div>`
    )
    .join("");
}

/** 參數合理性：輸入框邊框顏色 */
function setFieldStatus(inputSel, level) {
  const el = $(inputSel);
  if (!el) return;
  el.classList.remove("status-ok", "status-warn", "status-danger");
  const field = el.closest(".field");
  if (field) field.classList.remove("status-ok", "status-warn", "status-danger");
  if (level) {
    el.classList.add(`status-${level}`);
    if (field) field.classList.add(`status-${level}`);
  }
}

function formatAssessMsg(item) {
  const p = { ...(item.params || {}) };
  if (p.lo != null) p.lo = fmt(toDisp(p.lo, "vc"), 0);
  if (p.hi != null) p.hi = fmt(toDisp(p.hi, "vc"), 0);
  if (p.ref != null) p.ref = fmt(toDisp(p.ref, "len"));
  if (p.hm != null) p.hm = fmt(toDisp(p.hm, "len"));
  if (p.r != null) p.r = fmt(p.r, 1);
  if (p.ratio != null) p.ratio = fmt(p.ratio, 2);
  return t(item.key, p);
}

/** 參數合理性：狀態列 + 輸入框標色 */
function applyParamAssess(barSel, items, fieldIds = []) {
  const bar = $(barSel);
  if (!bar) return;

  fieldIds.forEach((id) => setFieldStatus(`#${id}`, null));
  if (!items.length) {
    bar.className = "param-status";
    bar.innerHTML = "";
    return;
  }
  items.forEach((it) => {
    if (it.id && !it.id.endsWith("-hm")) setFieldStatus(`#${it.id}`, it.level);
  });

  const issues = items.filter((it) => it.level && it.level !== "ok");
  const overall = worstLevel(items.map((it) => it.level)) || "ok";

  const chips = items
    .filter((it) => it.id && !it.id.endsWith("-hm"))
    .map((it) => {
      const sym = it.level === "ok" ? "✓" : it.level === "warn" ? "!" : "✕";
      const name = it.id.split("-").pop();
      return `<span class="param-chip status-${it.level}">${sym} ${escapeHtml(name)}</span>`;
    })
    .join("");

  if (overall === "ok" && issues.length === 0) {
    bar.className = "param-status status-ok";
    bar.innerHTML = `
      <span class="param-status-text">${escapeHtml(t("status.allOk"))}</span>
      <div class="param-status-chips">${chips}</div>
      <span class="param-status-legend">${escapeHtml(t("status.legend"))}</span>`;
    return;
  }

  if (issues.length === 0) {
    bar.className = "param-status status-ok";
    bar.innerHTML = `<span class="param-status-text">${escapeHtml(t("status.allOk"))}</span>`;
    return;
  }

  bar.className = `param-status status-${overall}`;
  const list = issues.map((it) => `<li>${escapeHtml(formatAssessMsg(it))}</li>`).join("");
  bar.innerHTML = `
    <span class="param-status-text">${escapeHtml(t("status.hasIssues", { n: issues.length }))}</span>
    <div class="param-status-chips">${chips}</div>
    <ul class="param-status-list">${list}</ul>
    <span class="param-status-legend">${escapeHtml(t("status.legend"))}</span>`;
}

/* =========================================================
 * 銑削
 * ========================================================= */
function updateMilling() {
  const m = getMaterial($("#mill-material").value);
  $("#mill-vc-hint").textContent = vcHintText(m);

  const d = numM("#mill-d"), z = num("#mill-z"), vc = numM("#mill-vc"), fz = numM("#mill-fz"),
    ap = numM("#mill-ap"), ae = numM("#mill-ae"),
    n = num("#mill-n"), vf = numM("#mill-vf");
  if (!m || d <= 0 || z <= 0) {
    applyParamAssess("#mill-param-status", [], ["mill-vc", "mill-fz", "mill-ap", "mill-ae"]);
    return;
  }

  const q = mrrMilling(ap, ae, vf);
  const hm = avgChipThickness(fz, ae, d);
  const kc = specificCuttingForce(m.kc1, m.mc, hm);
  const pc = powerFromMrr(q, kc);
  const mt = torque(pc, n);
  const ctf = chipThinningFactor(ae, d);
  const assess = assessMilling(m, d, vc, fz, ap, ae, hm);
  const hmItem = assess.find((it) => it.id === "mill-hm");

  renderResults($("#mill-results"), [
    { label: t("r.q"), value: fmt(toDisp(q, "mrr")), unit: uLabel("mrr"), primary: true },
    { label: t("r.pc"), value: fmt(toDisp(pc, "power")), unit: uLabel("power"), primary: true },
    { label: t("r.hm"), value: fmt(toDisp(hm, "len")), unit: uLabel("len"), status: hmItem?.level },
    { label: t("r.torque"), value: fmt(toDisp(mt, "torque")), unit: uLabel("torque") },
  ]);

  applyParamAssess("#mill-param-status", assess, ["mill-vc", "mill-fz", "mill-ap", "mill-ae"]);

  let note = t("note.mill", { kc1: m.kc1 });
  if (ae / d < 0.5) {
    note += unitize(t("note.thinning", { ctf: fmt(ctf, 2), fz: fmt(toDisp(fz * ctf, "len")) }));
  }
  $("#mill-note").textContent = note;
}

/**
 * 雙向聯動:vc ↔ n(經 D),fz ↔ vf(經 n×z)
 * changed 指邊個欄位觸發,決定換算方向(最後編輯優先)
 */
function syncMilling(changed) {
  const d = numM("#mill-d"), z = num("#mill-z");
  if (d > 0) {
    if (changed === "n") setInputMetric("#mill-vc", vcFromRpm(num("#mill-n"), d), "vc");
    else $("#mill-n").value = Math.round(rpmFromVc(numM("#mill-vc"), d)) || "";
  }
  const n = num("#mill-n");
  if (n > 0 && z > 0) {
    if (changed === "vf") setInputMetric("#mill-fz", numM("#mill-vf") / (n * z), "len");
    else setInputMetric("#mill-vf", n * z * numM("#mill-fz"), "feedRate");
  }
  updateMilling();
}

$("#mill-suggest").addEventListener("click", () => {
  const m = getMaterial($("#mill-material").value);
  const d = numM("#mill-d");
  setInputMetric("#mill-vc", (m.vcCarbide[0] + m.vcCarbide[1]) / 2, "vc");
  setInputMetric("#mill-fz", baseFz(d) * m.fzFactor, "len");
  syncMilling("vc");
});

["d", "z", "vc", "n", "fz", "vf"].forEach((k) =>
  $(`#mill-${k}`).addEventListener("input", () => syncMilling(k))
);
["#mill-material", "#mill-ap", "#mill-ae"].forEach((id) => $(id).addEventListener("input", updateMilling));

/* =========================================================
 * 車削
 * ========================================================= */
function updateTurning() {
  const m = getMaterial($("#turn-material").value);
  $("#turn-vc-hint").textContent = vcHintText(m);

  const d = numM("#turn-d"), vc = numM("#turn-vc"), f = numM("#turn-f"),
    ap = numM("#turn-ap"), rn = parseFloat($("#turn-rnose").value);
  if (!m || d <= 0) {
    applyParamAssess("#turn-param-status", [], ["turn-vc", "turn-f", "turn-ap"]);
    return;
  }

  const q = mrrTurning(vc, ap, f);
  const kc = specificCuttingForce(m.kc1, m.mc, f); // 車削 hm ≈ f(近似,90° 主偏角)
  const pc = powerFromMrr(q, kc);
  const rough = surfaceRoughness(f, rn);
  const assess = assessTurning(m, vc, f, ap, rn);

  renderResults($("#turn-results"), [
    { label: t("r.q"), value: fmt(toDisp(q, "mrr")), unit: uLabel("mrr"), primary: true },
    { label: t("r.pc"), value: fmt(toDisp(pc, "power")), unit: uLabel("power") },
    { label: t("r.ra"), value: fmt(toDisp(rough.ra, "rough")), unit: uLabel("rough"), primary: true },
    { label: t("r.rz"), value: fmt(toDisp(rough.rz, "rough")), unit: uLabel("rough") },
  ]);

  applyParamAssess("#turn-param-status", assess, ["turn-vc", "turn-f", "turn-ap"]);

  let note = "";
  if (f > rn * 0.6) {
    note = unitize(t("note.turnHigh", {
      f: fmt(toDisp(f, "len")),
      rn,
      fmax: fmt(toDisp(rn * 0.5, "len")),
    }));
  } else if (f < 0.05) {
    note = t("note.turnLow");
  }
  $("#turn-note").textContent = note;
}

/** 雙向聯動:vc ↔ n(經 D),f ↔ vf(經 n) */
function syncTurning(changed) {
  const d = numM("#turn-d");
  if (d > 0) {
    if (changed === "n") setInputMetric("#turn-vc", vcFromRpm(num("#turn-n"), d), "vc");
    else $("#turn-n").value = Math.round(rpmFromVc(numM("#turn-vc"), d)) || "";
  }
  const n = num("#turn-n");
  if (n > 0) {
    if (changed === "vf") setInputMetric("#turn-f", numM("#turn-vf") / n, "len");
    else setInputMetric("#turn-vf", n * numM("#turn-f"), "feedRate");
  }
  updateTurning();
}

["d", "vc", "n", "f", "vf"].forEach((k) =>
  $(`#turn-${k}`).addEventListener("input", () => syncTurning(k))
);
["#turn-material", "#turn-ap", "#turn-rnose"].forEach((id) => $(id).addEventListener("input", updateTurning));

/* =========================================================
 * 鑽孔・攻牙
 * ========================================================= */
function updateDrilling() {
  const m = getMaterial($("#drill-material").value);
  $("#drill-vc-hint").textContent = unitize(t("hint.drill", {
    lo: fmt(toDisp(m.vcCarbide[0] * 0.6, "vc"), 0),
    hi: fmt(toDisp(m.vcCarbide[1] * 0.5, "vc"), 0),
    f: fmt(toDisp(baseDrillF(numM("#drill-d")) * m.fzFactor, "len")),
  }));

  const d = numM("#drill-d"), vc = numM("#drill-vc"), f = numM("#drill-f"),
    depth = numM("#drill-depth"), vf = numM("#drill-vf"),
    pointAngle = parseFloat($("#drill-point").value),
    peckQ = numM("#drill-peck"), rapid = numM("#drill-rapid");
  if (!m || d <= 0) {
    applyParamAssess("#drill-param-status", [], ["drill-vc", "drill-f", "drill-depth"]);
    return;
  }

  const q = mrrDrilling(d, vf);
  const kc = specificCuttingForce(m.kc1, m.mc, f / 2);
  const pc = powerDrilling(f, vc, d, kc);
  const pointLen = drillPointLength(d, pointAngle);
  const through = depth + pointLen;
  const cyc = peckCycle(depth, peckQ, vf, rapid);
  const assess = assessDrilling(m, d, vc, f, depth);

  renderResults($("#drill-results"), [
    { label: t("r.q"), value: fmt(toDisp(q, "mrr")), unit: uLabel("mrr"), primary: true },
    { label: t("r.pc"), value: fmt(toDisp(pc, "power")), unit: uLabel("power") },
    { label: t("r.pointLen"), value: fmt(toDisp(pointLen, "len")), unit: uLabel("len") },
    { label: t("r.throughDepth"), value: fmt(toDisp(through, "len")), unit: uLabel("len") },
    { label: t("r.pecks"), value: cyc ? String(cyc.pecks) : "—", unit: t("unit.pecks") },
    { label: t("r.cycleTime"), value: cyc ? fmt(cyc.totalSec) : "—", unit: t("unit.s"), primary: true },
  ]);

  applyParamAssess("#drill-param-status", assess, ["drill-vc", "drill-f", "drill-depth"]);

  const ratio = depth / d;
  let note = "";
  if (ratio > 5) note = t("note.deep5", { r: fmt(ratio, 1) });
  else if (ratio > 3) note = t("note.deep3", { r: fmt(ratio, 1) });
  if (d > 0 && pointLen > 0) {
    note += (note ? " " : "") + t("note.point", {
      a: fmt(pointAngle, 0),
      h: fmt(toDisp(pointLen, "len")),
      through: fmt(toDisp(through, "len")),
    });
  }
  if (cyc && cyc.usePeck) {
    note += t("note.peck", {
      n: cyc.pecks,
      q: fmt(toDisp(cyc.qActual, "len")),
      t: fmt(cyc.totalSec),
      vr: `${fmt(toDisp(rapid, "feedRate"), 0)} ${uLabel("feedRate")}`,
    });
  }
  $("#drill-note").textContent = note;
}

/** 雙向聯動:vc ↔ n(經 D),f ↔ vf(經 n) */
function syncDrilling(changed) {
  const d = numM("#drill-d");
  if (d > 0) {
    if (changed === "n") setInputMetric("#drill-vc", vcFromRpm(num("#drill-n"), d), "vc");
    else $("#drill-n").value = Math.round(rpmFromVc(numM("#drill-vc"), d)) || "";
  }
  const n = num("#drill-n");
  if (n > 0) {
    if (changed === "vf") setInputMetric("#drill-f", numM("#drill-vf") / n, "len");
    else setInputMetric("#drill-vf", n * numM("#drill-f"), "feedRate");
  }
  updateDrilling();
}

["d", "vc", "n", "f", "vf"].forEach((k) =>
  $(`#drill-${k}`).addEventListener("input", () => syncDrilling(k))
);
["#drill-material", "#drill-depth", "#drill-point", "#drill-peck", "#drill-rapid"].forEach((id) => $(id).addEventListener("input", updateDrilling));

/* ---- 攻牙(公制 M / UNC / UNF / NPT) ---- */
const tapSelect = $("#tap-size");
let tapStd = "metric";

/** 依標準回傳統一格式螺紋清單:{ name, d(mm), p(mm), tpi?, imperial?, tapered?, drill(mm) } */
function threadList(std) {
  if (std === "unc" || std === "unf") {
    return (std === "unc" ? UNC_THREADS : UNF_THREADS).map((t) => ({
      name: t.name, d: t.diaIn * 25.4, p: 25.4 / t.tpi, tpi: t.tpi, imperial: true,
    }));
  }
  if (std === "npt") {
    return NPT_THREADS.map((t) => ({
      name: t.name, p: 25.4 / t.tpi, tpi: t.tpi, drill: t.drillMm, tapered: true, imperial: true,
    }));
  }
  return METRIC_THREADS.map((t) => ({ name: `M${t.d} × ${t.p}`, d: t.d, p: t.p }));
}

function populateTapSelect() {
  const list = threadList(tapStd);
  const prev = tapSelect.value;
  tapSelect.innerHTML = "";
  list.forEach((th, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = th.name;
    tapSelect.appendChild(opt);
  });
  if (tapStd === "metric") tapSelect.value = String(METRIC_THREADS.findIndex((t) => t.d === 8));
  else if (prev && prev < list.length) tapSelect.value = prev;
}

function updateTapping() {
  const list = threadList(tapStd);
  const th = list[parseInt(tapSelect.value)] || list[0];
  if (!th) return;
  const rpm = num("#tap-rpm");
  const dDigits = UNITS === "imperial" ? 4 : 2;
  const pitchDisp = th.imperial ? `${th.tpi} TPI` : `${th.p} mm`;
  const feedItem = { label: t("r.tapFeed"), value: fmt(toDisp(rpm * th.p, "feedRate"), UNITS === "imperial" ? 1 : 0), unit: uLabel("feedRate") };

  let items;
  if (th.tapered) {
    items = [
      { label: t("r.tapCut"), value: `Ø${fmt(toDisp(th.drill, "len"), dDigits)}`, unit: uLabel("len"), primary: true },
      feedItem,
      { label: t("r.pitch"), value: pitchDisp },
    ];
  } else {
    items = [
      { label: t("r.tapCut"), value: `Ø${fmt(toDisp(tapDrillCutting(th.d, th.p), "len"), dDigits)}`, unit: uLabel("len"), primary: true },
      { label: t("r.tapForm"), value: `Ø${fmt(toDisp(tapDrillForming(th.d, th.p), "len"), dDigits)}`, unit: uLabel("len") },
      feedItem,
      { label: t("r.pitch"), value: pitchDisp },
    ];
  }
  renderResults($("#tap-results"), items);
  $("#tap-npt-note").textContent = th.tapered ? t("tap.nptNote") : "";
}

function renderTapTable() {
  const dDigits = UNITS === "imperial" ? 4 : 2;
  const tbody = $("#tap-table tbody");
  tbody.innerHTML = threadList(tapStd).map((th) => {
    const pitchCell = th.imperial ? `${th.tpi} TPI` : th.p;
    if (th.tapered) {
      return `<tr><td>${escapeHtml(th.name)}</td><td>${escapeHtml(pitchCell)}</td><td>Ø${fmt(toDisp(th.drill, "len"), dDigits)}</td><td>—</td></tr>`;
    }
    return `<tr><td>${escapeHtml(th.name)}</td><td>${escapeHtml(pitchCell)}</td>
      <td>Ø${fmt(toDisp(tapDrillCutting(th.d, th.p), "len"), dDigits)}</td>
      <td>Ø${fmt(toDisp(tapDrillForming(th.d, th.p), "len"), dDigits)}</td></tr>`;
  }).join("");
}

$("#tap-standard").addEventListener("input", () => {
  tapStd = $("#tap-standard").value;
  populateTapSelect();
  updateTapping();
  renderTapTable();
});
tapSelect.addEventListener("input", updateTapping);
$("#tap-rpm").addEventListener("input", updateTapping);

/* =========================================================
 * 表面粗糙度
 * ========================================================= */
let surfMode = "ra";
let scallopMode = "height";

$$('.seg[data-group="surf-mode"] .seg-btn').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.seg[data-group="surf-mode"] .seg-btn').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    surfMode = btn.dataset.val;
    $("#surf-f-field").classList.toggle("hidden", surfMode !== "ra");
    $("#surf-ra-field").classList.toggle("hidden", surfMode !== "feed");
    updateSurface();
  });
});

$$('.seg[data-group="scallop-mode"] .seg-btn').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.seg[data-group="scallop-mode"] .seg-btn').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    scallopMode = btn.dataset.val;
    $("#scallop-step-field").classList.toggle("hidden", scallopMode !== "height");
    $("#scallop-h-field").classList.toggle("hidden", scallopMode !== "step");
    updateScallop();
  });
});

function updateSurface() {
  const rn = parseFloat($("#surf-rnose").value);
  if (surfMode === "ra") {
    const f = numM("#surf-f");
    const r = surfaceRoughness(f, rn);
    renderResults($("#surf-results"), [
      { label: t("r.ra"), value: fmt(toDisp(r.ra, "rough")), unit: uLabel("rough"), primary: true },
      { label: t("r.rz"), value: fmt(toDisp(r.rz, "rough")), unit: uLabel("rough") },
    ]);
  } else {
    const raT = numM("#surf-ra-target");
    const f = feedFromRa(raT, rn);
    renderResults($("#surf-results"), [
      { label: t("r.maxFeed"), value: fmt(toDisp(f, "len")), unit: uLabel("feedRev"), primary: true },
      { label: t("lbl.targetRa"), value: fmt(toDisp(raT, "rough")), unit: uLabel("rough") },
    ]);
  }
}

function updateScallop() {
  const d = numM("#scallop-d");
  const r = d / 2;
  if (r <= 0) return;
  if (scallopMode === "height") {
    const s = numM("#scallop-step");
    const h = scallopHeight(r, s);
    renderResults($("#scallop-results"), [
      { label: t("r.scallop"), value: fmt(toDisp(h * 1000, "rough"), 1), unit: uLabel("rough"), primary: true },
      { label: t("r.scallop"), value: fmt(toDisp(h, "len")), unit: uLabel("len") },
    ]);
  } else {
    const hT = numM("#scallop-h-target");
    const s = stepoverFromScallop(r, hT);
    renderResults($("#scallop-results"), [
      { label: t("r.maxStep"), value: fmt(toDisp(s, "len")), unit: uLabel("len"), primary: true },
      { label: t("r.stepPct"), value: fmt((s / d) * 100, 1), unit: "%" },
    ]);
  }
}

["#surf-f", "#surf-ra-target", "#surf-rnose"].forEach((id) => $(id).addEventListener("input", updateSurface));
["#scallop-d", "#scallop-step", "#scallop-h-target"].forEach((id) => $(id).addEventListener("input", updateScallop));

/* =========================================================
 * 硬度換算
 * ========================================================= */
function updateHardness() {
  const type = $("#hard-type").value;
  const value = num("#hard-value");
  const r = convertHardness(type, value);
  renderResults($("#hard-results"), [
    { label: t("r.hrc"), value: fmt(r.hrc, 1), primary: type === "hrc" },
    { label: t("r.hv"), value: fmt(r.hv, 0), primary: type === "hv" },
    { label: t("r.hb"), value: fmt(r.hb, 0), primary: type === "hb" },
    { label: t("r.hrb"), value: fmt(r.hrb, 1), primary: type === "hrb" },
    { label: t("r.uts"), value: fmt(toDisp(r.uts, "stress"), 0), unit: uLabel("stress") },
  ]);
  highlightHardnessRow(r.hrc);
}

function renderHardnessTable() {
  const tbody = $("#hard-table tbody");
  const rows = typeof HARDNESS_EXTENDED !== "undefined" ? HARDNESS_EXTENDED : HARDNESS_TABLE.map((r) => [r[0], r[1], r[2], null, null, null, null, r[3]]);
  tbody.innerHTML = rows.map(
    (row) => `<tr data-hrc="${row[0]}">
      <td>${escapeHtml(row[0])}</td>
      <td>${escapeHtml(row[1] ?? "—")}</td>
      <td>${escapeHtml(row[2] ?? row[3] ?? "—")}</td>
      <td>${escapeHtml(row[4] ?? "—")}</td>
      <td>${escapeHtml(row[5] ?? "—")}</td>
      <td>${escapeHtml(row[6] ?? "—")}</td>
      <td>${escapeHtml(row[7] != null ? fmt(row[7], 0) : "—")}</td>
    </tr>`
  ).join("");
}

function highlightHardnessRow(hrc) {
  $$("#hard-table tbody tr").forEach((tr) => {
    const rowHrc = parseFloat(tr.dataset.hrc);
    tr.classList.toggle("row-highlight", hrc != null && Math.abs(rowHrc - hrc) <= 1);
  });
}

$("#hard-type").addEventListener("input", () => {
  // 換標尺時帶入合理預設值
  const defaults = { hrc: 45, hv: 450, hb: 300, hrb: 90 };
  $("#hard-value").value = defaults[$("#hard-type").value];
  updateHardness();
});
$("#hard-value").addEventListener("input", updateHardness);

/* =========================================================
 * 英寸 ⇄ 公制換算
 * ========================================================= */
let convInch = 1.375; // 內部狀態:小數英寸

function updateConvert() {
  const prec = parseInt($("#conv-prec").value, 10);
  if (convInch == null || !isFinite(convInch) || convInch < 0) {
    renderResults($("#conv-results"), [
      { label: t("r.mmv"), value: "—" },
      { label: t("r.inchDec"), value: "—" },
      { label: t("r.frac"), value: "—" },
      { label: t("r.fracErr"), value: "—" },
    ]);
    highlightFracRow(null);
    return;
  }
  const mm = convInch * 25.4;
  const fr = nearestFraction(convInch, prec);
  const errIn = fr.error;
  const errStr = Math.abs(errIn) < 1e-9
    ? t("conv.exact")
    : `${errIn > 0 ? "+" : "−"}${fmt(Math.abs(errIn))}″ (${errIn > 0 ? "+" : "−"}${fmt(Math.abs(errIn) * 25.4)} mm)`;

  renderResults($("#conv-results"), [
    { label: t("r.mmv"), value: fmt(mm), unit: "mm", primary: true },
    { label: t("r.inchDec"), value: fmt(convInch, 4), unit: "in" },
    { label: t("r.frac"), value: formatFraction(fr), primary: true },
    { label: t("r.fracErr"), value: errStr },
  ]);
  highlightFracRow(convInch);
}

function renderFracTable() {
  const tbody = $("#frac-table tbody");
  const rows = [];
  for (let i = 1; i <= 64; i++) {
    const fr = nearestFraction(i / 64, 64);
    rows.push(`<tr data-i64="${i}">
      <td>${escapeHtml(formatFraction(fr))}</td>
      <td>${escapeHtml((i / 64).toFixed(4))}</td>
      <td>${escapeHtml((i / 64 * 25.4).toFixed(3))}</td>
    </tr>`);
  }
  tbody.innerHTML = rows.join("");
}

function highlightFracRow(inches) {
  let idx = null;
  if (inches != null && isFinite(inches) && inches > 0) {
    const rem = inches % 1;
    idx = Math.round(rem * 64);
    if (idx === 0) idx = rem < 0.5 && inches < 1 ? null : 64; // 啱啱係整數吋 → 對應 64/64
  }
  $$("#frac-table tbody tr").forEach((tr) => {
    tr.classList.toggle("row-highlight", idx != null && parseInt(tr.dataset.i64, 10) === idx);
  });
}

$("#conv-inch").addEventListener("input", () => {
  const el = $("#conv-inch");
  const v = parseInches(el.value);
  el.classList.toggle("input-error", v == null && el.value.trim() !== "");
  convInch = v;
  if (v != null) $("#conv-mm").value = parseFloat((v * 25.4).toPrecision(6));
  updateConvert();
});

$("#conv-mm").addEventListener("input", () => {
  const mm = parseFloat($("#conv-mm").value);
  convInch = isFinite(mm) ? mm / 25.4 : null;
  if (convInch != null) {
    $("#conv-inch").value = parseFloat(convInch.toPrecision(6));
    $("#conv-inch").classList.remove("input-error");
  }
  updateConvert();
});

$("#conv-prec").addEventListener("input", updateConvert);

/* =========================================================
 * 直角三角形
 * ========================================================= */
const TRI_KEYS = ["a", "b", "c", "A", "B"];
let triEdited = ["a", "b"]; // 追蹤最近兩個由用戶輸入嘅欄位

function triInput(k) {
  const el = $(`#tri-${k}`);
  const v = parseFloat(el.value);
  triEdited = triEdited.filter((x) => x !== k);
  if (el.value.trim() !== "" && isFinite(v)) triEdited.push(k);
  if (triEdited.length > 2) triEdited = triEdited.slice(-2);
  solveTriangleUI();
}

function solveTriangleUI() {
  const note = $("#tri-note");
  TRI_KEYS.forEach((k) => $(`#tri-${k}`).classList.remove("computed"));

  const empty = [
    { label: t("lbl.sideC"), value: "—" },
    { label: t("r.area"), value: "—" },
    { label: t("r.perim"), value: "—" },
    { label: t("lbl.angA"), value: "—" },
  ];

  if (triEdited.length < 2) {
    note.textContent = "";
    renderResults($("#tri-results"), empty);
    return;
  }
  const known = {};
  let bad = false;
  triEdited.forEach((k) => {
    const v = parseFloat($(`#tri-${k}`).value);
    if (!isFinite(v)) bad = true;
    known[k] = v;
  });
  if (bad) { note.textContent = ""; renderResults($("#tri-results"), empty); return; }

  const r = solveRightTriangle(known);
  if (r.error) {
    note.textContent = t(r.error === "angles" ? "tri.errAngles" : r.error === "hyp" ? "tri.errHyp" : "tri.errInvalid");
    renderResults($("#tri-results"), empty);
    return;
  }
  note.textContent = "";
  TRI_KEYS.forEach((k) => {
    const el = $(`#tri-${k}`);
    if (!triEdited.includes(k)) {
      el.value = parseFloat(r[k].toPrecision(6));
      el.classList.add("computed");
    }
  });
  renderResults($("#tri-results"), [
    { label: t("lbl.sideA"), value: fmt(r.a) },
    { label: t("lbl.sideB"), value: fmt(r.b) },
    { label: t("lbl.sideC"), value: fmt(r.c), primary: true },
    { label: t("lbl.angA"), value: fmt(r.A, 3), unit: "°" },
    { label: t("lbl.angB"), value: fmt(r.B, 3), unit: "°" },
    { label: t("r.area"), value: fmt(r.area), primary: true },
    { label: t("r.perim"), value: fmt(r.perim) },
  ]);
}

TRI_KEYS.forEach((k) => $(`#tri-${k}`).addEventListener("input", () => triInput(k)));

// 「?」掣:將該欄位設為待計算(清空並由其餘已知值求解)
$$(".tri-q").forEach((btn) => {
  btn.addEventListener("click", () => {
    const k = btn.dataset.key;
    const el = $(`#tri-${k}`);
    el.value = "";
    el.classList.remove("computed");
    triEdited = triEdited.filter((x) => x !== k);
    solveTriangleUI();
  });
});

/* =========================================================
 * 公差配合(ISO 286)
 * ========================================================= */
function populateFitClasses() {
  const sel = $("#fit-class");
  const prev = sel.value;
  sel.innerHTML = "";
  const groups = [["fit.holes", FIT_CLASSES.holes], ["fit.shafts", FIT_CLASSES.shafts]];
  for (const [labelKey, list] of groups) {
    const og = document.createElement("optgroup");
    og.label = t(labelKey);
    list.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  }
  sel.value = prev && [...FIT_CLASSES.holes, ...FIT_CLASSES.shafts].includes(prev) ? prev : "H7";
}

function updateFits() {
  const D = num("#fit-d");
  const cls = $("#fit-class").value;
  const r = fitDeviation(cls, D);
  const sign = (v) => (v > 0 ? `+${fmt(v, 1)}` : v < 0 ? `−${fmt(Math.abs(v), 1)}` : "0");

  if (!r) {
    renderResults($("#fit-results"), [
      { label: t("r.es"), value: "—" },
      { label: t("r.ei"), value: "—" },
      { label: t("r.dmax"), value: "—" },
      { label: t("r.dmin"), value: "—" },
    ]);
    highlightFitRow(-1);
    return;
  }
  renderResults($("#fit-results"), [
    { label: `${t("r.es")} ${cls === cls.toUpperCase() ? "ES" : "es"}`, value: sign(r.upper), unit: "µm", primary: true },
    { label: `${t("r.ei")} ${cls === cls.toUpperCase() ? "EI" : "ei"}`, value: sign(r.lower), unit: "µm", primary: true },
    { label: t("r.dmax"), value: (D + r.upper / 1000).toFixed(3), unit: "mm" },
    { label: t("r.dmin"), value: (D + r.lower / 1000).toFixed(3), unit: "mm" },
    { label: t("r.itw"), value: fmt(r.it, 1), unit: "µm" },
    { label: t("lbl.fitClass"), value: `Ø${fmt(D)} ${cls}` },
  ]);
  highlightFitRow(fitRangeIndex(D));
}

function renderFitTable() {
  const tbody = $("#fit-table tbody");
  tbody.innerHTML = FIT_RANGES.map((hi, i) => {
    const lo = i === 0 ? 0 : FIT_RANGES[i - 1];
    const label = i === 0 ? `≤ ${hi}` : `>${lo}–${hi}`;
    return `<tr data-idx="${i}">
      <td>${escapeHtml(label)}</td>
      <td>+${escapeHtml(IT_GRADES[6][i])}</td>
      <td>+${escapeHtml(IT_GRADES[7][i])}</td>
      <td>+${escapeHtml(IT_GRADES[8][i])}</td>
      <td>+${escapeHtml(IT_GRADES[9][i])}</td>
    </tr>`;
  }).join("");
  renderFitItTable();
}

function renderFitItTable() {
  const head = $("#fit-it-head");
  const tbody = $("#fit-it-table tbody");
  if (!head || !tbody || typeof IT_FULL_GRADES === "undefined") return;
  const grades = Object.keys(IT_FULL_GRADES).map(Number).sort((a, b) => a - b);
  head.innerHTML = `<tr><th data-i18n="th.range">${escapeHtml(t("th.range"))}</th>${grades.map((g) => `<th>IT${g}</th>`).join("")}</tr>`;
  tbody.innerHTML = FIT_RANGES.map((hi, i) => {
    const lo = i === 0 ? 0 : FIT_RANGES[i - 1];
    const label = i === 0 ? `≤ ${hi}` : `>${lo}–${hi}`;
    return `<tr data-idx="${i}"><td>${escapeHtml(label)}</td>${grades.map((g) => `<td>${escapeHtml(IT_FULL_GRADES[g][i])}</td>`).join("")}</tr>`;
  }).join("");
}

function highlightFitRow(idx) {
  $$("#fit-table tbody tr").forEach((tr) => {
    tr.classList.toggle("row-highlight", parseInt(tr.dataset.idx, 10) === idx);
  });
}

$("#fit-d").addEventListener("input", updateFits);
$("#fit-class").addEventListener("input", updateFits);

/* =========================================================
 * 工程參考
 * ========================================================= */
let refMode = "metal";

function tRef(key) {
  return t(key) !== key ? t(key) : key;
}

function refSearchHaystack(mode, row) {
  if (mode === "metal") return row.join(" ").toLowerCase();
  if (mode === "mold") return row.join(" ").toLowerCase();
  if (mode === "rough") return row.join(" ").toLowerCase();
  if (mode === "element") return row.join(" ").toLowerCase();
  return "";
}

function renderRefTable() {
  const thead = $("#ref-table thead");
  const tbody = $("#ref-table tbody");
  const q = ($("#ref-search")?.value || "").trim().toLowerCase();
  if (!thead || !tbody) return;

  if (refMode === "metal") {
    thead.innerHTML = `<tr>
      <th>${escapeHtml(t("ref.th.code"))}</th><th>${escapeHtml(t("ref.th.cat"))}</th>
      <th>${escapeHtml(t("ref.th.tensile"))}</th><th>${escapeHtml(t("ref.th.hard"))}</th>
      <th>${escapeHtml(t("ref.th.cond"))}</th><th>${escapeHtml(t("ref.th.comp"))}</th>
      <th>${escapeHtml(t("ref.th.note"))}</th></tr>`;
    const rows = REF_METALS.filter((r) => !q || refSearchHaystack("metal", r).includes(q));
    tbody.innerHTML = rows.map((r) => `<tr>
      <td><strong>${escapeHtml(r[0])}</strong></td>
      <td>${escapeHtml(tRef("ref.cat." + r[1]))}</td>
      <td>${escapeHtml(r[2])}</td><td>${escapeHtml(r[3])}</td>
      <td>${escapeHtml(r[4])}</td><td>${escapeHtml(r[5])}</td><td>${escapeHtml(r[6])}</td>
    </tr>`).join("");
    return;
  }

  if (refMode === "mold") {
    const brands = MOLD_BRAND_KEYS;
    thead.innerHTML = `<tr>
      <th>${escapeHtml(t("ref.th.cat"))}</th><th>${escapeHtml(t("ref.th.jis"))}</th><th>${escapeHtml(t("ref.th.aisi"))}</th>
      ${brands.map((b) => `<th>${escapeHtml(t("ref.brand." + b))}</th>`).join("")}
      <th>${escapeHtml(t("ref.th.hrc"))}</th></tr>`;
    const rows = REF_MOLD_STEELS.filter((r) => !q || refSearchHaystack("mold", r).includes(q));
    tbody.innerHTML = rows.map((r) => `<tr>
      <td>${escapeHtml(tRef("ref.mold." + r[0]))}</td>
      <td>${escapeHtml(r[1] || "—")}</td><td>${escapeHtml(r[2] || "—")}</td>
      ${r.slice(3, 9).map((c) => `<td>${escapeHtml(c || "—")}</td>`).join("")}
      <td>${escapeHtml(r[9])}</td></tr>`).join("");
    return;
  }

  if (refMode === "rough") {
    thead.innerHTML = `<tr>
      <th>${escapeHtml(t("ref.th.process"))}</th><th>${escapeHtml(t("ref.th.ra"))}</th>
      <th>${escapeHtml(t("ref.th.fine"))}</th></tr>`;
    const rows = REF_ROUGHNESS.filter((r) => !q || refSearchHaystack("rough", r).includes(q));
    tbody.innerHTML = rows.map((r) => {
      const ra = `${r[1]}–${r[2]}`;
      const fine = r[3] != null ? `${r[3]}–${r[4]}` : "—";
      return `<tr>
        <td>${escapeHtml(tRef("ref.proc." + r[0]))}</td>
        <td>${escapeHtml(ra)}</td><td>${escapeHtml(fine)}</td></tr>`;
    }).join("");
    return;
  }

  if (refMode === "element") {
    thead.innerHTML = `<tr>
      <th>${escapeHtml(t("ref.th.sym"))}</th><th>${escapeHtml(t("ref.th.el"))}</th>
      <th>${escapeHtml(t("ref.th.fx"))}</th></tr>`;
    const rows = REF_ELEMENTS.filter((r) => {
      if (!q) return true;
      const hay = `${r[0]} ${tRef(r[1])} ${tRef(r[2])}`.toLowerCase();
      return hay.includes(q);
    });
    tbody.innerHTML = rows.map((r) => `<tr>
      <td><strong>${escapeHtml(r[0])}</strong></td>
      <td>${escapeHtml(tRef(r[1]))}</td><td>${escapeHtml(tRef(r[2]))}</td></tr>`).join("");
    return;
  }

  // IT 公差
  const grades = Object.keys(IT_FULL_GRADES).map(Number).sort((a, b) => a - b);
  thead.innerHTML = `<tr><th>${escapeHtml(t("th.range"))}</th>${grades.map((g) => `<th>IT${g}</th>`).join("")}</tr>`;
  tbody.innerHTML = FIT_RANGES.map((hi, i) => {
    const lo = i === 0 ? 0 : FIT_RANGES[i - 1];
    const label = i === 0 ? `≤ ${hi}` : `>${lo}–${hi}`;
    if (q && !label.includes(q) && !grades.some((g) => String(IT_FULL_GRADES[g][i]).includes(q))) return "";
    return `<tr><td>${escapeHtml(label)}</td>${grades.map((g) => `<td>${escapeHtml(IT_FULL_GRADES[g][i])}</td>`).join("")}</tr>`;
  }).join("");
}

$$("#ref-seg .seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$("#ref-seg .seg-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    refMode = btn.dataset.val;
    const search = $("#ref-search");
    if (search) search.classList.toggle("hidden", refMode === "it" || refMode === "element");
    renderRefTable();
  });
});
$("#ref-search")?.addEventListener("input", renderRefTable);

/* =========================================================
 * 參數對比
 * ========================================================= */
const CMP_FIELDS = [
  { key: "d", labelKey: "lbl.toolDia", kind: "len", a: 10, b: 10 },
  { key: "z", labelKey: "lbl.flutes", kind: null, a: 4, b: 4 },
  { key: "vc", labelKey: "lbl.vc", kind: "vc", a: 180, b: 220 },
  { key: "fz", labelKey: "lbl.fz", kind: "len", a: 0.05, b: 0.08 },
  { key: "ap", labelKey: "lbl.ap", kind: "len", a: 5, b: 5 },
  { key: "ae", labelKey: "lbl.ae", kind: "len", a: 5, b: 5 },
];

function buildCompareInputs() {
  $$(".compare-inputs").forEach((wrap) => {
    const scheme = wrap.dataset.scheme;
    // 保留現值(語言切換重建時;值一律為當前顯示單位)
    const prev = {};
    CMP_FIELDS.forEach((f) => {
      const el = $(`#cmp-${scheme}-${f.key}`);
      if (el) prev[f.key] = el.value;
    });
    wrap.innerHTML = CMP_FIELDS.map((f) => {
      const val = prev[f.key] ?? parseFloat((f.kind ? toDisp(f[scheme], f.kind) : f[scheme]).toPrecision(4));
      const em = f.kind ? ` <em data-ukind="${escapeHtml(f.kind)}">${escapeHtml(uLabel(f.kind))}</em>` : "";
      const ukind = f.kind ? ` data-ukind="${escapeHtml(f.kind)}"` : "";
      return `
      <div class="field">
        <label><span>${escapeHtml(t(f.labelKey))}</span>${em}</label>
        <input type="number" id="cmp-${scheme}-${f.key}" value="${escapeHtml(val)}" step="any" min="0"${ukind}>
      </div>`;
    }).join("");
    wrap.style.display = "grid";
    wrap.style.gridTemplateColumns = "1fr 1fr";
    wrap.style.gap = "0 14px";
  });
}

function computeScheme(scheme) {
  const g = (k) => numM(`#cmp-${scheme}-${k}`);
  const d = g("d"), z = g("z"), vc = g("vc"), fz = g("fz"), ap = g("ap"), ae = g("ae");
  if (d <= 0) return null;
  const n = rpmFromVc(vc, d);
  const vf = feedMilling(n, z, fz);
  const q = mrrMilling(ap, ae, vf);
  const hm = avgChipThickness(fz, ae, d);
  // 用中性鋼材 kc 做兩方案一致嘅功率比較基準
  const kc = specificCuttingForce(1800, 0.25, hm);
  const pc = powerFromMrr(q, kc);
  return { d, z, vc, fz, ap, ae, n, vf, q, hm, pc };
}

function deltaCell(a, b, higherIsBetter = null) {
  if (a == null || b == null || a === 0) return `<td class="delta-flat">—</td>`;
  const pct = ((b - a) / a) * 100;
  if (Math.abs(pct) < 0.05) return `<td class="delta-flat">${escapeHtml(t("cmp.same"))}</td>`;
  const sign = pct > 0 ? "+" : "";
  let cls = "delta-flat";
  if (higherIsBetter === true) cls = pct > 0 ? "delta-up" : "delta-down";
  if (higherIsBetter === false) cls = pct > 0 ? "delta-down" : "delta-up";
  return `<td class="${cls}">${escapeHtml(`${sign}${fmt(pct, 1)}%`)}</td>`;
}

function updateCompare() {
  const a = computeScheme("a");
  const b = computeScheme("b");
  const tbody = $("#cmp-table tbody");
  if (!a || !b) { tbody.innerHTML = ""; return; }

  const nExp = parseFloat($("#cmp-toolmat").value);
  const lifeRatio = taylorLifeRatio(a.vc, b.vc, nExp);
  const dv = (v, kind) => fmt(toDisp(v, kind));

  const rows = [
    [`${t("r.rpm")} (rpm)`, fmt(a.n, 0), fmt(b.n, 0), deltaCell(a.n, b.n)],
    [`${t("r.vf")} (${uLabel("feedRate")})`, fmt(toDisp(a.vf, "feedRate"), 0), fmt(toDisp(b.vf, "feedRate"), 0), deltaCell(a.vf, b.vf, true)],
    [`${t("r.q")} (${uLabel("mrr")})`, dv(a.q, "mrr"), dv(b.q, "mrr"), deltaCell(a.q, b.q, true)],
    [`${t("r.hm")} (${uLabel("len")})`, dv(a.hm, "len"), dv(b.hm, "len"), deltaCell(a.hm, b.hm)],
    [`${t("r.pc")} (${uLabel("power")})`, dv(a.pc, "power"), dv(b.pc, "power"), deltaCell(a.pc, b.pc, false)],
    [t("cmp.r.time100"), fmt(a.q > 0 ? 100 / a.q : null), fmt(b.q > 0 ? 100 / b.q : null), deltaCell(a.q > 0 ? 100 / a.q : null, b.q > 0 ? 100 / b.q : null, false)],
    [
      t("cmp.r.life"),
      "1.00×",
      lifeRatio != null ? fmt(lifeRatio, 2) + "×" : "—",
      lifeRatio != null
        ? `<td class="${lifeRatio >= 1 ? "delta-up" : "delta-down"}">${escapeHtml(`${lifeRatio >= 1 ? "+" : ""}${fmt((lifeRatio - 1) * 100, 1)}%`)}</td>`
        : `<td class="delta-flat">—</td>`,
    ],
  ];

  tbody.innerHTML = rows
    .map((r) => {
      const deltaHtml = r[3].startsWith("<td") ? r[3] : `<td>${escapeHtml(r[3])}</td>`;
      return `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td>${deltaHtml}</tr>`;
    })
    .join("");

  renderRoi(a, b, nExp);
}

/* ---- ROI:每件成本 = 機台工時 + 刀具消耗 ---- */
function partCost(scheme, matVol, machineRate, toolLife, toolCost) {
  if (!scheme || scheme.q <= 0) return null;
  const tCut = matVol / scheme.q;                       // 每件加工時間 (min)
  const machine = tCut * (machineRate / 60);            // 機台成本
  const tool = toolLife > 0 ? (tCut / toolLife) * toolCost : 0; // 刀具消耗
  return { tCut, machine, tool, total: machine + tool };
}

function renderRoi(a, b, nExp) {
  const tbody = $("#roi-table tbody");
  const cta = $("#roi-cta");
  const cur = SHOP_CONFIG.currency || "$";
  const vol = num("#roi-vol"), rate = num("#roi-rate"),
    lifeA = num("#roi-life"), toolCost = num("#roi-toolcost"), qty = num("#roi-qty");

  const lifeRatio = taylorLifeRatio(a.vc, b.vc, nExp) ?? 1;
  const lifeB = lifeA * lifeRatio;
  const cA = partCost(a, vol, rate, lifeA, toolCost);
  const cB = partCost(b, vol, rate, lifeB, toolCost);
  if (!cA || !cB) { tbody.innerHTML = ""; cta.innerHTML = ""; return; }

  const money = (v) => `${cur}${fmt(v, 2)}`;
  const rows = [
    [`${t("roi.timePart")} (min)`, fmt(cA.tCut, 2), fmt(cB.tCut, 2), deltaCell(cA.tCut, cB.tCut, false)],
    [`${t("roi.toolLife")} (min)`, fmt(lifeA, 0), fmt(lifeB, 0), deltaCell(lifeA, lifeB, true)],
    [`${t("roi.costPart")} (${cur})`, money(cA.total), money(cB.total), deltaCell(cA.total, cB.total, false)],
  ];
  tbody.innerHTML = rows.map((r) => {
    const d = r[3].startsWith("<td") ? r[3] : `<td>${escapeHtml(r[3])}</td>`;
    return `<tr><td>${escapeHtml(r[0])}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td>${d}</tr>`;
  }).join("");

  // CTA:邊個方案每件平啲 → 慳幾多 + 加入詢價單
  const save = cA.total - cB.total;                     // >0 表示 B 平
  const rel = Math.max(cA.total, cB.total) || 1;
  if (Math.abs(save) / rel < 0.005) {
    cta.innerHTML = `<div class="roi-flat">${escapeHtml(t("roi.ctaNone"))}</div>`;
    return;
  }
  const better = save > 0 ? "B" : "A";
  const perPart = Math.abs(save);
  const batch = perPart * (qty > 0 ? qty : 1);
  const betterScheme = save > 0 ? b : a;
  cta.innerHTML = `
    <div class="roi-save">
      <div class="roi-save-txt">${escapeHtml(t("roi.ctaSave", {
        s: t(better === "A" ? "cmp.schemeA" : "cmp.schemeB"),
        per: money(perPart), batch: money(batch), qty: fmt(qty, 0),
      }))}</div>
      <button class="pc-restock roi-add" type="button">🧾 ${escapeHtml(t("roi.ctaBtn"))}</button>
    </div>`;
  cta.querySelector(".roi-add").addEventListener("click", (e) => {
    if (typeof addToInquiry === "function") {
      addToInquiry({
        id: "roi-lead",
        name: t("roi.leadName"),
        ctx: t("roi.leadCtx", {
          s: t(better === "A" ? "cmp.schemeA" : "cmp.schemeB"),
          vc: `${fmt(toDisp(betterScheme.vc, "vc"), 0)}${uLabel("vc")}`,
          fz: `${fmt(toDisp(betterScheme.fz, "len"))}${uLabel("len")}`,
          save: money(batch),
        }),
      });
      flashAdded(e.currentTarget);
    }
  });
}

// 事件委派:重建輸入欄後毋須重新綁定
$$(".compare-inputs").forEach((wrap) => wrap.addEventListener("input", updateCompare));
$("#cmp-toolmat").addEventListener("input", updateCompare);
["#roi-vol", "#roi-rate", "#roi-life", "#roi-toolcost", "#roi-qty"].forEach((id) =>
  $(id).addEventListener("input", updateCompare)
);

/* =========================================================
 * 刀具建議
 * ========================================================= */
function updateAdvisor() {
  const m = getMaterial($("#adv-material").value);
  const op = $("#adv-op").value;
  const d = numM("#adv-d");
  const advice = tAdvice(m.iso, op);
  const color = ISO_GROUPS[m.iso].color;

  const vcStart = m.vcCarbide[0] + (m.vcCarbide[1] - m.vcCarbide[0]) * 0.3; // 保守起始值
  const n = d > 0 ? rpmFromVc(vcStart, d) : null;
  const rangeDisp = (lo, hi, kind, digits) => `${fmt(toDisp(lo, kind), digits)}–${fmt(toDisp(hi, kind), digits)}`;

  const params = [
    { label: t("adv.vcRange"), value: rangeDisp(m.vcCarbide[0], m.vcCarbide[1], "vc", 0), unit: uLabel("vc") },
    { label: t("adv.vcStart"), value: fmt(toDisp(vcStart, "vc"), 0), unit: uLabel("vc"), primary: true },
    { label: t("adv.rpmStart"), value: fmt(n, 0), unit: "rpm", primary: true },
  ];

  if (op === "milling") {
    const fz = baseFz(d) * m.fzFactor;
    params.push(
      { label: t("adv.fz"), value: fmt(toDisp(fz, "len")), unit: uLabel("len") },
      { label: t("adv.apRough"), value: `≤ ${fmt(toDisp(d * 1.5, "len"))}`, unit: uLabel("len") },
      { label: t("adv.aeRough"), value: rangeDisp(d * 0.2, d * 0.4, "len"), unit: uLabel("len") }
    );
  } else if (op === "turning") {
    params.push(
      { label: t("adv.fRough"), value: rangeDisp(0.2, 0.4, "len"), unit: uLabel("feedRev") },
      { label: t("adv.fFinish"), value: rangeDisp(0.08, 0.15, "len"), unit: uLabel("feedRev") },
      { label: t("adv.apTurn"), value: rangeDisp(2, 5, "len"), unit: uLabel("len") }
    );
  } else {
    const f = baseDrillF(d) * m.fzFactor;
    params.push(
      { label: t("adv.f"), value: fmt(toDisp(f, "len")), unit: uLabel("feedRev") },
      { label: t("adv.vcDrill"), value: rangeDisp(m.vcCarbide[0] * 0.6, m.vcCarbide[1] * 0.5, "vc", 0), unit: uLabel("vc") }
    );
  }

  renderResults($("#adv-params"), params);

  $("#adv-advice").innerHTML = `
    <span class="iso-badge" style="background:${color}22;color:${color};border:1px solid ${color}66">
      ISO ${escapeHtml(tIso(m.iso))}
    </span>
    <div class="advice-block"><div class="atitle">🔷 ${escapeHtml(t("at.grade"))}</div><p>${escapeHtml(advice.grade)}</p></div>
    <div class="advice-block"><div class="atitle">🎨 ${escapeHtml(t("at.coating"))}</div><p>${escapeHtml(advice.coating)}</p></div>
    <div class="advice-block"><div class="atitle">📐 ${escapeHtml(t("at.geometry"))}</div><p>${escapeHtml(advice.geometry)}</p></div>
    <div class="advice-block"><div class="atitle">💧 ${escapeHtml(t("at.coolant"))}</div><p>${escapeHtml(advice.coolant)}</p></div>
    <div class="advice-block"><div class="atitle">💡 ${escapeHtml(t("at.tips"))}</div><p>${escapeHtml(advice.tips)}</p></div>
  `;

  if (typeof renderAdvisorShop === "function") renderAdvisorShop(m, op, d);
}

["#adv-material", "#adv-op", "#adv-d"].forEach((id) => $(id).addEventListener("input", updateAdvisor));

/* =========================================================
 * 刀片 ISO 代碼解讀(ISO 1832)
 * ========================================================= */
function renderInsertExamples() {
  $("#insert-examples").innerHTML = INSERT_EXAMPLES
    .map((c) => `<button type="button" class="chip" data-code="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
    .join("");
}

function updateInsert() {
  const el = $("#insert-code");
  const r = decodeInsert(el.value);
  const results = $("#insert-results");
  const tbody = $("#insert-table tbody");
  const note = $("#insert-note");

  if (r.error) {
    el.classList.toggle("input-error", r.error === "format");
    renderResults(results, [
      { label: t("r.shape"), value: "—" }, { label: t("r.clearance"), value: "—" },
      { label: t("r.edgeLen"), value: "—" }, { label: t("r.thick"), value: "—" },
      { label: t("r.nose"), value: "—" }, { label: t("r.maxAp"), value: "—" },
    ]);
    tbody.innerHTML = "";
    note.textContent = t(r.error === "empty" ? "ins.errEmpty" : "ins.errFormat");
    if (typeof renderInsertShop === "function") renderInsertShop(r);
    return;
  }
  el.classList.remove("input-error");

  // 形狀
  const geomWord = r.shapeKnown ? tIns("geom." + r.shapeGeom) : t("ins.unknown");
  const shapeVal = r.shapeAngle != null ? `${geomWord} ${r.shapeAngle}°` : geomWord;

  // 後角 + 正/負型
  let clearVal, polarity = null;
  if (!r.clearKnown) clearVal = `${r.clear} · ${t("ins.unknown")}`;
  else if (r.clearAngle === 0) { clearVal = `0° · ${tIns("neg")}`; polarity = "neg"; }
  else if (r.clearAngle == null) clearVal = tIns("special");
  else { clearVal = `${r.clearAngle}° · ${tIns("pos")}`; polarity = "pos"; }

  const edgeLenVal = r.sizeNum != null ? `≈ ${r.sizeNum} mm` : r.sizeC;
  const thickVal = r.thickMm != null ? `${fmt(r.thickMm, 2)} mm` : r.thickC;
  const noseVal = r.noseSharp ? t("ins.sharp") : (r.noseMm != null ? `${fmt(r.noseMm, 2)} mm` : r.noseC);
  const maxAp = r.sizeNum != null ? r.sizeNum * (2 / 3) : null;
  const maxApVal = maxAp != null ? `≤ ${fmt(maxAp, 1)} mm` : "—";

  renderResults(results, [
    { label: t("r.shape"), value: shapeVal, primary: true },
    { label: t("r.clearance"), value: clearVal, primary: true },
    { label: t("r.edgeLen"), value: edgeLenVal },
    { label: t("r.thick"), value: thickVal },
    { label: t("r.nose"), value: noseVal, primary: true },
    { label: t("r.maxAp"), value: maxApVal },
  ]);

  // 位置說明表
  const typeVal = r.typeKnown ? tIns("type." + r.type) : t("ins.unknown");
  const rows = [
    ["1", r.shape, `${t("ins.p1")}:${shapeVal}`],
    ["2", r.clear, `${t("ins.p2")}:${clearVal}`],
    ["3", r.tol, `${t("ins.tolClass")} ${r.tol}`],
    ["4", r.type, `${t("ins.p4")}:${typeVal}`],
    ["5", r.sizeC, `${t("ins.p5")}:${edgeLenVal}`],
    ["6", r.thickC, `${t("ins.p6")}:${thickVal}`],
    ["7", r.noseC, `${t("ins.p7")}:${noseVal}`],
  ];
  if (r.edge) rows.push(["8", r.edge, `${t("ins.p8")}:${tIns("edge." + r.edge)}`]);
  if (r.hand) rows.push(["9", r.hand, `${t("ins.p9")}:${tIns("hand." + r.hand)}`]);
  tbody.innerHTML = rows
    .map((row) => `<tr><td>${escapeHtml(row[0])}</td><td>${escapeHtml(row[1])}</td><td>${escapeHtml(row[2])}</td></tr>`)
    .join("");

  // 備註:公差 + 切深/進給建議 + 正負型 + 廠商尾碼
  const parts = [t("ins.tolNote", { cls: r.tol })];
  if (r.sizeNum != null) parts.push(t("ins.apTip", { l: r.sizeNum, ap: fmt(maxAp, 1) }));
  if (r.noseMm > 0) {
    parts.push(t("ins.feedTip", {
      r: fmt(r.noseMm, 2),
      lo: fmt(r.noseMm * 0.3, 2),
      hi: fmt(r.noseMm * 0.5, 2),
      rough: fmt(r.noseMm * 0.8, 2),
    }));
  }
  if (polarity === "neg") parts.push(t("ins.negNote"));
  else if (polarity === "pos") parts.push(t("ins.posNote"));
  if (r.extra) parts.push(t("ins.extraNote", { s: r.extra }));
  note.textContent = parts.join(" ");

  if (typeof renderInsertShop === "function") renderInsertShop(r);
}

$("#insert-code").addEventListener("input", updateInsert);
$("#insert-examples").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  $("#insert-code").value = btn.dataset.code;
  updateInsert();
});

/* =========================================================
 * 圓弧/螺旋插補進給補償
 * ========================================================= */
let interpMode = "internal";

$$('.seg[data-group="ip-mode"] .seg-btn').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.seg[data-group="ip-mode"] .seg-btn').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    interpMode = btn.dataset.val;
    updateInterp();
  });
});

function updateInterp() {
  $("#ip-circle-hint").textContent = t(interpMode === "internal" ? "ip.hintInt" : "ip.hintExt");

  const dTool = numM("#ip-dtool"), dCircle = numM("#ip-dcircle"),
    n = num("#ip-n"), z = num("#ip-z"), fz = numM("#ip-fz"), pitch = numM("#ip-pitch");
  const vfEdge = n * z * fz;
  const r = interpFeedComp(interpMode, dTool, dCircle, vfEdge, pitch);

  const empty = [
    { label: t("ip.factor"), value: "—" },
    { label: t("ip.progFeed"), value: "—" },
  ];
  if (!r || r.error) {
    renderResults($("#ip-results"), empty);
    $("#ip-note").textContent = r && r.error === "fit" ? t("ip.errFit") : "";
    return;
  }

  const fzUncomp = r.k > 0 ? fz / r.k : null; // 唔補償時刀刃實際 fz

  const items = [
    { label: t("ip.factor"), value: fmt(r.k, 3), unit: "×", primary: true },
    { label: t("ip.centerDia"), value: fmt(toDisp(r.dCenter, "len")), unit: uLabel("len") },
    { label: t("ip.edgeFeed"), value: fmt(toDisp(vfEdge, "feedRate")), unit: uLabel("feedRate") },
    { label: t("ip.progFeed"), value: fmt(toDisp(r.vfCenter, "feedRate")), unit: uLabel("feedRate"), primary: true },
    { label: t("ip.uncompFz"), value: fmt(toDisp(fzUncomp, "len")), unit: uLabel("len") },
  ];
  if (r.ramp != null) items.push({ label: t("ip.rampAngle"), value: fmt(r.ramp, 1), unit: "°" });
  renderResults($("#ip-results"), items);

  let note = t(interpMode === "internal" ? "ip.noteInt" : "ip.noteExt", {
    k: fmt(r.k, 3),
    pct: fmt(Math.abs(1 - r.k) * 100, 1),
  });
  if (r.ramp != null) note += " " + t("ip.noteHelix", { a: fmt(r.ramp, 1) });
  note += " " + t("ip.noteThin");
  $("#ip-note").textContent = note;
}

["#ip-dtool", "#ip-dcircle", "#ip-n", "#ip-z", "#ip-fz", "#ip-pitch"].forEach((id) =>
  $(id).addEventListener("input", updateInterp)
);

/* =========================================================
 * G-code 產生器(輸出一律 ASCII 英文,方便各控制器)
 * ========================================================= */
let gcodeMode = "bolt";

function gnum(v) { return (+(+v).toFixed(4)).toString(); }

function genBoltCircle(g) {
  const r = g.bcd / 2;
  const L = [];
  L.push(`(BOLT CIRCLE - ${g.holes} holes, BCD ${gnum(g.bcd)})`);
  L.push(`${g.gcode} G90 G54`);
  L.push(`S${gnum(g.s)} M3`);
  L.push(`G0 Z${gnum(g.safeZ)}`);
  const pts = [];
  for (let i = 0; i < g.holes; i++) {
    const a = ((g.startAng + (i * 360) / g.holes) * Math.PI) / 180;
    pts.push([g.cx + r * Math.cos(a), g.cy + r * Math.sin(a)]);
  }
  L.push(`G0 X${gnum(pts[0][0])} Y${gnum(pts[0][1])}`);
  L.push(g.q > 0
    ? `G99 G83 R${gnum(g.rPlane)} Z${gnum(-g.depth)} Q${gnum(g.q)} F${gnum(g.f)}`
    : `G99 G81 R${gnum(g.rPlane)} Z${gnum(-g.depth)} F${gnum(g.f)}`);
  for (let i = 1; i < pts.length; i++) L.push(`X${gnum(pts[i][0])} Y${gnum(pts[i][1])}`);
  L.push(`G80`, `G0 Z${gnum(g.safeZ)}`, `M5`, `M30`);
  return L.join("\n");
}

function genHelicalBore(g) {
  const r = (g.dbore - g.dtool) / 2;
  if (r <= 0) return "(ERROR: tool diameter >= bore diameter, cannot helical bore)";
  const pitch = g.pitch > 0 ? g.pitch : g.depth;
  const revs = Math.max(1, Math.ceil(g.depth / pitch));
  const dz = g.depth / revs;
  const sx = g.cx + r;
  const L = [];
  L.push(`(HELICAL BORE hole ${gnum(g.dbore)} with tool ${gnum(g.dtool)}, ${revs} revs)`);
  L.push(`${g.gcode} G90 G54`);
  L.push(`S${gnum(g.s)} M3`);
  L.push(`G0 Z${gnum(g.safeZ)}`);
  L.push(`G0 X${gnum(sx)} Y${gnum(g.cy)}`);
  L.push(`G0 Z${gnum(g.rPlane)}`);
  L.push(`G1 Z0 F${gnum(g.f)}`);
  for (let i = 1; i <= revs; i++) {
    L.push(`G3 X${gnum(sx)} Y${gnum(g.cy)} I${gnum(-r)} J0 Z${gnum(-dz * i)} F${gnum(g.f)}`);
  }
  L.push(`G3 X${gnum(sx)} Y${gnum(g.cy)} I${gnum(-r)} J0`); // 最後平圈修光
  L.push(`G0 Z${gnum(g.safeZ)}`, `M5`, `M30`);
  return L.join("\n");
}

function genFaceMill(g) {
  const passes = Math.max(1, Math.ceil(g.l / g.ae));
  const stepY = g.l / passes;
  const L = [];
  L.push(`(FACE MILL ${gnum(g.w)} x ${gnum(g.l)}, tool ${gnum(g.dtool)}, stepover ${gnum(g.ae)}, ${passes + 1} passes)`);
  L.push(`${g.gcode} G90 G54`);
  L.push(`S${gnum(g.s)} M3`);
  L.push(`G0 Z${gnum(g.safeZ)}`);
  L.push(`G0 X${gnum(g.x0)} Y${gnum(g.y0)}`);
  L.push(`G0 Z${gnum(g.rPlane)}`);
  L.push(`G1 Z${gnum(-g.depth)} F${gnum(g.f)}`);
  for (let i = 0; i <= passes; i++) {
    const xTarget = i % 2 === 0 ? g.x0 + g.w : g.x0;
    L.push(`G1 X${gnum(xTarget)} F${gnum(g.f)}`);
    if (i < passes) L.push(`Y${gnum(g.y0 + stepY * (i + 1))}`);
  }
  L.push(`G0 Z${gnum(g.safeZ)}`, `M5`, `M30`);
  return L.join("\n");
}

$$('.seg[data-group="gc-mode"] .seg-btn').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.seg[data-group="gc-mode"] .seg-btn').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    gcodeMode = btn.dataset.val;
    $$(".gcode-group").forEach((gp) => gp.classList.toggle("hidden", gp.dataset.mode !== gcodeMode));
    updateGcode();
  });
});

function updateGcode() {
  const imperial = UNITS === "imperial";
  $$(".gc-ulen").forEach((e) => (e.textContent = imperial ? "in" : "mm"));
  $$(".gc-ufeed").forEach((e) => (e.textContent = imperial ? "in/min" : "mm/min"));
  const base = {
    gcode: imperial ? "G20" : "G21",
    s: num("#gc-rpm"), f: num("#gc-feed"),
    rPlane: num("#gc-rplane"), safeZ: num("#gc-safez"),
  };
  let out = "";
  if (gcodeMode === "bolt") {
    out = genBoltCircle({ ...base, cx: num("#gc-cx"), cy: num("#gc-cy"), bcd: num("#gc-bcd"),
      holes: Math.max(1, Math.round(num("#gc-holes"))), startAng: num("#gc-startang"),
      depth: num("#gc-depth-b"), q: num("#gc-peck") });
  } else if (gcodeMode === "helix") {
    out = genHelicalBore({ ...base, cx: num("#gc-hcx"), cy: num("#gc-hcy"), dbore: num("#gc-bore"),
      dtool: num("#gc-htool"), depth: num("#gc-depth-h"), pitch: num("#gc-pitch") });
  } else {
    out = genFaceMill({ ...base, x0: num("#gc-x0"), y0: num("#gc-y0"), w: num("#gc-width"),
      l: num("#gc-length"), dtool: num("#gc-ftool"), ae: num("#gc-stepover"), depth: num("#gc-depth-f") });
  }
  $("#gcode-out").value = out;
}

/* =========================================================
 * 材料重量 / 成本
 * ========================================================= */
let wtShape = "block";

$$('.seg[data-group="wt-shape"] .seg-btn').forEach((btn) => {
  btn.addEventListener("click", () => {
    $$('.seg[data-group="wt-shape"] .seg-btn').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    wtShape = btn.dataset.val;
    $$(".wt-group").forEach((g) => g.classList.toggle("hidden", g.dataset.shape !== wtShape));
    updateWeight();
  });
});

function updateWeight() {
  $$(".wt-cur").forEach((e) => (e.textContent = SHOP_CONFIG.currency || "$"));
  const density = num("#wt-density");
  let vol = 0;
  if (wtShape === "block") vol = stockVolume("block", { l: numM("#wt-l"), w: numM("#wt-w"), h: numM("#wt-h") });
  else if (wtShape === "round") vol = stockVolume("round", { dia: numM("#wt-d"), len: numM("#wt-len") });
  else vol = stockVolume("tube", { od: numM("#wt-od"), id: numM("#wt-id"), len: numM("#wt-tlen") });

  const wKg = (vol * density) / 1000;       // g/cm³ × cm³ = g → kg
  const wLb = wKg * 2.20462;
  const qty = Math.max(1, Math.round(num("#wt-qty")));
  const costKg = num("#wt-cost");
  const cur = SHOP_CONFIG.currency || "$";
  const costPer = wKg * costKg;
  const money = (v) => (costKg > 0 ? `${cur}${fmt(v, 2)}` : "—");

  renderResults($("#wt-results"), [
    { label: t("wt.vol"), value: fmt(vol, 2), unit: "cm³" },
    { label: t("wt.wPer"), value: fmt(wKg, 3), unit: "kg", primary: true },
    { label: t("wt.wPerLb"), value: fmt(wLb, 3), unit: "lb" },
    { label: t("wt.wTotal"), value: fmt(wKg * qty, 2), unit: "kg", primary: true },
    { label: t("wt.costPer"), value: money(costPer) },
    { label: t("wt.costTotal"), value: money(costPer * qty), primary: costKg > 0 },
  ]);
}

$("#wt-material").addEventListener("input", () => {
  const m = getMaterial($("#wt-material").value);
  if (m && m.density) $("#wt-density").value = m.density;
  updateWeight();
});
["#wt-density", "#wt-l", "#wt-w", "#wt-h", "#wt-d", "#wt-len",
  "#wt-od", "#wt-id", "#wt-tlen", "#wt-qty", "#wt-cost"].forEach((id) =>
  $(id).addEventListener("input", updateWeight)
);

$("#gcode-params").addEventListener("input", updateGcode);
$("#gcode-copy").addEventListener("click", async () => {
  const ta = $("#gcode-out");
  try { await navigator.clipboard.writeText(ta.value); }
  catch (e) { ta.select(); try { document.execCommand("copy"); } catch (e2) {} }
  const b = $("#gcode-copy"), old = b.textContent;
  b.textContent = t("gc.copied");
  setTimeout(() => { b.textContent = old; }, 1200);
});

/* =========================================================
 * 全頁刷新
 * ========================================================= */
function updateAllOutputs() {
  renderTapTable();
  renderHardnessTable();
  updateMilling();
  updateTurning();
  updateDrilling();
  updateTapping();
  updateSurface();
  updateScallop();
  updateHardness();
  updateConvert();
  solveTriangleUI();
  updateFits();
  updateCompare();
  updateAdvisor();
  updateInsert();
  updateInterp();
  updateGcode();
  updateWeight();
}

function refreshAll() {
  applyStaticI18n();
  applyUnitLabels();
  populateMaterialSelect($("#mill-material"));
  populateMaterialSelect($("#turn-material"));
  populateMaterialSelect($("#drill-material"));
  populateMaterialSelect($("#adv-material"));
  populateMaterialSelect($("#wt-material"));
  populateFitClasses();
  buildCompareInputs();
  renderFitItTable();
  renderRefTable();
  updateAllOutputs();
}

applyTheme(currentTheme());
updateUnitsSeg();
// 若儲存咗英制,啟動時將 HTML 預設值(公制)換算一次
if (UNITS === "imperial") {
  $$("input[data-ukind]").forEach((el) => {
    const v = parseFloat(el.value);
    if (!isFinite(v)) return;
    el.value = parseFloat((v * UNIT_DEFS[el.dataset.ukind].f).toPrecision(4));
  });
}
renderFracTable();
renderFitTable();
renderRefTable();
renderInsertExamples();
populateTapSelect();
refreshAll();
// 初始化時對齊聯動欄位(n、vf 與 vc、fz 保持一致)
syncMilling("vc");
syncTurning("vc");
syncDrilling("vc");
