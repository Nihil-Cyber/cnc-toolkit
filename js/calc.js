/* =========================================================
 * CNC 工程師工具包 — 計算核心
 * 全部為純函式,單位以公制為主
 * ========================================================= */

const PI = Math.PI;

/** 主軸轉速 n (rpm) ← 切削速度 vc (m/min)、直徑 D (mm) */
function rpmFromVc(vc, d) {
  return (vc * 1000) / (PI * d);
}

/** 切削速度 vc (m/min) ← 轉速 n (rpm)、直徑 D (mm) */
function vcFromRpm(n, d) {
  return (PI * d * n) / 1000;
}

/** 銑削進給速度 vf (mm/min) = n × z × fz */
function feedMilling(n, z, fz) {
  return n * z * fz;
}

/** 銑削材料移除率 Q (cm³/min) = ap × ae × vf / 1000 */
function mrrMilling(ap, ae, vf) {
  return (ap * ae * vf) / 1000;
}

/**
 * 平均切屑厚度 hm (mm) — 側銑
 * ae/D ≤ 0.5 時: hm ≈ fz × sqrt(ae/D)(近似)
 * 否則 hm ≈ fz(全槽時平均值接近 fz × 2/π,取保守 fz)
 */
function avgChipThickness(fz, ae, d) {
  const ratio = ae / d;
  if (ratio >= 1) return fz;
  if (ratio > 0.5) return fz;
  return fz * Math.sqrt(ratio);
}

/**
 * 徑向切屑變薄補償係數 RCTF
 * fz_程式 = fz_目標 × RCTF
 */
function chipThinningFactor(ae, d) {
  const ratio = ae / d;
  if (ratio >= 0.5) return 1;
  const inner = 1 - Math.pow(1 - 2 * ratio, 2);
  if (inner <= 0) return 1;
  return 1 / Math.sqrt(inner);
}

/**
 * 圓弧/螺旋插補進給補償
 * 刀具中心行嘅圓 ≠ 刀刃接觸嘅圓,程式進給(中心)要換算至目標刃口進給
 * mode 'internal'(鏜孔/內輪廓) | 'external'(外輪廓/凸台)
 * dTool 刀具直徑, dCircle 目標圓直徑(內圓孔徑 / 外圓凸台徑)
 * vfEdge 目標刃口進給(= n·z·fz), pitch 螺旋導程(0 = 純圓弧)
 * 回傳 { dCenter, k, vfCenter, ramp } 或 { error }
 * k = 中心圓/目標圓:內圓 <1(要降進給),外圓 >1(要加進給)
 */
function interpFeedComp(mode, dTool, dCircle, vfEdge, pitch) {
  if (dTool <= 0 || dCircle <= 0) return null;
  const dCenter = mode === "internal" ? dCircle - dTool : dCircle + dTool;
  if (dCenter <= 0) return { error: "fit" };
  const k = dCenter / dCircle;
  const vfCenter = vfEdge * k;
  const ramp = pitch > 0 ? (Math.atan(pitch / (Math.PI * dCenter)) * 180) / Math.PI : null;
  return { dCenter, k, vfCenter, ramp };
}

/**
 * 修正單位切削力 kc (N/mm²) = kc1 × hm^(-mc)
 * hm 為平均切屑厚度 (mm)
 */
function specificCuttingForce(kc1, mc, hm) {
  const h = Math.max(hm, 0.001);
  return kc1 * Math.pow(h, -mc);
}

/** 切削功率 Pc (kW) ← MRR Q (cm³/min)、kc (N/mm²) */
function powerFromMrr(q, kc) {
  return (q * kc) / 60000;
}

/** 主軸扭矩 M (N·m) = 9550 × Pc / n */
function torque(pcKw, n) {
  if (n <= 0) return 0;
  return (9550 * pcKw) / n;
}

/** 車削材料移除率 Q (cm³/min) = vc × ap × f */
function mrrTurning(vc, ap, f) {
  return vc * ap * f;
}

/**
 * 理論表面粗糙度(車削/圓鼻刀):
 * Ra (µm) ≈ f² / (32 × rε) × 1000 ; Rz ≈ f² / (8 × rε) × 1000
 * f: mm/rev, rε: 刀鼻半徑 mm
 */
function surfaceRoughness(f, rNose) {
  if (rNose <= 0) return { ra: null, rz: null };
  const rzMm = (f * f) / (8 * rNose);
  return { ra: rzMm / 4 * 1000, rz: rzMm * 1000 };
}

/** 由目標 Ra (µm) 反推最大進給 f (mm/rev) */
function feedFromRa(raTarget, rNose) {
  return Math.sqrt((raTarget / 1000) * 32 * rNose);
}

/**
 * 球刀行距殘料高度 (scallop)
 * h (mm) ← 球刀半徑 r (mm)、行距 s (mm)
 */
function scallopHeight(r, stepover) {
  const half = stepover / 2;
  if (half >= r) return r;
  return r - Math.sqrt(r * r - half * half);
}

/** 由目標殘料高度反推行距 */
function stepoverFromScallop(r, h) {
  if (h >= r) return 2 * r;
  return 2 * Math.sqrt(r * r - Math.pow(r - h, 2));
}

/** 鑽孔材料移除率 Q (cm³/min) = (π D²/4) × vf / 1000 */
/** 胚料體積(cm³);尺寸以 mm 計 */
function stockVolume(shape, d) {
  let mm3 = 0;
  if (shape === "block") mm3 = d.l * d.w * d.h;
  else if (shape === "round") mm3 = Math.PI * (d.dia / 2) ** 2 * d.len;
  else if (shape === "tube") mm3 = Math.PI * ((d.od / 2) ** 2 - (d.id / 2) ** 2) * d.len;
  return mm3 > 0 ? mm3 / 1000 : 0;
}

/** 鑽尖(尖端錐體)長度:d 直徑,angle 鑽尖全角(度) */
function drillPointLength(d, angle) {
  if (d <= 0 || angle <= 0 || angle >= 180) return 0;
  return (d / 2) / Math.tan((angle / 2) * Math.PI / 180);
}

/**
 * 啄鑽 (G83 全退) 循環概估
 * depth 進給孔深, q 每次啄鑽量, vf 進給(mm/min), vRapid 快移(mm/min)
 * 模型:每啄一次退至孔口,再快移回上一深度上方 δ,再進給;δ=min(1, q/2)
 * 回傳 { pecks, qActual, feedSec, rapidSec, totalSec, usePeck }
 */
function peckCycle(depth, q, vf, vRapid) {
  if (depth <= 0 || vf <= 0) return null;
  const usePeck = q > 0 && q < depth;
  const pecks = usePeck ? Math.ceil(depth / q) : 1;
  const qActual = depth / pecks;
  const delta = usePeck ? Math.min(1, qActual / 2) : 0;

  let feedDist = 0, rapidDist = 0, prev = 0;
  for (let i = 1; i <= pecks; i++) {
    const di = Math.min(i * qActual, depth);
    if (i > 1) {
      const reapproach = Math.max(0, prev - delta);
      rapidDist += reapproach;          // 快移回上一深度上方 δ
      feedDist += di - reapproach;      // 由該處進給到本次深度
    } else {
      feedDist += di;                   // 首啄由孔口進給
    }
    rapidDist += di;                    // 退至孔口
    prev = di;
  }
  const feedSec = (feedDist / vf) * 60;
  const rapidSec = usePeck && vRapid > 0 ? (rapidDist / vRapid) * 60 : 0;
  return { pecks, qActual, feedSec, rapidSec, totalSec: feedSec + rapidSec, usePeck };
}

function mrrDrilling(d, vf) {
  return (PI * d * d / 4) * vf / 1000;
}

/** 鑽孔切削功率 (kW) ≈ f × vc × D × kc / 240000 */
function powerDrilling(f, vc, d, kc) {
  return (f * vc * d * kc) / 240000;
}

/** 切削攻牙底孔直徑 = 稱呼徑 − 螺距 */
function tapDrillCutting(d, p) {
  return d - p;
}

/** 擠壓攻牙(無屑)底孔直徑 ≈ 稱呼徑 − 螺距/2(65% 牙高近似) */
function tapDrillForming(d, p) {
  return d - p / 2;
}

/**
 * Taylor 刀具壽命比:vc × T^n = C
 * 回傳 T2/T1 = (v1/v2)^(1/n)
 * n:硬質合金 ≈ 0.25,HSS ≈ 0.125,陶瓷 ≈ 0.4
 */
function taylorLifeRatio(v1, v2, nExp = 0.25) {
  if (v2 <= 0 || v1 <= 0) return null;
  return Math.pow(v1 / v2, 1 / nExp);
}

/** 線性插值查表:table 為 [x, ...ys] 遞減排列,依第 col 欄插值求第 targetCol 欄 */
function interpTable(table, value, col, targetCol) {
  const rows = table.filter((r) => r[col] != null && r[targetCol] != null);
  if (rows.length === 0) return null;
  // 依 col 欄由大到細排序
  rows.sort((a, b) => b[col] - a[col]);
  const max = rows[0][col];
  const min = rows[rows.length - 1][col];
  if (value > max || value < min) return null;
  for (let i = 0; i < rows.length - 1; i++) {
    const hi = rows[i], lo = rows[i + 1];
    if (value <= hi[col] && value >= lo[col]) {
      const t = (value - lo[col]) / (hi[col] - lo[col] || 1);
      return lo[targetCol] + t * (hi[targetCol] - lo[targetCol]);
    }
  }
  return null;
}

/**
 * 硬度換算:type ∈ {hrc, hv, hb, hrb},回傳 {hrc, hv, hb, hrb, uts}
 * 主表 HARDNESS_TABLE 欄位 [HRC, HV, HB, UTS];HRB_TABLE 欄位 [HRB, HB, HV, UTS]
 */
function convertHardness(type, value) {
  const out = { hrc: null, hv: null, hb: null, hrb: null, uts: null };
  const colMap = { hrc: 0, hv: 1, hb: 2, uts: 3 };

  if (type === "hrb") {
    out.hrb = value;
    out.hb = interpTable(HRB_TABLE, value, 0, 1);
    out.hv = interpTable(HRB_TABLE, value, 0, 2);
    out.uts = interpTable(HRB_TABLE, value, 0, 3);
    if (out.hv != null) out.hrc = interpTable(HARDNESS_TABLE, out.hv, 1, 0);
    return out;
  }

  const col = colMap[type];
  out[type] = value;
  for (const key of ["hrc", "hv", "hb", "uts"]) {
    if (key === type) continue;
    out[key] = interpTable(HARDNESS_TABLE, value, col, colMap[key]);
  }

  // 軟料區(超出主表下限)後備:用 HRB 表內插
  // HRB_TABLE 欄位 [HRB, HB, HV, UTS]
  if (type === "hb" || type === "hv") {
    const softCol = type === "hb" ? 1 : 2;
    if (out.hv == null && type === "hb") out.hv = interpTable(HRB_TABLE, value, softCol, 2);
    if (out.hb == null && type === "hv") out.hb = interpTable(HRB_TABLE, value, softCol, 1);
    if (out.uts == null) out.uts = interpTable(HRB_TABLE, value, softCol, 3);
  }

  const hbVal = type === "hb" ? value : out.hb;
  if (hbVal != null) out.hrb = interpTable(HRB_TABLE, hbVal, 1, 0);
  return out;
}

/** 依刀徑查每齒進給基準 */
function baseFz(d) {
  for (const row of FZ_BASE) {
    if (d <= row.dMax) return row.fz;
  }
  return FZ_BASE[FZ_BASE.length - 1].fz;
}

/** 依鑽徑查每轉進給基準 */
function baseDrillF(d) {
  for (const row of DRILL_F_BASE) {
    if (d <= row.dMax) return row.f;
  }
  return DRILL_F_BASE[DRILL_F_BASE.length - 1].f;
}

/**
 * 解析英寸字串:支援分數同小數
 * "1 3/8"、"1-3/8"、"5/16"、"0.375"、"25/64"、"1.5in"、'3/8"' 都得
 * 回傳小數英寸,解析失敗回傳 null
 */
function parseInches(str) {
  if (typeof str !== "string") return null;
  let s = str.trim()
    .replace(/["″”]|in(ch(es)?)?\.?$/gi, "")  // 去掉 ″ / " / in 後綴
    .trim();
  if (!s) return null;
  s = s.replace(/(\d)\s*[-–]\s*(?=\d)/, "$1 "); // 1-3/8 → 1 3/8
  // 整數/小數部分後必須係空格或結尾,避免 "25/64" 被拆成 2 + 5/64
  const m = s.match(/^(?:(\d+(?:\.\d+)?)(?:\s+|$))?(?:(\d+)\s*\/\s*(\d+))?$/);
  if (!m || (m[1] == null && m[2] == null)) return null;
  let v = m[1] != null ? parseFloat(m[1]) : 0;
  if (m[2] != null) {
    const den = parseInt(m[3], 10);
    if (!den) return null;
    v += parseInt(m[2], 10) / den;
  }
  return isFinite(v) ? v : null;
}

/**
 * 最近分數近似:將小數英寸化為 maxDen 分母以內嘅最簡分數
 * 回傳 { whole, num, den, value(近似值), error(近似−實際,英寸) }
 */
function nearestFraction(inches, maxDen = 64) {
  if (inches == null || !isFinite(inches) || inches < 0) return null;
  let whole = Math.floor(inches);
  let num = Math.round((inches - whole) * maxDen);
  let den = maxDen;
  if (num === maxDen) { whole += 1; num = 0; }
  if (num > 0) {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(num, den);
    num /= g;
    den /= g;
  }
  const value = whole + (num > 0 ? num / den : 0);
  return { whole, num, den, value, error: value - inches };
}

/** 分數顯示字串:1 3/8″、3/8″、2″ */
function formatFraction(fr) {
  if (!fr) return "—";
  if (fr.num === 0) return `${fr.whole}″`;
  if (fr.whole === 0) return `${fr.num}/${fr.den}″`;
  return `${fr.whole} ${fr.num}/${fr.den}″`;
}

/**
 * 直角三角形求解(直角喺 C;a 對角 A,b 對角 B,c 為斜邊)
 * known:{a?, b?, c?, A?, B?} 提供啱好兩個,角度用度
 * 成功回傳 {a,b,c,A,B,area,perim};失敗回傳 {error}
 */
function solveRightTriangle(known) {
  let { a, b, c, A, B } = known;
  const deg = Math.PI / 180;
  if (A != null && B != null) return { error: "angles" };
  if (A == null && B != null) A = 90 - B;
  if (A != null && (A <= 0 || A >= 90)) return { error: "invalid" };

  const sides = [["a", a], ["b", b], ["c", c]].filter(([, v]) => v != null);
  if (sides.some(([, v]) => !(v > 0) || !isFinite(v))) return { error: "invalid" };

  if (A != null) {
    if (sides.length !== 1) return { error: "invalid" };
    const rad = A * deg;
    if (a != null) { b = a / Math.tan(rad); c = a / Math.sin(rad); }
    else if (b != null) { a = b * Math.tan(rad); c = b / Math.cos(rad); }
    else { a = c * Math.sin(rad); b = c * Math.cos(rad); }
  } else {
    if (sides.length !== 2) return { error: "invalid" };
    if (a != null && b != null) c = Math.hypot(a, b);
    else if (a != null && c != null) {
      if (c <= a) return { error: "hyp" };
      b = Math.sqrt(c * c - a * a);
    } else {
      if (c <= b) return { error: "hyp" };
      a = Math.sqrt(c * c - b * b);
    }
    A = Math.atan2(a, b) / deg;
  }
  B = 90 - A;
  return { a, b, c, A, B, area: (a * b) / 2, perim: a + b + c };
}

/** ISO 286:稱呼尺寸所屬分段索引,超範圍回傳 -1 */
function fitRangeIndex(d) {
  if (!(d > 0) || d > FIT_RANGES[FIT_RANGES.length - 1]) return -1;
  for (let i = 0; i < FIT_RANGES.length; i++) {
    if (d <= FIT_RANGES[i]) return i;
  }
  return -1;
}

/**
 * ISO 286 極限偏差 (µm)
 * cls 如 "H7"、"g6"、"JS7"、"k6";大寫=孔,小寫=軸
 * 回傳 { upper, lower, it } 或 null
 */
function fitDeviation(cls, d) {
  const idx = fitRangeIndex(d);
  if (idx < 0) return null;
  const m = String(cls).match(/^([A-Za-z]{1,2})(\d+)$/);
  if (!m) return null;
  const letter = m[1];
  const grade = parseInt(m[2], 10);
  const it = IT_GRADES[grade]?.[idx];
  if (it == null) return null;
  const isHole = letter === letter.toUpperCase();
  const L = letter.toLowerCase();

  let upper, lower;
  if (L === "h") {
    if (isHole) { lower = 0; upper = it; }
    else { upper = 0; lower = -it; }
  } else if (L === "js") {
    upper = it / 2; lower = -it / 2;
  } else if (["g", "f", "e", "d"].includes(L)) {
    const dev = FUND_DEV[L][idx];
    if (isHole) { lower = dev; upper = dev + it; }
    else { upper = -dev; lower = -dev - it; }
  } else if (["k", "m", "n", "p"].includes(L)) {
    if (isHole) return null; // K/N/P 孔涉及 Δ 修正,呢度只提供軸
    lower = FUND_DEV[L][idx];
    upper = lower + it;
  } else {
    return null;
  }
  return { upper, lower, it };
}

/** 數字格式化:自動選有效位數,失敗回傳 "—" */
function fmt(v, digits = null) {
  if (v == null || !isFinite(v)) return "—";
  if (digits != null) return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: digits });
  const abs = Math.abs(v);
  let d;
  if (abs >= 1000) d = 0;
  else if (abs >= 100) d = 1;
  else if (abs >= 10) d = 2;
  else if (abs >= 0.1) d = 3;
  else d = 4;
  return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: d });
}

/**
 * ISO 1832 可轉位刀片代碼解讀(純函式,只回傳代碼與事實;文字由 app 層經 i18n 組合)
 * 例:CNMG120408 → C=菱形80°, N=後角0°, M=公差, G=型式, 12=切刃長, 04=厚度, 08=刀尖R0.8
 */
function decodeInsert(raw) {
  if (!raw || !raw.trim()) return { error: "empty" };
  const s = raw.toUpperCase().replace(/[\s\-_.,]/g, "");
  const m = s.match(/^([A-Z])([A-Z])([A-Z])([A-Z])([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9]*)$/);
  if (!m) return { error: "format" };
  const [, shape, clear, tol, type, sizeC, thickC, noseC, rest] = m;

  const shapeData = INSERT_SHAPES[shape] || null;
  const clearKnown = Object.prototype.hasOwnProperty.call(INSERT_CLEARANCE, clear);

  // 切刃長度:代碼為向下取整 mm
  const sizeNum = /^\d+$/.test(sizeC) ? parseInt(sizeC, 10) : null;

  // 厚度代碼 → mm
  const thickMm = INSERT_THICKNESS[thickC] ?? null;

  // 刀尖半徑:兩位數字 / 10 mm;00 = 尖角
  let noseMm = null, noseSharp = false;
  if (/^\d\d$/.test(noseC)) {
    const n = parseInt(noseC, 10);
    if (n === 0) { noseSharp = true; noseMm = 0; }
    else noseMm = n / 10;
  }

  // 尾碼:位置 8 刃口處理 + 位置 9 切削方向
  const EDGE = ["F", "E", "T", "S"];
  const HAND = ["R", "L", "N"];
  let edge = null, hand = null;
  const leftover = [];
  for (const ch of rest.split("")) {
    if (edge == null && EDGE.includes(ch)) edge = ch;
    else if (hand == null && HAND.includes(ch)) hand = ch;
    else leftover.push(ch);
  }

  return {
    ok: true,
    shape, clear, tol, type, sizeC, thickC, noseC,
    shapeAngle: shapeData ? shapeData.angle : null,
    shapeGeom: shapeData ? shapeData.geom : null,
    shapeKnown: !!shapeData,
    clearAngle: clearKnown ? INSERT_CLEARANCE[clear] : null,
    clearKnown,
    tolKnown: INSERT_TOLERANCE.includes(tol),
    typeKnown: INSERT_TYPES.includes(type),
    sizeNum, thickMm, noseMm, noseSharp,
    edge, hand, extra: leftover.join(""),
  };
}
