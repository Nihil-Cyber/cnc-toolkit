/* =========================================================
 * CNC 工程師工具包 — 銷售 trigger:情境產品卡 + 詢價單
 * 純前端:詢價項目存 localStorage,送出經 WhatsApp / Email(只開啟撰寫視窗,由用戶按送出)
 * 依賴 data.js(SHOP_CONFIG、CATALOG)與 app.js 執行時嘅全域函式(t、tMat、fmt、toDisp、uLabel)
 * ========================================================= */

const INQUIRY_KEY = "cnc-inquiry";
let INQUIRY = (() => {
  try { return JSON.parse(localStorage.getItem(INQUIRY_KEY)) || []; } catch (e) { return []; }
})();

function saveInquiry() {
  try { localStorage.setItem(INQUIRY_KEY, JSON.stringify(INQUIRY)); } catch (e) {}
}

/* ---------- 產品配對 ---------- */
function matchProducts(type, isoGroup, dia) {
  return CATALOG.filter((p) =>
    p.type === type &&
    (!p.iso || p.iso.includes(isoGroup)) &&
    (dia == null || !p.dia || (dia >= p.dia[0] && dia <= p.dia[1]))
  ).slice(0, 3);
}

/* ---------- 產品卡渲染 ---------- */
function productCardHtml(p, badge) {
  const sub = [p.coating, p.note].filter(Boolean).join(" · ");
  return `
    <div class="product-card">
      <div class="pc-info">
        <div class="pc-name">${p.name}${badge ? ` <span class="pc-badge">${badge}</span>` : ""}</div>
        <div class="pc-sub">${sub}${p.sku ? ` · ${p.sku}` : ""}</div>
      </div>
      ${p.url ? `<a class="pc-link" href="${p.url}" target="_blank" rel="noopener" title="↗">↗</a>` : ""}
      <button class="pc-add" type="button">${t("shop.add")}</button>
    </div>`;
}

/** 將產品卡渲染入 container,並以閉包綁定「加入詢價單」 */
function renderProducts(container, list, ctx, badgeFor) {
  if (!list.length) { container.innerHTML = ""; return; }
  container.innerHTML =
    `<div class="shop-title">${t("shop.forThis")}</div>` +
    list.map((p) => productCardHtml(p, badgeFor && badgeFor(p))).join("");
  container.querySelectorAll(".pc-add").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      addToInquiry({ id: list[i].sku, name: list[i].name, ctx });
      flashAdded(btn);
    });
  });
}

function flashAdded(btn) {
  const old = btn.textContent;
  btn.textContent = t("shop.added");
  btn.classList.add("added");
  setTimeout(() => { btn.textContent = old; btn.classList.remove("added"); }, 1200);
}

/* ---------- 各分頁 trigger ---------- */
function renderAdvisorShop(m, op, d) {
  const box = document.getElementById("adv-shop");
  if (!box) return;
  const typeMap = { milling: "mill", turning: "insert", drilling: "drill" };
  const list = matchProducts(typeMap[op], m.iso, op === "turning" ? null : d);
  const ctx = `${tMat(m.id)} · ${t("op." + op)} · Ø${fmt(toDisp(d, "len"))}${uLabel("len")}`;
  renderProducts(box, list, ctx);
}

function renderInsertShop(decoded) {
  const box = document.getElementById("insert-shop");
  if (!box) return;
  if (!decoded || decoded.error) { box.innerHTML = ""; return; }
  const code = (document.getElementById("insert-code").value || "").toUpperCase().replace(/[\s\-_.,]/g, "");

  // 補貨按鈕:用戶手揸嘅呢粒刀片就係要落單嗰粒
  let html = `<div class="shop-title">${t("shop.restockTitle")}</div>
    <button class="pc-restock" type="button">🧾 ${code} — ${t("shop.restock")}</button>`;

  // 同形狀刀片配對
  const matches = CATALOG.filter((p) =>
    p.type === "insert" && (!decoded.shapeKnown || p.shape === decoded.shape)
  ).slice(0, 3);
  if (matches.length) {
    html += `<div class="shop-title" style="margin-top:12px">${t("shop.alt")}</div>` +
      matches.map((p) => productCardHtml(p, decoded.shapeKnown && p.shape === decoded.shape ? t("shop.sameShape") : "")).join("");
  }
  box.innerHTML = html;

  box.querySelector(".pc-restock").addEventListener("click", (e) => {
    addToInquiry({ id: code, name: code, ctx: t("shop.restockCtx") });
    flashAdded(e.currentTarget);
  });
  box.querySelectorAll(".pc-add").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      addToInquiry({ id: matches[i].sku, name: matches[i].name, ctx: `${t("nav.insert")}: ${code}` });
      flashAdded(btn);
    });
  });
}

/* ---------- 詢價單 ---------- */
function addToInquiry(item) {
  if (!INQUIRY.some((x) => x.id === item.id && x.ctx === item.ctx)) {
    INQUIRY.push(item);
    saveInquiry();
    updateCartBadge();
  }
}

function removeFromInquiry(idx) {
  INQUIRY.splice(idx, 1);
  saveInquiry();
  updateCartBadge();
  renderInquiryList();
}

function clearInquiry() {
  INQUIRY = [];
  saveInquiry();
  updateCartBadge();
  renderInquiryList();
}

function updateCartBadge() {
  const fab = document.getElementById("inquiry-fab");
  const count = document.getElementById("inquiry-count");
  if (!fab || !count) return;
  count.textContent = INQUIRY.length;
  fab.classList.toggle("hidden", INQUIRY.length === 0);
}

function renderInquiryList() {
  const wrap = document.getElementById("inquiry-list");
  if (!wrap) return;
  if (!INQUIRY.length) {
    wrap.innerHTML = `<p class="inquiry-empty">${t("cart.empty")}</p>`;
    return;
  }
  wrap.innerHTML = INQUIRY.map((x, i) => `
    <div class="inquiry-row">
      <div>
        <div class="ir-name">${i + 1}. ${x.name}</div>
        ${x.ctx ? `<div class="ir-ctx">${x.ctx}</div>` : ""}
      </div>
      <button class="ir-remove" type="button" data-idx="${i}" title="${t("cart.remove")}">✕</button>
    </div>`).join("");
  wrap.querySelectorAll(".ir-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromInquiry(parseInt(btn.dataset.idx, 10)));
  });
}

function buildInquiryText() {
  const header = t("cart.msgHeader", { biz: SHOP_CONFIG.business });
  const lines = INQUIRY.map((x, i) =>
    `${i + 1}. ${x.name}${x.id && x.id !== x.name ? ` [${x.id}]` : ""}${x.ctx ? ` — ${x.ctx}` : ""}`
  );
  const contact = (document.getElementById("inquiry-contact").value || "").trim();
  let body = `${header}\n\n${lines.join("\n")}`;
  if (contact) body += `\n\n${t("cart.contactLabel")}: ${contact}`;
  return { header, body };
}

function submitInquiry(channel) {
  if (!INQUIRY.length) return;
  const { header, body } = buildInquiryText();
  if (channel === "whatsapp" && SHOP_CONFIG.whatsapp) {
    window.open(`https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
  } else {
    window.location.href =
      `mailto:${SHOP_CONFIG.email}?subject=${encodeURIComponent(header)}&body=${encodeURIComponent(body)}`;
  }
}

function openCart() {
  renderInquiryList();
  // 無設定 WhatsApp 就收埋嗰個掣
  const wa = document.getElementById("inquiry-wa");
  if (wa) wa.classList.toggle("hidden", !SHOP_CONFIG.whatsapp);
  document.getElementById("inquiry-modal").classList.remove("hidden");
}

function closeCart() {
  document.getElementById("inquiry-modal").classList.add("hidden");
}

/* ---------- 綁定(元素喺 index.html 已存在;本檔喺 app.js 之前載入) ---------- */
(function initShop() {
  const fab = document.getElementById("inquiry-fab");
  const modal = document.getElementById("inquiry-modal");
  if (fab) fab.addEventListener("click", openCart);
  if (modal) {
    document.getElementById("inquiry-close").addEventListener("click", closeCart);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeCart(); });
    document.getElementById("inquiry-wa").addEventListener("click", () => submitInquiry("whatsapp"));
    document.getElementById("inquiry-email").addEventListener("click", () => submitInquiry("email"));
    document.getElementById("inquiry-clear").addEventListener("click", clearInquiry);
  }
  updateCartBadge();
})();
