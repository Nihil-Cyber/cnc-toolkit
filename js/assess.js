/* =========================================================
 * CNC 工程師工具包 — 加工參數合理性評估
 * level: 'ok' | 'warn' | 'danger' | null
 * ========================================================= */

/** 數值是否在 [lo, hi]；超出 margin×span 為 danger，否則 warn */
function assessInRange(value, lo, hi, margin = 0.25) {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;
  if (value >= lo && value <= hi) return "ok";
  const span = hi - lo;
  const wLo = lo - span * margin;
  const wHi = hi + span * margin;
  if (value >= wLo && value <= wHi) return "warn";
  return "danger";
}

function worstLevel(levels) {
  const rank = { danger: 3, warn: 2, ok: 1 };
  let worst = null;
  for (const l of levels) {
    if (!l) continue;
    if (!worst || rank[l] > rank[worst]) worst = l;
  }
  return worst;
}

/** 切屑厚度 hm (mm) */
function assessChipThickness(hm) {
  if (!Number.isFinite(hm) || hm <= 0) return null;
  if (hm >= 0.04 && hm <= 0.3) return "ok";
  if (hm >= 0.02 && hm <= 0.45) return "warn";
  return "danger";
}

/** 銑削參數評估 → [{ id, level, key, params? }] */
function assessMilling(m, d, vc, fz, ap, ae, hm) {
  const items = [];
  const vcLevel = assessInRange(vc, m.vcCarbide[0], m.vcCarbide[1]);
  if (vcLevel) {
    items.push({
      id: "mill-vc",
      level: vcLevel,
      key: vc < m.vcCarbide[0] ? "status.vcLow" : "status.vcHigh",
      params: { lo: m.vcCarbide[0], hi: m.vcCarbide[1] },
    });
  }

  if (d > 0) {
    const fzRec = baseFz(d) * m.fzFactor;
    const fzLo = fzRec * 0.65;
    const fzHi = fzRec * 1.35;
    const fzLevel = assessInRange(fz, fzLo, fzHi, 0.35);
    if (fzLevel) {
      items.push({
        id: "mill-fz",
        level: fzLevel,
        key: fz < fzLo ? "status.fzLow" : "status.fzHigh",
        params: { ref: fzRec },
      });
    }

    if (ap > 0) {
      const r = ap / d;
      let apLevel = "ok";
      if (r > 1.5) apLevel = "danger";
      else if (r > 1) apLevel = "warn";
      items.push({ id: "mill-ap", level: apLevel, key: "status.apHigh", params: { ratio: r } });
    }

    if (ae > 0) {
      const r = ae / d;
      let aeLevel = "ok";
      let aeKey = "status.aeOk";
      if (r < 0.08) {
        aeLevel = "danger";
        aeKey = "status.aeLow";
      } else if (r < 0.15) {
        aeLevel = "warn";
        aeKey = "status.aeLow";
      } else if (r > 1) {
        aeLevel = "danger";
        aeKey = "status.aeFullSlot";
      } else if (r > 0.65) {
        aeLevel = "warn";
        aeKey = "status.aeHigh";
      }
      items.push({ id: "mill-ae", level: aeLevel, key: aeKey, params: { pct: Math.round(r * 100) } });
    }
  }

  const hmLevel = assessChipThickness(hm);
  if (hmLevel) {
    items.push({
      id: "mill-hm",
      level: hmLevel,
      key: hm < 0.04 ? "status.hmThin" : "status.hmThick",
      params: { hm },
    });
  }

  return items;
}

/** 車削參數評估 */
function assessTurning(m, vc, f, ap, rn) {
  const items = [];
  const vcLevel = assessInRange(vc, m.vcCarbide[0], m.vcCarbide[1]);
  if (vcLevel) {
    items.push({
      id: "turn-vc",
      level: vcLevel,
      key: vc < m.vcCarbide[0] ? "status.vcLow" : "status.vcHigh",
      params: { lo: m.vcCarbide[0], hi: m.vcCarbide[1] },
    });
  }

  if (f > 0) {
    if (f < 0.05) {
      items.push({ id: "turn-f", level: "danger", key: "status.fLow" });
    } else if (rn > 0 && f > rn * 0.6) {
      items.push({ id: "turn-f", level: "danger", key: "status.fHigh", params: { rn } });
    } else if (rn > 0 && f > rn * 0.45) {
      items.push({ id: "turn-f", level: "warn", key: "status.fHigh", params: { rn } });
    } else {
      items.push({ id: "turn-f", level: "ok", key: "status.fOk" });
    }
  }

  if (ap > 0 && rn > 0 && ap > rn * 8) {
    items.push({ id: "turn-ap", level: "warn", key: "status.apDeep" });
  }

  return items;
}

/** 鑽孔參數評估 */
function assessDrilling(m, d, vc, f, depth) {
  const items = [];
  const vcLo = m.vcCarbide[0] * 0.6;
  const vcHi = m.vcCarbide[1] * 0.5;
  const vcLevel = assessInRange(vc, vcLo, vcHi);
  if (vcLevel) {
    items.push({
      id: "drill-vc",
      level: vcLevel,
      key: vc < vcLo ? "status.vcLow" : "status.vcHigh",
      params: { lo: vcLo, hi: vcHi },
    });
  }

  if (d > 0 && f > 0) {
    const fRec = baseDrillF(d) * m.fzFactor;
    const fLevel = assessInRange(f, fRec * 0.6, fRec * 1.4, 0.35);
    if (fLevel) {
      items.push({
        id: "drill-f",
        level: fLevel,
        key: f < fRec * 0.6 ? "status.fDrillLow" : "status.fDrillHigh",
        params: { ref: fRec },
      });
    }
  }

  if (d > 0 && depth > 0) {
    const ratio = depth / d;
    if (ratio > 5) {
      items.push({ id: "drill-depth", level: "danger", key: "status.depthDeep", params: { r: ratio } });
    } else if (ratio > 3) {
      items.push({ id: "drill-depth", level: "warn", key: "status.depthWarn", params: { r: ratio } });
    }
  }

  return items;
}
