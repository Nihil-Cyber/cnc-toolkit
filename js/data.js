/* =========================================================
 * CNC 工程師工具包 — 資料庫
 * 材料切削資料、硬度換算表、螺紋規格、刀具建議知識庫
 * ========================================================= */

/**
 * 材料資料庫（依 ISO 513 分類）
 * 顯示名稱由 i18n 字典提供(I18N[lang].mat[id]),grade 為通用牌號
 * vcCarbide / vcHss:建議切削速度範圍 m/min(硬質合金 / 高速鋼)
 * kc1:單位切削力 kc1.1 (N/mm²),mc:切屑厚度指數
 * fzFactor:每齒進給係數(相對基準值,鋁=1.2,鋼=1.0,硬料=0.6)
 * hardness:常見硬度範圍(顯示用)
 */
const MATERIALS = [
  // ISO P — 鋼
  { id: "steel-low",    iso: "P", grade: "S45C / 1045",       vcCarbide: [150, 280], vcHss: [25, 40], kc1: 1700, mc: 0.25, fzFactor: 1.0, hardness: "HB 160–220", density: 7.85 },
  { id: "steel-alloy",  iso: "P", grade: "SCM440 / 4140",     vcCarbide: [120, 220], vcHss: [20, 35], kc1: 1900, mc: 0.25, fzFactor: 0.9, hardness: "HB 220–320", density: 7.85 },
  { id: "steel-tool",   iso: "P", grade: "SKD11 / D2", vcCarbide: [80, 160],  vcHss: [12, 20], kc1: 2100, mc: 0.24, fzFactor: 0.8, hardness: "HB 200–255", density: 7.7 },
  // ISO M — 不鏽鋼
  { id: "ss-304",       iso: "M", grade: "SUS304",    vcCarbide: [100, 180], vcHss: [12, 20], kc1: 2000, mc: 0.21, fzFactor: 0.85, hardness: "HB 150–200", density: 7.9 },
  { id: "ss-316",       iso: "M", grade: "SUS316L",   vcCarbide: [90, 160],  vcHss: [10, 18], kc1: 2100, mc: 0.21, fzFactor: 0.8, hardness: "HB 150–200", density: 8.0 },
  { id: "ss-17-4",      iso: "M", grade: "17-4PH",    vcCarbide: [70, 140],  vcHss: [8, 15],  kc1: 2400, mc: 0.22, fzFactor: 0.75, hardness: "HRC 28–38", density: 7.8 },
  // ISO K — 鑄鐵
  { id: "ci-gray",      iso: "K", grade: "FC250 / GG25",      vcCarbide: [150, 300], vcHss: [20, 35], kc1: 1100, mc: 0.28, fzFactor: 1.1, hardness: "HB 180–220", density: 7.2 },
  { id: "ci-ductile",   iso: "K", grade: "FCD450 / GGG50",  vcCarbide: [120, 220], vcHss: [15, 28], kc1: 1350, mc: 0.28, fzFactor: 1.0, hardness: "HB 170–240", density: 7.1 },
  // ISO N — 非鐵金屬
  { id: "al-6061",      iso: "N", grade: "6061-T6",           vcCarbide: [300, 800], vcHss: [80, 150], kc1: 700, mc: 0.25, fzFactor: 1.3, hardness: "HB 95", density: 2.7 },
  { id: "al-7075",      iso: "N", grade: "7075-T6",           vcCarbide: [250, 700], vcHss: [70, 130], kc1: 850, mc: 0.25, fzFactor: 1.2, hardness: "HB 150", density: 2.81 },
  { id: "copper-brass", iso: "N", grade: "C3604",               vcCarbide: [200, 500], vcHss: [60, 100], kc1: 780, mc: 0.27, fzFactor: 1.2, hardness: "HB 80–120", density: 8.5 },
  { id: "copper-pure",  iso: "N", grade: "C1100",      vcCarbide: [150, 400], vcHss: [40, 80],  kc1: 900, mc: 0.27, fzFactor: 1.0, hardness: "HB 40–90", density: 8.9 },
  // ISO S — 耐熱合金 / 鈦
  { id: "ti-6al4v",     iso: "S", grade: "Ti-6Al-4V",         vcCarbide: [40, 80],   vcHss: [8, 12],  kc1: 1700, mc: 0.23, fzFactor: 0.7, hardness: "HRC 30–36", density: 4.43 },
  { id: "inconel-718",  iso: "S", grade: "Inconel 718",   vcCarbide: [25, 60],   vcHss: [4, 8],   kc1: 2600, mc: 0.25, fzFactor: 0.6, hardness: "HRC 36–44", density: 8.19 },
  // ISO H — 淬硬鋼
  { id: "hard-50",      iso: "H", grade: "SKD61", vcCarbide: [60, 120], vcHss: null, kc1: 3100, mc: 0.22, fzFactor: 0.6, hardness: "HRC 48–55", density: 7.8 },
  { id: "hard-60",      iso: "H", grade: "SKD11", vcCarbide: [40, 90],  vcHss: null, kc1: 3600, mc: 0.21, fzFactor: 0.5, hardness: "HRC 56–62", density: 7.7 },
];

/* ISO 群組顏色(名稱由 i18n 提供) */
const ISO_GROUPS = {
  P: { color: "#4f8ef7" },
  M: { color: "#f7c948" },
  K: { color: "#e05260" },
  N: { color: "#3ecf8e" },
  S: { color: "#c084fc" },
  H: { color: "#94a3b8" },
};

/**
 * 硬度換算表(參考 ASTM E140 / ISO 18265,非奧氏體鋼)
 * 每列:[HRC, HV(維氏), HB(布氏 3000kgf), 抗拉強度近似 MPa]
 * HB / 抗拉超出可靠範圍時為 null
 */
const HARDNESS_TABLE = [
  [68, 940, null, null],
  [66, 865, null, null],
  [64, 800, null, null],
  [62, 746, null, null],
  [60, 697, 654, 2280],
  [58, 653, 615, 2170],
  [56, 613, 577, 2050],
  [54, 577, 543, 1950],
  [52, 544, 512, 1850],
  [50, 513, 481, 1760],
  [48, 484, 455, 1680],
  [46, 458, 432, 1595],
  [44, 434, 409, 1510],
  [42, 412, 390, 1430],
  [40, 392, 371, 1355],
  [38, 372, 353, 1290],
  [36, 354, 336, 1220],
  [34, 336, 319, 1160],
  [32, 318, 301, 1095],
  [30, 302, 286, 1040],
  [28, 286, 271, 985],
  [26, 272, 258, 935],
  [24, 260, 247, 890],
  [22, 248, 237, 850],
  [20, 238, 226, 810],
];

/**
 * HRB 對 HB 換算(軟鋼區,ASTM E140 近似)
 * [HRB, HB, HV, 抗拉 MPa]
 */
const HRB_TABLE = [
  [100, 240, 240, 800],
  [98, 228, 228, 760],
  [96, 216, 216, 720],
  [94, 205, 205, 690],
  [92, 195, 195, 655],
  [90, 185, 185, 620],
  [88, 176, 176, 595],
  [86, 169, 169, 570],
  [84, 162, 162, 545],
  [82, 156, 156, 525],
  [80, 150, 150, 505],
  [75, 137, 137, 460],
  [70, 125, 125, 420],
  [65, 114, 114, 385],
  [60, 105, 105, 350],
];

/**
 * 公制粗牙螺紋 (ISO 261) — [稱呼直徑, 螺距]
 */
const METRIC_THREADS = [
  { d: 1.6, p: 0.35 }, { d: 2, p: 0.4 }, { d: 2.5, p: 0.45 },
  { d: 3, p: 0.5 }, { d: 4, p: 0.7 }, { d: 5, p: 0.8 },
  { d: 6, p: 1.0 }, { d: 8, p: 1.25 }, { d: 10, p: 1.5 },
  { d: 12, p: 1.75 }, { d: 14, p: 2.0 }, { d: 16, p: 2.0 },
  { d: 18, p: 2.5 }, { d: 20, p: 2.5 }, { d: 22, p: 2.5 },
  { d: 24, p: 3.0 }, { d: 27, p: 3.0 }, { d: 30, p: 3.5 },
];

/* 英制統一螺紋 UNC(粗牙):diaIn=大徑(吋),tpi=每吋牙數 */
const UNC_THREADS = [
  { name: "#4-40", diaIn: 0.112, tpi: 40 },
  { name: "#6-32", diaIn: 0.138, tpi: 32 },
  { name: "#8-32", diaIn: 0.164, tpi: 32 },
  { name: "#10-24", diaIn: 0.190, tpi: 24 },
  { name: "1/4-20", diaIn: 0.250, tpi: 20 },
  { name: "5/16-18", diaIn: 0.3125, tpi: 18 },
  { name: "3/8-16", diaIn: 0.375, tpi: 16 },
  { name: "7/16-14", diaIn: 0.4375, tpi: 14 },
  { name: "1/2-13", diaIn: 0.500, tpi: 13 },
  { name: "5/8-11", diaIn: 0.625, tpi: 11 },
  { name: "3/4-10", diaIn: 0.750, tpi: 10 },
  { name: "1-8", diaIn: 1.000, tpi: 8 },
];

/* UNF(細牙) */
const UNF_THREADS = [
  { name: "#4-48", diaIn: 0.112, tpi: 48 },
  { name: "#6-40", diaIn: 0.138, tpi: 40 },
  { name: "#8-36", diaIn: 0.164, tpi: 36 },
  { name: "#10-32", diaIn: 0.190, tpi: 32 },
  { name: "1/4-28", diaIn: 0.250, tpi: 28 },
  { name: "5/16-24", diaIn: 0.3125, tpi: 24 },
  { name: "3/8-24", diaIn: 0.375, tpi: 24 },
  { name: "7/16-20", diaIn: 0.4375, tpi: 20 },
  { name: "1/2-20", diaIn: 0.500, tpi: 20 },
  { name: "5/8-18", diaIn: 0.625, tpi: 18 },
  { name: "3/4-16", diaIn: 0.750, tpi: 16 },
  { name: "1-12", diaIn: 1.000, tpi: 12 },
];

/* NPT 錐管牙:drillMm=標準攻牙底孔近似值(未計鉸孔) */
const NPT_THREADS = [
  { name: "1/16-27", tpi: 27, drillMm: 6.25 },
  { name: "1/8-27", tpi: 27, drillMm: 8.6 },
  { name: "1/4-18", tpi: 18, drillMm: 11.1 },
  { name: "3/8-18", tpi: 18, drillMm: 14.7 },
  { name: "1/2-14", tpi: 14, drillMm: 18.3 },
  { name: "3/4-14", tpi: 14, drillMm: 23.4 },
  { name: "1-11.5", tpi: 11.5, drillMm: 29.4 },
];


/** 每齒進給基準表 fz (mm/tooth) — 依刀徑,鋼材基準值,再乘材料 fzFactor */
const FZ_BASE = [
  { dMax: 2,  fz: 0.010 },
  { dMax: 3,  fz: 0.015 },
  { dMax: 4,  fz: 0.020 },
  { dMax: 6,  fz: 0.030 },
  { dMax: 8,  fz: 0.040 },
  { dMax: 10, fz: 0.050 },
  { dMax: 12, fz: 0.060 },
  { dMax: 16, fz: 0.080 },
  { dMax: 20, fz: 0.100 },
  { dMax: 25, fz: 0.120 },
  { dMax: 32, fz: 0.150 },
];

/* =========================================================
 * ISO 286 公差配合資料(1–500 mm)
 * ========================================================= */

/** 標準尺寸分段上限 (mm):>前一段 至 ≤本值 */
const FIT_RANGES = [3, 6, 10, 18, 30, 50, 80, 120, 180, 250, 315, 400, 500];

/** 標準公差 IT 值 (µm),每格對應 FIT_RANGES 一段 */
const IT_GRADES = {
  5:  [4, 5, 6, 8, 9, 11, 13, 15, 18, 20, 23, 25, 27],
  6:  [6, 8, 9, 11, 13, 16, 19, 22, 25, 29, 32, 36, 40],
  7:  [10, 12, 15, 18, 21, 25, 30, 35, 40, 46, 52, 57, 63],
  8:  [14, 18, 22, 27, 33, 39, 46, 54, 63, 72, 81, 89, 97],
  9:  [25, 30, 36, 43, 52, 62, 74, 87, 100, 115, 130, 140, 155],
  10: [40, 48, 58, 70, 84, 100, 120, 140, 160, 185, 210, 230, 250],
  11: [60, 75, 90, 110, 130, 160, 190, 220, 250, 290, 320, 360, 400],
};

/**
 * 基本偏差絕對值 (µm)
 * g/f/e/d:軸 es = −值(孔 G/F/E/D:EI = +值)
 * k/m/n/p:軸 ei = +值(k 值適用 IT4–IT7)
 */
const FUND_DEV = {
  g: [2, 4, 5, 6, 7, 9, 10, 12, 14, 15, 17, 18, 20],
  f: [6, 10, 13, 16, 20, 25, 30, 36, 43, 50, 56, 62, 68],
  e: [14, 20, 25, 32, 40, 50, 60, 72, 85, 100, 110, 125, 135],
  d: [20, 30, 40, 50, 65, 80, 100, 120, 145, 170, 190, 210, 230],
  k: [0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5],
  m: [2, 4, 6, 7, 8, 9, 11, 13, 15, 17, 20, 21, 23],
  n: [4, 8, 10, 12, 15, 17, 20, 23, 27, 31, 34, 37, 40],
  p: [6, 12, 15, 18, 22, 26, 32, 37, 43, 50, 56, 62, 68],
};

/** 可查詢嘅公差帶 */
const FIT_CLASSES = {
  holes: ["H6", "H7", "H8", "H9", "H11", "G7", "F8", "E9", "D10", "JS7"],
  shafts: ["h6", "h7", "h8", "h9", "h11", "g6", "f7", "e8", "d9", "js6", "k6", "m6", "n6", "p6"],
};

/** 鑽孔每轉進給基準 f (mm/rev) — 依鑽徑,鋼材基準 */
const DRILL_F_BASE = [
  { dMax: 3,  f: 0.05 },
  { dMax: 5,  f: 0.10 },
  { dMax: 8,  f: 0.15 },
  { dMax: 12, f: 0.20 },
  { dMax: 16, f: 0.25 },
  { dMax: 20, f: 0.30 },
  { dMax: 30, f: 0.35 },
];

/* =========================================================
 * ISO 1832 可轉位刀片代碼 — 語言中性技術資料
 * 描述文字放喺 i18n.js 嘅 insert 區塊,以下只存代碼 → 事實
 * ========================================================= */

/** 位置 1:形狀 —— angle=夾角(度),geom=幾何類別(對應 i18n insert.geom) */
const INSERT_SHAPES = {
  H: { angle: 120, geom: "hex" },
  O: { angle: 135, geom: "oct" },
  P: { angle: 108, geom: "pent" },
  S: { angle: 90,  geom: "square" },
  T: { angle: 60,  geom: "tri" },
  C: { angle: 80,  geom: "rhombic" },
  D: { angle: 55,  geom: "rhombic" },
  E: { angle: 75,  geom: "rhombic" },
  F: { angle: 50,  geom: "rhombic" },
  M: { angle: 86,  geom: "rhombic" },
  V: { angle: 35,  geom: "rhombic" },
  W: { angle: 80,  geom: "trigon" },
  R: { angle: null, geom: "round" },
  A: { angle: 85,  geom: "parallelogram" },
  B: { angle: 82,  geom: "parallelogram" },
  K: { angle: 55,  geom: "parallelogram" },
  L: { angle: 90,  geom: "rectangle" },
};

/** 位置 2:後角(間隙角,度);null=特殊 */
const INSERT_CLEARANCE = {
  A: 3, B: 5, C: 7, D: 15, E: 20, F: 25, G: 30, N: 0, P: 11, O: null,
};

/** 位置 3:公差等級(有效字母;描述見 i18n) */
const INSERT_TOLERANCE = ["A", "C", "E", "F", "G", "H", "J", "K", "L", "M", "N", "U"];

/** 位置 4:型式(孔・斷屑槽;描述見 i18n insert.type) */
const INSERT_TYPES = ["A", "B", "C", "F", "G", "H", "J", "M", "N", "Q", "R", "T", "U", "W", "X"];

/** 位置 6:厚度代碼 → mm(ISO 英制衍生標準系列) */
const INSERT_THICKNESS = {
  "01": 1.59, "02": 2.38, "03": 3.18, "04": 4.76, "05": 5.56,
  "06": 6.35, "07": 7.94, "08": 8.00, "09": 9.52,
  "T1": 1.98, "T2": 2.78, "T3": 3.97,
};

/** 常見範例代碼(範例 chip) */
const INSERT_EXAMPLES = [
  "CNMG120408", "DNMG150608", "TNMG160408", "WNMG080408",
  "VBMT160404", "DCMT11T304", "SCMT09T308", "RCMX2006MO",
];

/* =========================================================
 * 銷售:詢價單設定 + 產品目錄
 * ★★★ 以下係範本,請改成你自己嘅公司資料同真實刀具 ★★★
 *  - whatsapp:國碼+號碼,無「+」號(例 香港 "85298765432");留空則只用 Email
 *  - email:收詢價嘅信箱
 *  - CATALOG:你嘅刀具;iso=適用材料群組,dia=[最小,最大] 適用刀徑(mm),url=商品連結(可留空)
 * ========================================================= */
const SHOP_CONFIG = {
  business: "你的刀具公司",
  whatsapp: "",                     // 例:"85298765432"
  email: "sales@example.com",
  currency: "US$",                  // ROI 成本顯示用嘅貨幣符號
};

const CATALOG = [
  // ── 立銑刀 (milling) ──
  { sku: "EM-P-4F", type: "mill", name: "4刃鍍層立銑刀", iso: ["P", "K"], coating: "AlTiN", dia: [6, 12], url: "", note: "鋼/鑄鐵通用" },
  { sku: "EM-N-3F", type: "mill", name: "3刃鋁用立銑刀", iso: ["N"], coating: "未塗層拋光", dia: [3, 12], url: "", note: "大容屑・防黏鋁" },
  { sku: "EM-S-6F", type: "mill", name: "6刃不等距立銑刀", iso: ["S", "M"], coating: "AlCrN", dia: [6, 16], url: "", note: "鈦/不鏽鋼擺線銑" },
  { sku: "EM-H-2B", type: "mill", name: "2刃球刀(淬硬鋼)", iso: ["H"], coating: "TiSiN", dia: [1, 8], url: "", note: "HRC55 以下" },
  // ── 車削刀片 (insert) ──
  { sku: "CNMG-PM", type: "insert", name: "CNMG 鋼用刀片", iso: ["P"], shape: "C", coating: "CVD", url: "", note: "一般車削" },
  { sku: "DCMT-SM", type: "insert", name: "DCMT 不鏽鋼精車刀片", iso: ["M", "S"], shape: "D", coating: "PVD", url: "", note: "正型鋒利刃" },
  { sku: "VBMT-AL", type: "insert", name: "VBMT 鋁用刀片", iso: ["N"], shape: "V", coating: "拋光", url: "", note: "高光潔度" },
  { sku: "WNMG-PK", type: "insert", name: "WNMG 鋼/鑄鐵刀片", iso: ["P", "K"], shape: "W", coating: "CVD", url: "", note: "粗車耐磨" },
  // ── 鑽頭 (drill) ──
  { sku: "DR-P", type: "drill", name: "整體硬質合金鑽", iso: ["P", "K", "M"], coating: "TiAlN", dia: [3, 12], url: "", note: "內冷孔" },
  { sku: "DR-N", type: "drill", name: "鋁用鑽頭", iso: ["N"], coating: "未塗層", dia: [3, 12], url: "", note: "大螺旋角快排屑" },
  { sku: "DR-S", type: "drill", name: "耐熱合金鑽", iso: ["S"], coating: "AlCrN", dia: [4, 14], url: "", note: "加強鑽芯・高壓內冷" },
];
