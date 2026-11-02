// 教學內容：示範病例、考題、心智圖。病例皆為虛構。
// 病例結果由工具引擎即時計算；expect 由 tests.cjs 核對，內文數字改動時要一起改。
const TEACH_SOURCES = {
  isrnm: { label: "ISRNM 2008", url: "https://doi.org/10.1038/sj.ki.5002585", cite: "Fouque D, et al. A proposed nomenclature and diagnostic criteria for protein-energy wasting in acute and chronic kidney disease. Kidney Int 2008;73:391-398." },
  kdoqi: { label: "KDOQI 2020", url: "https://www.ajkd.org/article/S0272-6386(20)30726-5/fulltext", cite: "Ikizler TA, et al. KDOQI Clinical Practice Guideline for Nutrition in CKD: 2020 Update. Am J Kidney Dis 2020;76(3 Suppl 1):S1-S107." },
  kdigo: { label: "KDIGO 2024", url: "https://www.kidney-international.org/article/S0085-2538(23)00766-4/fulltext", cite: "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD. Kidney Int 2024;105(4S):S117-S314（Rec 3.3.1.1、PP 3.3.1.1-3.3.1.5、PP 3.10.1）。" },
  awgs: { label: "AWGS 2019", url: "https://doi.org/10.1016/j.jamda.2019.12.012", cite: "Chen LK, et al. Asian Working Group for Sarcopenia: 2019 Consensus Update. J Am Med Dir Assoc 2020;21:300-307（僅讀摘要）。" },
  treat: { label: "ISRNM 2013", url: "https://doi.org/10.1038/ki.2013.147", cite: "Ikizler TA, et al. Prevention and treatment of protein energy wasting in CKD patients: ISRNM consensus. Kidney Int 2013;84:1096-1107（僅讀摘要）。" },
  prev: { label: "Carrero 2018", url: "https://doi.org/10.1053/j.jrn.2018.08.006", cite: "Carrero JJ, et al. Global prevalence of protein-energy wasting in kidney disease. J Ren Nutr 2018;28:380-392（僅讀摘要）。" },
  flow: { label: "FLOW 2024", url: "https://doi.org/10.1056/NEJMoa2403347", cite: "Perkovic V, et al. Effects of semaglutide on CKD in patients with type 2 diabetes. N Engl J Med 2024;391:109-121（僅讀摘要）。" }
};

const TEACH_CASES = [
  {
    id: "restrict",
    tag: "未透析・過度限制",
    title: "怕血糖、怕鉀、怕蛋白，結果什麼都不敢吃",
    stem: "68 歲女性，第 2 型糖尿病 18 年，DKD G4。曾有 2 次低血糖後愈吃愈少。三日飲食紀錄：每日 1050 kcal、蛋白質 32 g，已持續約 3 個月。她說：「我都照你們說的，蛋白質吃很少。」",
    facts: ["155 cm／50.0 kg", "BMI 20.8", "3 個月前 53.5 kg", "6 個月前 54.5 kg", "eGFR 24", "UACR 850 mg/g", "HbA1c 6.4%", "白蛋白 3.6 g/dL（BCG）", "握力 16 kg", "小腿圍 31 cm", "無水腫"],
    question: "蛋白質 0.64 g/kg 已經算吃太少嗎？這位病人真正缺的是什麼？",
    input: {
      basics: { age: "68", sex: "女", ckdStage: "G4", height: "155", weight: "50" },
      patientAnswers: { appetite: 1, mealAmount: 2, skipMeals: 1, proteinFoods: 1, weightLoss: 2, muscleLoss: 1, function: 1, giSymptoms: 0, restriction: 2, infection: 0 },
      redFlags: ["weightLoss5"],
      educatorFields: { egfr: "24", uacr: "850 mg/g", hba1c: "6.4", weightToday: "50", weight1m: "51", weight3m: "53.5", weight6m: "54.5", edema: "無", heartFailure: "否", recentHospital: "否", woundInfection: "否" },
      educatorRisks: ["egfrLow", "proteinuria", "glucoseIssue", "overRestriction"],
      na: ["prealbumin", "proteinDialysis", "dryWeightLoss", "biaDxa", "arm", "fatLoss", "crp"],
      medicalChecks: [],
      notes: { albumin: "3.6 g/dL（BCG）", energy: "21 kcal/kg/day，約 3 個月", proteinCkd: "0.64 g/kg/day，未 <0.6", grip: "16 kg", calf: "31 cm" }
    },
    scenarios: [
      { label: "工具判讀", yes: ["albumin", "weightLoss3m", "bmiLow", "calf", "grip", "energy", "overRestrictionDiet"], expect: { positive: 4, badge: "符合 DKD-PEW", total: 7, support: 1 } },
      { label: "只算 ISRNM 原始項目", yes: ["albumin", "weightLoss3m", "bmiLow", "energy", "overRestrictionDiet"], expect: { positive: 3, badge: "符合 DKD-PEW", total: 5, support: 1 } }
    ],
    expect: { patient: 11, flags: 1, patientBadge: "極高風險", educator: 4, tier: "高", m3: -6.5, m6: -8.3, bmi: 20.8 },
    read: [
      "蛋白質 32 g ÷ 50 kg = 0.64 g/kg，落在 KDOQI 對糖尿病 CKD 3-5 的 0.6-0.8 g/kg，也沒有低於 ISRNM 的 <0.6。",
      "熱量 1050 ÷ 50 = 21 kcal/kg，低於 ISRNM 的 <25 kcal/kg（≥2 個月），這才是攝取類陽性的原因。",
      "體重 3 個月 −6.5% 達標；6 個月 −8.3% 未達 10%。只要符合其中一項就算體重下降條件。",
      "即使拿掉握力與小腿圍（AWGS 切點，非 ISRNM 原始項目），仍有生化、體重、攝取 3 類。"
    ],
    plan: [
      "先補熱量：KDOQI 25-35 kcal/kg，以現在體重粗估 1250-1750 kcal，由營養師依活動量與血糖定目標。",
      "蛋白質目標與團隊對齊：KDOQI 糖尿病 CKD 3-5 為 0.6-0.8 g/kg（30-40 g）；KDIGO 為 0.8 g/kg；KDIGO 另提醒衰弱或肌少症的長者可考慮更高的蛋白與熱量目標。",
      "請醫師回顧造成低血糖的藥物，讓她不必靠少吃來防低血糖。",
      "飲食諮詢仍補不足時，試用口服營養補充品至少 3 個月（KDOQI 4.1.1）。"
    ],
    pitfall: "繼續強調「蛋白質再少一點」。她的蛋白質達標，缺的是熱量；衛教時要明確說出「不是吃越少越好」。",
    src: ["isrnm", "kdoqi", "kdigo", "awgs"]
  },
  {
    id: "nephrotic",
    tag: "大量蛋白尿・水腫",
    title: "白蛋白 2.8，但他是 PEW 嗎？",
    stem: "58 歲男性，DKD G3b，下肢明顯水腫 2 個月。食慾正常，三日飲食紀錄約 28 kcal/kg、蛋白質 0.9 g/kg。門診同仁看到白蛋白 2.8，建議他「多吃蛋白質補回來」。",
    facts: ["175 cm／78 kg", "3 個月前 74 kg", "eGFR 38", "UACR 4200 mg/g", "白蛋白 2.8 g/dL", "總膽固醇 240 mg/dL", "握力 34 kg", "水腫明顯"],
    question: "白蛋白這一格該勾「是」嗎？多吃蛋白質是對的方向嗎？",
    input: {
      basics: { age: "58", sex: "男", ckdStage: "G3b", height: "175", weight: "78" },
      patientAnswers: { appetite: 0, mealAmount: 0, skipMeals: 0, proteinFoods: 0, weightLoss: 0, muscleLoss: 0, function: 1, giSymptoms: 0, restriction: 1, infection: 0 },
      redFlags: [],
      educatorFields: { egfr: "38", uacr: "4200 mg/g", hba1c: "7.4", weightToday: "78", weight1m: "76.5", weight3m: "74", weight6m: "", edema: "明顯", heartFailure: "否", recentHospital: "否", woundInfection: "否" },
      educatorRisks: ["proteinuria", "heartFailure"],
      na: ["prealbumin", "proteinDialysis", "dryWeightLoss", "biaDxa", "arm", "fatLoss", "calf", "bmiLow"],
      medicalChecks: [0, 2],
      notes: { albumin: "2.8 g/dL，UACR 4200，由尿中流失解釋", calf: "水腫，暫不判讀", bmiLow: "無乾體重，暫不判讀" }
    },
    scenarios: [
      { label: "正確判讀", yes: [], expect: { positive: 0, badge: "目前未符合", total: 0, support: 0 } },
      { label: "誤把白蛋白算陽性", yes: ["albumin"], expect: { positive: 1, badge: "單一類別異常", total: 1, support: 0 } }
    ],
    expect: { patient: 2, flags: 0, patientBadge: "低風險", educator: 2, tier: "中", m3: 5.4, m6: null, bmi: 25.5 },
    read: [
      "ISRNM 表 1 註明：白蛋白、前白蛋白、膽固醇若因尿或腸胃道大量流失蛋白、肝病或降膽固醇藥而偏低，此條件不適用。",
      "就算誤勾，也只有 1 類，遠不到 ≥3 類。ISRNM 明言低白蛋白對診斷 PEW 既非必要也非充分。",
      "體重增加 5.4% 是水，不能拿來說營養好：水腫時體重與小腿圍都不可靠，要等無水腫體重（KDOQI 1.1.6）。",
      "攝取、握力目前都未達標，沒有其他類別支持 PEW。"
    ],
    plan: [
      "由醫師處理蛋白尿與水腫，再於水腫改善後重新量體重、小腿圍。",
      "不建議用高蛋白飲食「補」白蛋白：KDIGO 提醒進展風險者避免 >1.3 g/kg；目前 0.9 g/kg 不需要再加。",
      "熱量維持 25-35 kcal/kg，避免限鈉、限蛋白後反而吃不夠。"
    ],
    pitfall: "看到白蛋白低就下營養不良診斷。先問「白蛋白去哪了」，再問「有沒有吃不夠」。",
    src: ["isrnm", "kdoqi", "kdigo"]
  },
  {
    id: "obese",
    tag: "肥胖型 PEW",
    title: "BMI 31.8，家人恭喜他瘦了",
    stem: "62 歲男性，DKD G4，糖尿病胃輕癱，近 3 個月早飽、噁心，沒有刻意減重。家人說他「終於瘦下來」。走路變慢，從椅子起身要撐扶手。三日飲食紀錄每日 1550 kcal、蛋白質 55 g。",
    facts: ["170 cm／92 kg", "BMI 31.8", "3 個月前 98 kg", "6 個月前 99 kg", "eGFR 22", "UACR 600 mg/g", "HbA1c 8.1%", "白蛋白 3.7 g/dL（BCG）", "握力 27 kg（半年前 36 kg）", "5 次坐站 14 秒", "小腿圍 36 cm"],
    question: "BMI 這麼高，還需要懷疑 PEW 嗎？熱量該用哪個體重算？",
    input: {
      basics: { age: "62", sex: "男", ckdStage: "G4", height: "170", weight: "92" },
      patientAnswers: { appetite: 1, mealAmount: 1, skipMeals: 0, proteinFoods: 1, weightLoss: 2, muscleLoss: 1, function: 2, giSymptoms: 2, restriction: 0, infection: 0 },
      redFlags: ["weightLoss5", "muscleStrength"],
      educatorFields: { egfr: "22", uacr: "600 mg/g", hba1c: "8.1", weightToday: "92", weight1m: "94", weight3m: "98", weight6m: "99", edema: "無", heartFailure: "否", recentHospital: "否", woundInfection: "否" },
      educatorRisks: ["egfrLow", "proteinuria", "gastroparesis", "neuropathy"],
      na: ["prealbumin", "proteinDialysis", "dryWeightLoss", "biaDxa", "arm", "fatLoss", "crp"],
      medicalChecks: [6],
      notes: { albumin: "3.7 g/dL（BCG）", energy: "約 18 kcal/kg/day（校正體重）", grip: "27 kg，半年前 36 kg", sitStand: "14 秒" }
    },
    scenarios: [
      { label: "工具判讀", yes: ["albumin", "weightLoss3m", "grip", "sitStand", "energy", "giDiet"], expect: { positive: 4, badge: "符合 DKD-PEW", total: 6, support: 1 } },
      { label: "只算 ISRNM 原始項目", yes: ["albumin", "weightLoss3m", "energy", "giDiet"], expect: { positive: 3, badge: "符合 DKD-PEW", total: 4, support: 1 } }
    ],
    expect: { patient: 10, flags: 2, patientBadge: "高風險", educator: 4, tier: "高", m3: -6.1, m6: -7.1, bmi: 31.8 },
    read: [
      "BMI <23 只是體重類的其中一項。非刻意體重下降 6.1% 本身就達標，ISRNM 指明這項獨立於身高體重比。",
      "KDOQI 1.1.11 也提醒 BMI 單獨不足以判定 PEW（除非 <18）；高 BMI 同樣不能排除。",
      "體重超過標準體重 115% 時，KDOQI 建議用校正體重：以 BMI 22 估標準體重 63.6 kg，校正後約 84.9 kg，1550 kcal 約 18 kcal/kg。用實際體重算則約 17 kcal/kg，兩者都 <25。",
      "握力下降 25% 有前次數值可比，符合 KDOQI 1.3.1 的使用條件；但 ISRNM 原始的肌肉類看的是肌肉量，不是肌力。"
    ],
    plan: [
      "告知家人這次變瘦不是好事，暫停以減重為目標。",
      "請醫師處理胃輕癱與血糖，並回顧可能影響食慾的藥物。",
      "少量多餐，諮詢補不足時試用口服營養補充品（KDOQI 4.1.1）。",
      "想確認肌肉量時，KDOQI 認為 DXA 可行時合理；未透析 CKD 用 BIA 的證據不足（1.1.2-1.1.3）。"
    ],
    pitfall: "以 BMI 高就跳過評估。工具也會在此漏掉 BMI 這一項，體重趨勢與肌力才是線索。",
    src: ["isrnm", "kdoqi", "awgs"]
  },
  {
    id: "hd",
    tag: "血液透析",
    title: "開始透析了，還在照舊低蛋白",
    stem: "74 歲女性，HD 3 年，獨居。透析前被叮嚀要低蛋白，到現在仍不太敢吃肉。三日紀錄（含透析日與非透析日）每日 880 kcal、蛋白質 30 g，持續超過 3 個月。可見顳肌與股四頭肌萎縮。",
    facts: ["152 cm／乾體重 44.0 kg", "BMI 19.0", "3 個月前乾體重 47.0 kg", "6 個月前 48.0 kg", "白蛋白 3.3 g/dL（BCG）", "前白蛋白 21 mg/dL", "總膽固醇 118 mg/dL", "nPCR 0.68", "透析前 HCO3 20 mmol/L", "握力 12 kg", "小腿圍 28 cm"],
    question: "她的蛋白質目標是多少？飲食諮詢沒起色時，下一步依序是什麼？",
    input: {
      basics: { age: "74", sex: "女", ckdStage: "透析", dialysis: "HD", height: "152", weight: "44", dryWeight: "44" },
      patientAnswers: { appetite: 2, mealAmount: 2, skipMeals: 1, proteinFoods: 2, weightLoss: 1, muscleLoss: 2, function: 2, giSymptoms: 1, restriction: 1, infection: 0 },
      redFlags: ["weightLoss5", "albuminAndSymptoms", "muscleStrength"],
      educatorFields: { egfr: "", uacr: "", hba1c: "6.8", dialysisDryWeight: "44.0 kg", weightToday: "44", weight1m: "45", weight3m: "47", weight6m: "48", edema: "無", heartFailure: "否", recentHospital: "否", woundInfection: "否" },
      educatorRisks: ["neuropathy", "overRestriction", "social"],
      na: ["proteinCkd", "biaDxa", "arm", "fatLoss", "sitStand", "crp"],
      medicalChecks: [5],
      notes: { albumin: "3.3 g/dL（BCG）", prealbumin: "21 mg/dL", dryWeightLoss: "47.0→44.0 kg", energy: "20 kcal/kg/day", proteinDialysis: "0.68 g/kg/day；nPCR 0.68", bicarbonate: "透析前 20 mmol/L" }
    },
    scenarios: [
      { label: "工具判讀", yes: ["albumin", "prealbumin", "dryWeightLoss", "bmiLow", "calf", "grip", "clinicalWasting", "energy", "proteinDialysis", "bicarbonate", "overRestrictionDiet"], expect: { positive: 4, badge: "符合 DKD-PEW", total: 10, support: 2 } },
      { label: "同一次體重下降勾兩項", yes: ["albumin", "prealbumin", "weightLoss3m", "dryWeightLoss", "bmiLow", "calf", "grip", "clinicalWasting", "energy", "proteinDialysis", "bicarbonate", "overRestrictionDiet"], expect: { positive: 4, badge: "符合 DKD-PEW", total: 10, support: 2 } }
    ],
    expect: { patient: 14, flags: 3, patientBadge: "極高風險", educator: 3, tier: "高", m3: -6.4, m6: -8.3, bmi: 19.0 },
    read: [
      "四大類全陽性。前白蛋白 <30 mg/dL 這一項只適用於維持性透析，她適用。",
      "蛋白質 0.68 g/kg 低於 ISRNM 透析切點 <0.8，熱量 20 kcal/kg 低於 <25，都超過 2 個月。",
      "第二列提醒：同一次體重下降勾兩項時，總分只計一次，類別數也不變。判定看的是類別數。",
      "透析前低碳酸氫根與過度限制列為病因因子，不計入類別，但都是可介入的目標。"
    ],
    plan: [
      "目標改為蛋白質 1.0-1.2 g/kg（44-53 g）、熱量 25-35 kcal/kg（1100-1540 kcal），明確說明透析後目標與透析前不同。",
      "依序：飲食諮詢 → 口服營養補充品至少 3 個月（4.1.1）→ 仍不足考慮管灌（4.1.2）→ 無法由口與腸道滿足時試用 IDPN（4.1.3）。",
      "腎臟科回顧酸中毒與透析處方；ISRNM 2013 將矯正代謝異常、優化透析列入介入。",
      "獨居與備餐問題要一起解決，KDOQI 1.6.1 把認知、憂鬱、取得食物都列入評估。",
      "可用 7 分 SGA 或 MIS 追蹤（KDOQI 1.5.1-1.5.2）。"
    ],
    pitfall: "把透析前的低蛋白衛教帶到透析後。開始透析時，要主動把飲食目標重講一次。",
    src: ["isrnm", "kdoqi", "treat", "kdigo"]
  },
  {
    id: "infection",
    tag: "急性感染",
    title: "足部感染出院兩週，現在能下診斷嗎？",
    stem: "66 歲男性，DKD G3b，足部感染住院後 2 週回診。傷口仍在換藥，近 10 天進食不到平常一半。他原本遵照低蛋白飲食 0.6 g/kg。",
    facts: ["168 cm／67.5 kg", "BMI 23.9", "3 個月前 70 kg", "6 個月前 70.5 kg", "eGFR 35", "HbA1c 9.0%", "白蛋白 3.1 g/dL（BCG）", "CRP 6.8 mg/dL", "HCO3 21 mmol/L", "握力 30 kg", "小腿圍 34.5 cm"],
    question: "現在算 PEW 嗎？低蛋白飲食要繼續嗎？",
    input: {
      basics: { age: "66", sex: "男", ckdStage: "G3b", height: "168", weight: "67.5" },
      patientAnswers: { appetite: 2, mealAmount: 2, skipMeals: 1, proteinFoods: 1, weightLoss: 1, muscleLoss: 0, function: 1, giSymptoms: 0, restriction: 0, infection: 2 },
      redFlags: ["lowIntakeOrInfection", "albuminAndSymptoms"],
      educatorFields: { egfr: "35", uacr: "180 mg/g", hba1c: "9", weightToday: "67.5", weight1m: "69", weight3m: "70", weight6m: "70.5", edema: "無", heartFailure: "否", recentHospital: "是", woundInfection: "是" },
      educatorRisks: ["neuropathy", "wound"],
      na: ["prealbumin", "proteinDialysis", "dryWeightLoss", "biaDxa", "arm", "fatLoss"],
      medicalChecks: [1, 5],
      notes: { albumin: "3.1 g/dL（BCG），感染期", crp: "6.8 mg/dL", bicarbonate: "21 mmol/L", intake50: "約 10 天" }
    },
    scenarios: [
      { label: "現在", yes: ["albumin", "intake50", "crp", "bicarbonate"], expect: { positive: 2, badge: "疑似 PEW", total: 3, support: 2 } },
      { label: "4 週後恢復（感染控制、進食恢復）", yes: [], expect: { positive: 0, badge: "目前未符合", total: 0, support: 0 } },
      { label: "4 週後未恢復（白蛋白仍低、體重續降達 5%、進食 <75%）", yes: ["albumin", "weightLoss3m", "intake75"], expect: { positive: 3, badge: "符合 DKD-PEW", total: 4, support: 0 } }
    ],
    expect: { patient: 10, flags: 2, patientBadge: "高風險", educator: 2, tier: "中", m3: -3.6, m6: -4.3, bmi: 23.9 },
    read: [
      "現在 2 類，工具顯示疑似。CRP 與 HCO3 再高、再低都不會把類別往上推，ISRNM 明言發炎指標不應列入診斷條件。",
      "ISRNM 建議每項條件最好在至少 3 個時間點記錄，間隔以 2-4 週為佳。急性期的單次數值不足以定論。",
      "體重 3 個月 −3.6%、6 個月 −4.3%，都還沒達標。",
      "工具把「急性感染單獨解釋」列為白蛋白的判讀提醒，這是本工具的謹慎做法；ISRNM 的不適用條件並未列感染。"
    ],
    plan: [
      "不必等到確診才介入：立刻處理進食不足、血糖與傷口。",
      "暫停低蛋白處方：KDIGO 指出代謝不穩定者不要使用低或極低蛋白飲食，並列舉活動性感染與住院期間等情境。",
      "HCO3 的處理目標見考題 17；是否用藥由醫師決定。",
      "工具建議 2-4 週內重評；出院後這段時間的體重、進食量都要記錄，才分得出上表兩種走向。"
    ],
    pitfall: "兩個方向都會錯：把急性期低白蛋白直接寫成 PEW，或因為「只是感染」就不介入。",
    src: ["isrnm", "kdigo", "kdoqi"]
  },
  {
    id: "glp1",
    tag: "刻意減重",
    title: "打 GLP-1 RA 瘦了 10%，工具跳提示了",
    stem: "59 歲女性，DKD G3a，肥胖。為血糖與體重開始使用 semaglutide，半年內瘦 8.5 kg，她很滿意。食量變小、偶有噁心，三日紀錄每日 1450 kcal、蛋白質 62 g。握力與起身都沒有退步。",
    facts: ["158 cm／76 kg", "BMI 30.4", "3 個月前 81 kg", "6 個月前 84.5 kg", "eGFR 52", "UACR 420 mg/g", "HbA1c 6.9%", "白蛋白 4.1 g/dL（BCG）", "握力 24 kg（與前次相近）", "5 次坐站 10 秒", "小腿圍 38 cm"],
    question: "衛教師頁跳出體重提示，營養師該勾體重類嗎？該不該停藥？",
    input: {
      basics: { age: "59", sex: "女", ckdStage: "G3a", height: "158", weight: "76" },
      patientAnswers: { appetite: 1, mealAmount: 2, skipMeals: 0, proteinFoods: 0, weightLoss: 0, muscleLoss: 0, function: 0, giSymptoms: 1, restriction: 0, infection: 0 },
      redFlags: [],
      educatorFields: { egfr: "52", uacr: "420 mg/g", hba1c: "6.9", weightToday: "76", weight1m: "77.5", weight3m: "81", weight6m: "84.5", edema: "無", heartFailure: "否", recentHospital: "否", woundInfection: "否" },
      educatorRisks: ["proteinuria"],
      na: ["prealbumin", "proteinDialysis", "dryWeightLoss", "biaDxa", "arm", "fatLoss", "crp", "bicarbonate"],
      medicalChecks: [6],
      notes: { weightLoss3m: "−6.2%，刻意減重（用藥），不計", weightLoss6m: "−10.1%，刻意減重（用藥），不計", energy: "約 19 kcal/kg/day，屬用藥下的預期攝取減少，不計", grip: "24 kg，與前次相近" }
    },
    scenarios: [
      { label: "正確判讀", yes: [], expect: { positive: 0, badge: "目前未符合", total: 0, support: 0 } },
      { label: "誤把刻意減重算陽性", yes: ["weightLoss3m", "weightLoss6m"], expect: { positive: 1, badge: "單一類別異常", total: 2, support: 0 } },
      { label: "追蹤時握力較前下降 >10%", yes: ["grip"], expect: { positive: 1, badge: "單一類別異常", total: 1, support: 0 } }
    ],
    expect: { patient: 4, flags: 0, patientBadge: "PEW 風險", educator: 1, tier: "中", m3: -6.2, m6: -10.1, bmi: 30.4, hints: 2 },
    read: [
      "ISRNM 的體重與攝取條件都限定「非刻意」。工具只會算百分比，看不出有沒有刻意，所以提示寫「若為非刻意」，要由人判讀。",
      "自填 4 分落在工具的「PEW 風險」，是食慾與進食量下降造成的，符合用藥預期；紅旗條件同樣限定非刻意。",
      "白蛋白、握力、坐站都正常，目前沒有任何類別陽性。",
      "沒有 PEW 不代表不必追蹤：本頁讀過的指引沒有 GLP-1 RA 使用者專屬的肌肉追蹤切點，只能用既有的握力、坐站趨勢觀察。"
    ],
    plan: [
      "不要因為工具提示就建議停藥：FLOW 試驗中 semaglutide 1.0 mg 每週一次使 T2D 合併 CKD 的主要腎臟疾病事件風險下降（HR 0.76）。藥物決定回到醫師。",
      "確認蛋白質與熱量的品質：62 g 約 0.82 g/kg，符合 KDIGO 0.8 g/kg 附近；噁心影響進食時回報。",
      "每次回診記錄握力與坐站；若握力較前下降 >10% 或出現非預期的持續下降，再進入 PEW 評估（第三列）。"
    ],
    pitfall: "工具提示不等於診斷。先問一句「這個體重下降是您想要的嗎？」",
    src: ["isrnm", "kdoqi", "kdigo", "flow", "awgs"]
  }
];

const TEACH_QUIZ = [
  { level: "基礎", stem: "ISRNM 2008 診斷 PEW 的規則是？", options: ["四大類至少 2 類，其中白蛋白必須同時異常", "四大類至少 3 類，每類至少 1 項異常", "四大類全部都要有至少 1 項異常才算", "任一類別內有 2 項以上異常即可診斷"], answer: 1, why: "表 1 註：至少 3 類，且所選類別內至少 1 項符合。白蛋白不是必要條件。", src: ["isrnm"] },
  { level: "基礎", stem: "ISRNM 的血清白蛋白切點（Bromcresol Green 法）是？", options: ["<3.8 g/dL", "<3.5 g/dL", "<3.0 g/dL", "<4.0 g/dL"], answer: 0, why: "ISRNM 為 <3.8 g/dL（BCG）。工具的紅旗條件另用 <3.5 作警訊，這個數字不是 ISRNM 的診斷切點。", src: ["isrnm"] },
  { level: "基礎", stem: "ISRNM 對 CRP 的定位是？", options: ["屬於生化類診斷條件之一", "升高即可單獨診斷 PEW", "可以取代白蛋白作為生化條件", "可作線索，但不列入診斷條件"], answer: 3, why: "ISRNM 指出 CRP 等發炎指標在 PEW 可能持續升高，但不應作為診斷條件。工具因此列為「輔助」不計分。", src: ["isrnm"] },
  { level: "基礎", stem: "ISRNM 的非刻意體重下降條件是？", options: ["1 個月 3% 或 3 個月 5%", "3 個月 3% 或 6 個月 5%", "3 個月 5% 或 6 個月 10%", "6 個月 5% 或 12 個月 10%"], answer: 2, why: "以無水腫體重計，3 個月 5% 或 6 個月 10%；任何程度的非刻意下降都應提高警覺。", src: ["isrnm"] },
  { level: "基礎", stem: "未透析 CKD 2-5 的 ISRNM 低蛋白攝取條件是？", options: ["<0.8 g/kg/day，至少 2 個月", "<0.6 g/kg/day，至少 1 個月", "<0.55 g/kg/day，至少 3 個月", "<0.6 g/kg/day，至少 2 個月"], answer: 3, why: "CKD 2-5 為 <0.6、透析為 <0.8 g/kg/day，都需非刻意且持續至少 2 個月。", src: ["isrnm"] },
  { level: "基礎", stem: "ISRNM 建議每項條件最好如何記錄？", options: ["至少 3 次，間隔以 2-4 週為佳", "至少 2 次，間隔以 3 個月為佳", "單次異常即可，不需要重複測量", "每週 1 次，連續 3 個月才算確定"], answer: 0, why: "表 1 註：最好在至少 3 個時間點記錄，間隔以 2-4 週為佳。急性期單次數值要特別保守。", src: ["isrnm"] },
  { level: "基礎", stem: "KDOQI 2020 對代謝穩定 CKD 1-5D 成人建議的熱量是？", options: ["20-25 kcal/kg/day", "30-40 kcal/kg/day", "25-35 kcal/kg/day", "35-45 kcal/kg/day"], answer: 2, why: "Statement 3.1.1：25-35 kcal/kg/day，依年齡、性別、活動量、體組成、CKD 分期與發炎狀況調整。", src: ["kdoqi"] },
  { level: "基礎", stem: "KDOQI 2020 對代謝穩定 HD/PD 成人建議的蛋白質是？", options: ["0.6-0.8 g/kg/day", "1.0-1.2 g/kg/day", "0.8-1.0 g/kg/day", "1.3-1.5 g/kg/day"], answer: 1, why: "Statement 3.0.3-3.0.4：有無糖尿病皆為 1.0-1.2 g/kg/day。", src: ["kdoqi"] },
  { level: "基礎", stem: "AWGS 2019 的低握力切點是？", options: ["男 <26 kg、女 <16 kg", "男 <30 kg、女 <20 kg", "男 <28 kg、女 <18 kg", "男 <28 kg、女 <20 kg"], answer: 2, why: "男 <28、女 <18 kg。這是亞洲肌少症切點，不是 ISRNM 的項目；工具把它放進肌肉類作臨床輔助。", src: ["awgs"] },
  { level: "基礎", stem: "病人自填 3 分，但勾了 1 項紅旗。工具的下一步是？", options: ["3 分未達門檻，例行追蹤", "1 週內住院評估", "直接判定符合 DKD-PEW", "即使總分不高，仍進一步評估"], answer: 3, why: "工具設定：任一紅旗都建議聯絡照護團隊或安排評估。4、7、11 分是本工具的分層設定，不是經驗證的切點。", src: [] },

  { level: "高階", stem: "DKD 病人 UACR 4200 mg/g、白蛋白 2.8 g/dL、食慾與進食正常。最合理的判讀是？", options: ["此白蛋白不適用於 PEW 條件，先處理蛋白尿", "白蛋白 <3.0，已足以診斷 PEW", "應提高蛋白質到 1.5 g/kg/day 補回白蛋白", "白蛋白低代表熱量不足，應先加熱量"], answer: 0, why: "ISRNM：大量尿蛋白流失造成的低白蛋白，此條件不適用。KDIGO 提醒進展風險者避免 >1.3 g/kg/day。", src: ["isrnm", "kdigo"] },
  { level: "高階", stem: "未透析 G4 病人前白蛋白 25 mg/dL，其他生化正常。生化類該如何判？", options: ["陽性，前白蛋白低於 30 mg/dL 就算達標", "陽性，因為 CKD 會使前白蛋白變得更敏感", "切點僅適用於維持性透析，不宜直接判陽性", "陰性，前白蛋白完全不屬於 ISRNM 的條件"], answer: 2, why: "ISRNM 註明此切點僅用於維持性透析，CKD 2-5 的前白蛋白會隨 GFR 變化。KDOQI 1.2.1 也提醒單一生化不可單獨解讀。", src: ["isrnm", "kdoqi"] },
  { level: "高階", stem: "台灣病人 BMI 22、體重長期穩定、肌力與攝取都正常。關於 BMI <23 的判讀，何者正確？", options: ["已符合體重類條件，應計入 1 類，並立刻開始營養介入治療", "低 BMI 在部分亞洲族群未必異常，單憑 BMI 不足判定", "KDOQI 認為 BMI <23 單獨即可確立 PEW，不必再看趨勢", "BMI 不應用於 CKD 病人，應一律改用體脂百分比判讀"], answer: 1, why: "ISRNM 提到東南亞等族群低 BMI 未必為病理。KDOQI 1.1.11：除非 <18，否則 BMI 單獨不足以判定 PEW。工具仍會將 <23 計入，判讀時要回看趨勢。", src: ["isrnm", "kdoqi"] },
  { level: "高階", stem: "糖尿病 DKD G4，熱量 21 kcal/kg、蛋白質 0.64 g/kg，持續 3 個月，非刻意少吃熱量。最該調整的是？", options: ["蛋白質再降到 0.55 g/kg 保護腎臟", "蛋白質先拉到 1.2 g/kg", "兩者都維持，只追蹤體重", "優先補足熱量，蛋白質目標與團隊確認"], answer: 3, why: "0.64 在 KDOQI 糖尿病 CKD 的 0.6-0.8 內；熱量低於 25-35。KDIGO 另建議 0.8 g/kg，並提醒衰弱與肌少症長者可考慮更高目標。", src: ["kdoqi", "kdigo", "isrnm"] },
  { level: "高階", stem: "未透析 CKD 病人因足部感染住院，平日低蛋白 0.6 g/kg。住院期間最符合 KDIGO 的做法是？", options: ["代謝不穩定時不使用低或極低蛋白處方", "維持原處方不變，避免感染期間腎功能進一步惡化", "改為極低蛋白飲食，並補充酮酸類似物以保護腎臟", "暫時完全不給蛋白質，等感染控制後再恢復"], answer: 0, why: "KDIGO PP 3.3.1.3：代謝不穩定者不要使用低或極低蛋白飲食；內文列舉活動性感染、住院等情境。", src: ["kdigo"] },
  { level: "高階", stem: "HD 病人符合 PEW，飲食諮詢後熱量與蛋白質仍不足。依 KDOQI 2020 的下一步是？", options: ["直接開始 IDPN，不必先試口服補充", "口服營養補充品，至少試用 3 個月", "先改用胺基酸透析液作為營養來源", "補充 omega-3 脂肪酸來改善營養狀態"], answer: 1, why: "4.1.1 口服營養補充品至少 3 個月 → 4.1.2 考慮管灌 → 4.1.3 仍不足時試用 IDPN。胺基酸透析液是 PD 的選項且不建議常規替換；KDOQI 的 omega-3 建議也不是針對營養狀態。", src: ["kdoqi"] },
  { level: "高階", stem: "CKD G4 病人 HCO3 20 mmol/L。關於兩份指引，何者正確？", options: ["兩份指引都明確要求維持在 ≥22 mmol/L 以上", "KDIGO 要求維持 24-26；KDOQI 則以 <18 作為治療門檻", "兩份指引都不建議使用鹼劑，只靠飲食調整即可", "KDOQI 認為維持 24-26 合理；KDIGO 舉例 <18 應避免"], answer: 3, why: "KDOQI 6.1.3（OPINION）24-26 mmol/L；KDIGO PP 3.10.1 舉例 <18，並提醒精確門檻尚待大型試驗。兩者不同，由團隊決定。工具的 <22 只用來標示病因因子。", src: ["kdoqi", "kdigo"] },
  { level: "高階", stem: "用 BIA 評估 PEW，何者符合 KDOQI 2020？", options: ["HD 當次結束後立刻量最準；未透析與 PD 也建議常規使用", "PD 病人首選 BIA；HD 因體液變動大而不建議使用", "HD 於透析結束至少 30 分鐘後量；未透析與 PD 證據不足", "未透析 CKD 應每月常規量 BIA；HD 則於透析開始前量"], answer: 2, why: "1.1.1：HD 建議用 BIA（以多頻為佳），於透析結束至少 30 分鐘後測量。1.1.2：CKD 1-5 與 PD 證據不足。", src: ["kdoqi"] },
  { level: "高階", stem: "白蛋白 3.6、握力低、進食量 <75% 超過 1 個月，但沒有體重下降，也沒算熱量與蛋白質。工具顯示 3 類。如何看？", options: ["工具達 3 類，但握力與進食比例非 ISRNM 原始項目，應補測", "工具顯示 3 類就等同 ISRNM 確診，不需要再補任何測量", "握力不在 ISRNM 內，工具結果應作廢，直接改判為未符合", "再補勾 CRP 與碳酸氫根，就能達到 ISRNM 要求的 3 類條件"], answer: 0, why: "工具為臨床使用把握力、小腿圍、坐站、進食比例放進類別，比 ISRNM 原始項目寬。要嚴格對應 ISRNM，需要肌肉量與 kcal/kg、g/kg。工具結果仍有臨床意義，不是作廢。", src: ["isrnm", "awgs"] },
  { level: "高階", stem: "使用 GLP-1 RA 的病人半年瘦 10%（本人想減重），衛教師頁跳出體重提示，肌力正常。最合適的是？", options: ["照提示勾選體重類，並請醫師停藥以免肌肉繼續流失", "體重類不計，因為是刻意減重；持續追蹤肌力與攝取", "體重下降這麼快代表藥物過量，應立即減量或改用其他藥", "刪除這段期間的體重紀錄，避免之後被工具誤判為陽性"], answer: 1, why: "ISRNM 的條件限定非刻意。工具提示只算百分比，需人工判讀。停藥與否回到醫師；FLOW 顯示 semaglutide 對 T2D 合併 CKD 有腎臟獲益。", src: ["isrnm", "flow"] }
];

const TEACH_MAP = {
  center: ["DKD-PEW", "ISRNM 2008"],
  branches: [
    { title: "診斷規則", color: "#11766d", leaves: ["四大類 ≥3 類，每類 ≥1 項", "最好 ≥3 次，間隔 2-4 週", "低白蛋白：非必要也非充分", "CRP：線索，不列入條件", "CKD 3-5 盛行率 11-54%；透析 IQR 28-54%"] },
    { title: "ISRNM 切點", color: "#28609b", leaves: ["生化：白蛋白 <3.8、膽固醇 <100", "前白蛋白 <30（僅透析）", "體重：BMI <23、體脂 <10%", "非刻意 −5%／3 月或 −10%／6 月", "肌肉量 −5%／3 月或 −10%／6 月", "上臂肌圍低於 P50 >10%", "攝取 ≥2 月：熱量 <25、蛋白 <0.6（透析 <0.8）"] },
    { title: "判讀陷阱", color: "#bb334f", leaves: ["尿或腸胃流失、肝病、降膽固醇藥：生化不適用", "水腫：用無水腫體重", "肥胖：BMI 高不排除 PEW", "亞洲族群：低 BMI 未必異常", "刻意減重：不計", "急性感染：重複測量再定論"] },
    { title: "本工具三張表", color: "#a86408", leaves: ["自填 0-20 分：4／7／11（工具設定）", "任一紅旗 → 進一步評估", "衛教師：≥3 高、1-2 中", "營養師：≥3 符合、2 疑似、1 單一類別", "CRP、HCO3、胃腸、過度限制：不計類別", "握力、小腿圍、坐站、進食比例：工具擴充項"] },
    { title: "營養目標", color: "#22734d", leaves: ["熱量 25-35 kcal/kg", "CKD 3-5 無糖尿病：0.55-0.60 g/kg", "CKD 3-5 糖尿病：0.6-0.8 g/kg", "KDIGO G3-G5：0.8；避免 >1.3", "HD/PD：1.0-1.2 g/kg", "代謝不穩定：不用低蛋白", "衰弱長者：考慮更高目標"] },
    { title: "介入階梯", color: "#5b4a9e", leaves: ["找病因：過度限制、胃腸、酸中毒、發炎", "飲食諮詢（營養師＋醫師）", "口服營養補充品 ≥3 個月", "管灌", "TPN（CKD 1-5）／IDPN（HD）", "體重追蹤：透析每月、G4-5 每 3 月、G1-3 每 6 月"] }
  ]
};
