/* =========================================================
 * 免責聲明與使用條款（多語言）
 * 供 App 內彈窗與 disclaimer.html 使用
 * ========================================================= */

const LEGAL_DISCLAIMER = {
  "zh-Hant": {
    title: "免責聲明與使用條款",
    effective: "2026-10-21",
    meta: "以下條款說明您使用本軟體的條件。本文件為一般資訊，不構成法律意見；若您需要針對特定司法管轄區的意見，請諮詢合資格律師。",
    sections: [
      {
        h: "1. 接受條款",
        p: [
          "「CNC 工程師工具包」（含網頁版、PWA 及 iOS/iPadOS 應用程式，以下稱「本軟體」）由開發者以「現狀」提供。您下載、安裝、開啟或使用本軟體，即表示您已閱讀、理解並同意受本免責聲明與使用條款（以下稱「本條款」）約束。若您不同意，請勿使用本軟體。",
        ],
      },
      {
        h: "2. 服務性質",
        p: [
          "本軟體為 CNC / 機械加工相關之參考計算與資訊工具，旨在協助工程師、程式員及技術人員進行估算與查閱。本軟體不提供專業工程、製造、安全或法律意見，亦不構成您與開發者之間的專業委任關係。",
          "所有輸出（含轉速、進給、功率、時間、表面粗糙度、G-code、公差查詢、材料參數等）均為依您輸入資料與內建公式／參考表所得之估算或範例，僅供內部參考，不可視為對特定工件、機床、刀具或現場條件之保證。",
        ],
      },
      {
        h: "3. 準確性與資料來源",
        p: [
          "內建材料切削資料、硬度換算、螺紋與公差表、刀具建議及工程參考資料，來自公開標準、文獻及行業慣例之整理，可能不完整、已過時或與您的批次材料／機床設定不符。",
          "開發者不保證本軟體之內容、計算結果或產生之程式無錯誤、無遺漏或持續適用於任何特定用途。您有責任以刀具商型錄、機床手冊、材料證明書及現場試切結果進行獨立核對。",
        ],
      },
      {
        h: "4. 您的責任與加工安全",
        p: [
          "您對使用本軟體所作之任何決定、程式、參數設定及實際加工行為承擔全部責任，包括但不限於：機床與工件夾持、刀具選用、冷卻、個人防護、碰撞與過切風險、火災與化學品安全、以及符合當地職業安全與環境法規。",
          "於實際切削或執行 G-code 前，您必須依機床／控制器廠商之規範進行核對、空跑或試運行，並由具資格人員監督。因未經核對而直接使用本軟體產出之程式或參數所導致之損害，開發者不承擔責任。",
        ],
      },
      {
        h: "5. 責任限制",
        p: [
          "在法律允許的最大範圍內，本軟體及相關說明文件均按「現狀」及「現有」基礎提供，開發者明確否認一切明示或默示之保證，包括但不限於適售性、特定用途適用性、準確性及不侵權之保證。",
          "在法律允許的最大範圍內，開發者及其關聯方對因使用或無法使用本軟體而產生之任何直接、間接、附帶、特殊、懲罰性或衍生性損害（包括利潤損失、生產中斷、設備損壞、人身傷害或資料損失）概不負責，即使已被告知該等損害之可能性。",
          "若您依消費者保護法或其他強制性法律享有不可排除之權利（例如歐盟、英國、澳洲、加拿大部分省區、日本、台灣、香港等地之法定權利），本條款中與該等權利衝突之限制在該範圍內不適用；其餘條款仍繼續有效。",
        ],
      },
      {
        h: "6. 國際使用與出口",
        p: [
          "您有責任確保在本國或地區使用、下載或傳輸本軟體及相關技術資料符合當地法律，包括出口管制、貿易制裁、資料保護及產業安全規定。開發者不表示本軟體適用於所有司法管轄區。",
        ],
      },
      {
        h: "7. 資料與隱私",
        p: [
          "本軟體以本地運算為主：計算在您裝置上執行；語言、單位、主題及收藏等偏好可儲存於裝置本機（如瀏覽器 localStorage）。開發者不設帳號伺服器，亦不主動收集可識別您個人之加工內容。",
          "若您使用「匯出截圖」「分享」或「儲存 G-code」等功能，資料將經由您裝置之系統分享表或檔案 App 處理，受該平台政策規範。詢價單功能若開啟 WhatsApp 或電郵，僅在您確認送出後由第三方服務處理，開發者不接收該內容。",
        ],
      },
      {
        h: "8. 第三方與平台",
        p: [
          "本軟體可能透過 Apple App Store、GitHub Pages 或其他平台分發。該等平台之條款與政策適用於下載與付款（如有）。Apple Inc. 及其子公司非本軟體之製造商，對本軟體內容及您使用本軟體所產生之索賠不負責（除平台自身義務外）。",
        ],
      },
      {
        h: "9. 條款變更",
        p: [
          "開發者可隨時更新本條款。更新後之生效日期將標示於本頁或 App 內。您於更新後繼續使用本軟體，即視為接受修訂內容。重大變更時，將於 App 或發佈說明中合理提示。",
        ],
      },
      {
        h: "10. 可分割性與聯絡",
        p: [
          "若本條款任一條款被具管轄權之法院或機關認定無效或不可執行，其餘條款仍完全有效。",
          "本條款之解釋與執行，除強制性消費者保護法律另有規定外，以您主要使用本軟體之司法管轄區之法律為準；必要時亦得適用開發者營運地之強制規定。",
          "如有條款或合規問題，請透過本專案 GitHub 儲存庫之 Issues 或 App Store 產品頁所列之支援方式聯絡開發者。",
        ],
      },
    ],
  },
};

// 簡體、英、德、法、印地語（結構同 zh-Hant）
LEGAL_DISCLAIMER["zh-Hans"] = {
  title: "免责声明与使用条款",
  effective: "2026-10-21",
  meta: "以下条款说明您使用本软件的条件。本文件为一般信息，不构成法律意见；若您需要针对特定司法管辖区的意见，请咨询合资格律师。",
  sections: [
    { h: "1. 接受条款", p: ["「CNC 工程师工具包」（含网页版、PWA 及 iOS/iPadOS 应用程序，以下称「本软件」）由开发者以「现状」提供。您下载、安装、打开或使用本软件，即表示您已阅读、理解并同意受本免责声明与使用条款（以下称「本条款」）约束。若您不同意，请勿使用本软件。"] },
    { h: "2. 服务性质", p: ["本软件为 CNC / 机械加工相关的参考计算与信息工具，旨在协助工程师、程序员及技术人员进行估算与查阅。本软件不提供专业工程、制造、安全或法律意见，亦不构成您与开发者之间的专业委任关系。", "所有输出（含转速、进给、功率、时间、表面粗糙度、G-code、公差查询、材料参数等）均为依您输入数据与内置公式／参考表所得之估算或范例，仅供内部参考，不可视为对特定工件、机床、刀具或现场条件的保证。"] },
    { h: "3. 准确性与数据来源", p: ["内置材料切削数据、硬度换算、螺纹与公差表、刀具建议及工程参考资料，来自公开标准、文献及行业惯例之整理，可能不完整、已过时或与您的批次材料／机床设定不符。", "开发者不保证本软件之内容、计算结果或产生之程序无错误、无遗漏或持续适用于任何特定用途。您有责任以刀具商型录、机床手册、材料证明书及现场试切结果进行独立核对。"] },
    { h: "4. 您的责任与加工安全", p: ["您对使用本软件所作之任何决定、程序、参数设定及实际加工行为承担全部责任，包括但不限于：机床与工件夹持、刀具选用、冷却、个人防护、碰撞与过切风险、火灾与化学品安全，以及符合当地职业安全与环境法规。", "于实际切削或执行 G-code 前，您必须依机床／控制器厂商之规范进行核对、空跑或试运行，并由具资格人员监督。因未经核对而直接使用本软件产出之程序或参数所导致的损害，开发者不承担责任。"] },
    { h: "5. 责任限制", p: ["在法律允许的最大范围内，本软件及相关说明文件均按「现状」及「现有」基础提供，开发者明确否认一切明示或默示之保证，包括但不限于适售性、特定用途适用性、准确性及不侵权之保证。", "在法律允许的最大范围内，开发者及其关联方对因使用或无法使用本软件而产生之任何直接、间接、附带、特殊、惩罚性或衍生性损害（包括利润损失、生产中断、设备损坏、人身伤害或数据损失）概不负责，即使已被告知该等损害之可能性。", "若您依消费者保护法或其他强制性法律享有不可排除之权利（例如欧盟、英国、澳洲、加拿大部分省区、日本、台湾、香港等地之法定权利），本条款中与该等权利冲突之限制在该范围内不适用；其余条款仍继续有效。"] },
    { h: "6. 国际使用与出口", p: ["您有责任确保在本国或地区使用、下载或传输本软件及相关技术资料符合当地法律，包括出口管制、贸易制裁、数据保护及产业安全规定。开发者不表示本软件适用于所有司法管辖区。"] },
    { h: "7. 数据与隐私", p: ["本软件以本地运算为主：计算在您设备上执行；语言、单位、主题及收藏等偏好可储存于设备本地（如浏览器 localStorage）。开发者不设账号服务器，亦不主动收集可识别您个人之加工内容。", "若您使用「导出截图」「分享」或「保存 G-code」等功能，数据将经由您设备之系统分享表或文件 App 处理，受该平台政策规范。询价单功能若开启 WhatsApp 或电邮，仅在您确认送出后由第三方服务处理，开发者不接收该内容。"] },
    { h: "8. 第三方与平台", p: ["本软件可能透过 Apple App Store、GitHub Pages 或其他平台分发。该等平台之条款与政策适用于下载与付款（如有）。Apple Inc. 及其子公司非本软件之制造商，对本软件内容及您使用本软件所产生之索赔不负责（除平台自身义务外）。"] },
    { h: "9. 条款变更", p: ["开发者可随时更新本条款。更新后之生效日期将标示于本页或 App 内。您于更新后继续使用本软件，即视为接受修订内容。重大变更时，将于 App 或发布说明中合理提示。"] },
    { h: "10. 可分割性与联络", p: ["若本条款任一条款被具管辖权之法院或机关认定无效或不可执行，其余条款仍完全有效。", "本条款之解释与执行，除强制性消费者保护法律另有规定外，以您主要使用本软件之司法管辖区之法律为准；必要时亦得适用开发者营运地之强制规定。", "如有条款或合规问题，请透过本专案 GitHub 储存库之 Issues 或 App Store 产品页所列之支援方式联络开发者。"] },
  ],
};

LEGAL_DISCLAIMER.en = {
  title: "Disclaimer & Terms of Use",
  effective: "2026-10-21",
  meta: "These terms govern your use of the software. This document is general information only and is not legal advice. Consult a qualified lawyer for advice in your jurisdiction.",
  sections: [
    { h: "1. Acceptance", p: ["CNC Engineer's Toolkit (web, PWA, and iOS/iPadOS app — the \"Software\") is provided on an \"as is\" basis. By downloading, installing, opening, or using the Software, you agree to this Disclaimer and Terms of Use (\"Terms\"). If you do not agree, do not use the Software."] },
    { h: "2. Nature of the service", p: ["The Software is a reference calculator and information tool for CNC/machining. It does not provide professional engineering, manufacturing, safety, or legal advice, and does not create a professional-client relationship.", "All outputs (speeds, feeds, power, cycle time, surface finish, G-code, tolerances, material data, etc.) are estimates or examples based on your inputs and built-in formulas/tables. They are not guarantees for any specific part, machine, tool, or shop condition."] },
    { h: "3. Accuracy and data", p: ["Material data, hardness conversions, thread/tolerance tables, tool recommendations, and reference content are compiled from public standards and industry practice. They may be incomplete, outdated, or unsuitable for your lot/material or machine.", "The developer does not warrant that content, results, or generated programs are error-free or fit for any particular purpose. You must independently verify against tool catalogs, machine manuals, material certificates, and trial cuts."] },
    { h: "4. Your responsibility and safety", p: ["You are solely responsible for decisions, programs, parameters, and machining you perform, including workholding, tooling, coolant, PPE, collision/overcut risk, fire/chemical safety, and compliance with local occupational safety and environmental laws.", "Before cutting or running G-code, verify against your machine/controller documentation, dry-run or prove-out, and supervise with qualified personnel. The developer is not liable for damage from unchecked use of outputs."] },
    { h: "5. Limitation of liability", p: ["To the maximum extent permitted by law, the Software is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy, or non-infringement.", "To the maximum extent permitted by law, the developer and affiliates shall not be liable for any direct, indirect, incidental, special, punitive, or consequential damages (including lost profits, downtime, equipment damage, personal injury, or data loss), even if advised of the possibility.", "Nothing in these Terms excludes or limits rights that cannot be excluded under mandatory consumer or other laws (e.g. EU/UK, Australia, certain Canadian provinces, Japan, Taiwan, Hong Kong). Where such laws apply, limitations apply only to the extent permitted."] },
    { h: "6. International use", p: ["You must ensure that use, download, or transfer of the Software complies with laws in your country/region, including export controls, sanctions, data protection, and industrial safety rules. The developer does not represent that the Software is appropriate in every jurisdiction."] },
    { h: "7. Data and privacy", p: ["Calculations run on your device. Preferences (language, units, theme, favorites) may be stored locally (e.g. browser localStorage). The developer does not operate account servers or collect your machining inputs as personal data by default.", "Export/share/save features use your device's share sheet or Files app under platform policies. Inquiry features that open WhatsApp or email are handled by those services only after you send; the developer does not receive that content."] },
    { h: "8. Third parties and platforms", p: ["The Software may be distributed via the Apple App Store, GitHub Pages, or other channels. Their terms apply. Apple Inc. and its subsidiaries are not the seller of the Software and are not responsible for the Software or claims arising from your use except as required by platform rules."] },
    { h: "9. Changes", p: ["The developer may update these Terms. The effective date will be shown in-app or on this page. Continued use after changes constitutes acceptance. Material changes will be reasonably highlighted in release notes or the app."] },
    { h: "10. Severability and contact", p: ["If any provision is held invalid, the remainder stays in effect.", "Except where mandatory consumer law requires otherwise, these Terms are interpreted under the laws of the jurisdiction where you primarily use the Software, subject to non-waivable local rules.", "Contact the developer via the project's GitHub Issues or the support link on the App Store product page."] },
  ],
};

LEGAL_DISCLAIMER.de = {
  title: "Haftungsausschluss & Nutzungsbedingungen",
  effective: "2026-10-21",
  meta: "Diese Bedingungen regeln die Nutzung der Software. Keine Rechtsberatung — bei Bedarf einen zugelassenen Rechtsanwalt konsultieren.",
  sections: [
    { h: "1. Annahme", p: ["Das „CNC Engineer's Toolkit“ (Web, PWA, iOS/iPadOS — die „Software“) wird „wie besehen“ bereitgestellt. Mit Nutzung stimmen Sie diesen Bedingungen zu. Andernfalls nicht verwenden."] },
    { h: "2. Art der Leistung", p: ["Die Software ist ein Referenz- und Berechnungswerkzeug für die Zerspanung. Keine professionelle Beratung in Technik, Fertigung, Sicherheit oder Recht.", "Alle Ergebnisse sind Schätzungen/Beispiele auf Basis Ihrer Eingaben und eingebauter Formeln/Tabellen — keine Garantie für Werkstück, Maschine oder Werkzeug."] },
    { h: "3. Genauigkeit", p: ["Materialdaten, Härteumrechnung, Gewinde/Toleranzen und Referenzen können unvollständig oder veraltet sein. Keine Gewähr für Fehlerfreiheit oder Eignung. Eigenständige Prüfung an Katalogen, Maschinenhandbüchern und Probefertigung erforderlich."] },
    { h: "4. Ihre Verantwortung & Sicherheit", p: ["Sie tragen die volle Verantwortung für Entscheidungen, Programme, Parameter und die Bearbeitung, einschließlich Einspannung, Werkzeug, Kühlschmiermittel, PSA, Kollisionsrisiko und Einhaltung lokaler Arbeitsschutz- und Umweltvorschriften.", "Vor Schnitt oder G-Code: Prüfung, Trockenlauf/Probe, qualifizierte Aufsicht. Keine Haftung für ungeprüfte Nutzung der Ausgaben."] },
    { h: "5. Haftungsbeschränkung", p: ["Soweit gesetzlich zulässig: keine Gewährleistung, weder ausdrücklich noch stillschweigend.", "Soweit gesetzlich zulässig: keine Haftung für indirekte Folgeschäden, entgangenen Gewinn, Ausfall, Sach- oder Personenschäden.", "Zwingende Verbraucherrechte (z. B. EU/UK, Australien, Japan, Taiwan, Hongkong) bleiben unberührt; Beschränkungen gelten nur im zulässigen Umfang."] },
    { h: "6. Internationale Nutzung", p: ["Sie sind für die Einhaltung lokaler Gesetze (Export, Sanktionen, Datenschutz, Arbeitsschutz) verantwortlich."] },
    { h: "7. Daten & Datenschutz", p: ["Berechnungen lokal auf dem Gerät. Einstellungen können lokal gespeichert werden. Kein eigenes Benutzerkonto-Server durch den Entwickler.", "Teilen/Speichern über Systemdialoge; WhatsApp/E-Mail nur nach Ihrer Aktion durch Dritte."] },
    { h: "8. Dritte & Plattformen", p: ["Vertrieb z. B. über App Store oder GitHub Pages — deren Bedingungen gelten. Apple ist nicht Hersteller der Software und nicht für Inhalte haftbar, außer nach Plattformregeln."] },
    { h: "9. Änderungen", p: ["Aktualisierungen möglich; fortgesetzte Nutzung gilt als Zustimmung."] },
    { h: "10. Salvatorische Klausel & Kontakt", p: ["Unwirksame Klauseln berühren den Rest nicht.", "Anwendbares Recht: Ihr Hauptnutzungsstaat, vorbehaltlich zwingender Verbraucherschutzvorschriften.", "Kontakt über GitHub Issues oder App-Store-Support."] },
  ],
};

LEGAL_DISCLAIMER.fr = {
  title: "Avertissement & conditions d'utilisation",
  effective: "2026-10-21",
  meta: "Ces conditions régissent l'utilisation du logiciel. Document d'information générale, pas un conseil juridique.",
  sections: [
    { h: "1. Acceptation", p: ["« CNC Engineer's Toolkit » (web, PWA, iOS/iPadOS — le « Logiciel ») est fourni « en l'état ». En l'utilisant, vous acceptez les présentes conditions. Sinon, n'utilisez pas le Logiciel."] },
    { h: "2. Nature du service", p: ["Outil de calcul et de référence pour l'usinage CNC — pas un conseil professionnel en ingénierie, fabrication, sécurité ou droit.", "Toutes les sorties sont des estimations/exemples selon vos entrées et les formules/tables intégrées."] },
    { h: "3. Exactitude", p: ["Données matériaux, conversions, filetages/tolérances et références peuvent être incomplètes ou obsolètes. Aucune garantie d'exactitude ou d'adéquation. Vérification indépendante obligatoire (catalogues, manuels, essais)."] },
    { h: "4. Votre responsabilité & sécurité", p: ["Vous êtes seul responsable des décisions, programmes, paramètres et de l'usinage, y compris fixation, outils, fluides, EPI, risques de collision et conformité aux règles locales de sécurité et d'environnement.", "Avant usinage ou G-code : vérification, essai à blanc, supervision qualifiée."] },
    { h: "5. Limitation de responsabilité", p: ["Dans la mesure permise par la loi : exclusion des garanties expresses ou implicites.", "Dans la mesure permise : pas de responsabilité pour dommages indirects, perte de profit, arrêt, matériel ou corporel.", "Droits impératifs des consommateurs (UE/R-U, etc.) non exclus ; limitations applicables seulement dans la mesure autorisée."] },
    { h: "6. Usage international", p: ["Vous devez respecter les lois locales (exportation, sanctions, données, sécurité au travail)."] },
    { h: "7. Données & confidentialité", p: ["Calculs sur l'appareil ; préférences stockées localement. Pas de serveur de comptes par le développeur.", "Partage/enregistrement via les services système ; WhatsApp/e-mail traités par des tiers après votre envoi."] },
    { h: "8. Tiers & plateformes", p: ["Distribution via App Store, GitHub Pages, etc. Apple n'est pas le vendeur du Logiciel ni responsable du contenu sauf règles plateforme."] },
    { h: "9. Modifications", p: ["Conditions susceptibles d'être mises à jour ; poursuite d'utilisation = acceptation."] },
    { h: "10. Divisibilité & contact", p: ["Clause invalide n'affecte pas le reste.", "Droit applicable : votre juridiction principale, sous réserve des règles impératives.", "Contact : Issues GitHub ou support App Store."] },
  ],
};

LEGAL_DISCLAIMER.hi = {
  title: "अस्वीकरण और उपयोग की शर्तें",
  effective: "2026-10-21",
  meta: "ये शर्तें सॉफ़्टवेयर के उपयोग को नियंत्रित करती हैं। यह कानूनी सलाह नहीं है; अपने क्षेत्र के वकील से सलाह लें।",
  sections: [
    { h: "1. स्वीकृति", p: ["«CNC Engineer's Toolkit» (वेब, PWA, iOS/iPadOS — «सॉफ़्टवेयर») «जैसा है» आधार पर दिया जाता है। उपयोग करके आप इन शर्तों से सहमत हैं।"] },
    { h: "2. सेवा की प्रकृति", p: ["यह CNC/मशीनिंग के लिए संदर्भ और गणना उपकरण है — पेशेवर इंजीनियरिंग, सुरक्षा या कानूनी सलाह नहीं।", "सभी आउटपुट आपके इनपुट और अंतर्निहित सूत्रों/तालिकाओं पर आधारित अनुमान हैं।"] },
    { h: "3. सटीकता", p: ["सामग्री डेटा, कठोरता, थ्रेड/सहन और संदर्भ अधूरे या पुराने हो सकते हैं। परिणामों की गारंटी नहीं; स्वतंत्र सत्यापन आवश्यक।"] },
    { h: "4. आपकी जिम्मेदारी और सुरक्षा", p: ["निर्णय, प्रोग्राम, पैरामीटर और मशीनिंग की पूरी जिम्मेदारी आपकी — फिक्स्चरिंग, टूलिंग, PPE, संघर्ष जोखिम, स्थानीय सुरक्षा/पर्यावरण कानून।", "कटिंग/G-code से पहले: सत्यापन, ड्राई रन, योग्य पर्यवेक्षण।"] },
    { h: "5. दायित्व की सीमा", p: ["कानून द्वारा अनुमत अधिकतम सीमा तक कोई वारंटी नहीं।", "कानून द्वारा अनुमत सीमा तक अप्रत्यक्ष/परिणामी हानि के लिए जिम्मेदारी नहीं।", "अनिवार्य उपभोक्ता अधिकार (EU/UK, आदि) जहाँ लागू हों, उन्हें बाहर नहीं किया जाता।"] },
    { h: "6. अंतर्राष्ट्रीय उपयोग", p: ["आप स्थानीय कानूनों (निर्यात, प्रतिबंध, डेटा, सुरक्षा) का पालन करेंगे।"] },
    { h: "7. डेटा और गोपनीयता", p: ["गणना डिवाइस पर; प्राथमिकताएँ स्थानीय संग्रह। डेवलपर खाता सर्वर नहीं चलाता।", "शेयर/सेव सिस्टम सेवाओं के माध्यम से; WhatsApp/ईमेल तीसरे पक्ष द्वारा।"] },
    { h: "8. तृतीय पक्ष", p: ["App Store/GitHub Pages आदि के नियम लागू। Apple सॉफ़्टवेयर का निर्माता नहीं।"] },
    { h: "9. परिवर्तन", p: ["शर्तें अपडेट हो सकती हैं; निरंतर उपयोग = स्वीकृति।"] },
    { h: "10. विभाज्यता और संपर्क", p: ["अमान्य खंड शेष को प्रभावित नहीं करता।", "लागू कानून: आपका मुख्य क्षेत्राधिकार, अनिवार्य नियमों के अधीन।", "संपर्क: GitHub Issues या App Store सहायता।"] },
  ],
};

/** @param {string} lang */
function getLegalDisclaimer(lang) {
  return LEGAL_DISCLAIMER[lang] || LEGAL_DISCLAIMER.en;
}

/** @param {string} lang @returns {string} HTML fragment */
function buildDisclaimerHtml(lang) {
  const d = getLegalDisclaimer(lang);
  const esc = typeof escapeHtml === "function" ? escapeHtml : (s) => String(s);
  const parts = [
    `<p class="legal-meta">${esc(d.meta)}</p>`,
    `<p class="legal-effective"><strong>${esc(typeof t === "function" ? t("legal.effective") : "Effective")}:</strong> ${esc(d.effective)}</p>`,
  ];
  for (const sec of d.sections) {
    parts.push(`<h4 class="legal-h">${esc(sec.h)}</h4>`);
    for (const para of sec.p) {
      parts.push(`<p class="legal-p">${esc(para)}</p>`);
    }
  }
  return parts.join("");
}
