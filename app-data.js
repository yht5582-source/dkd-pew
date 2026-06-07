const STORAGE_KEY = "dkd-pew-assessment-v1";

    const defaultState = {
      basics: {
        name: "",
        mrn: "",
        date: "",
        respondent: "",
        age: "",
        sex: "",
        ckdStage: "",
        dialysis: "否",
        height: "",
        weight: "",
        dryWeight: ""
      },
      patientAnswers: {},
      redFlags: {},
      educatorFields: {
        egfr: "",
        uacr: "",
        hba1c: "",
        dialysisDryWeight: "",
        weightToday: "",
        weight1m: "",
        weight3m: "",
        weight6m: "",
        edema: "",
        heartFailure: "",
        recentHospital: "",
        woundInfection: ""
      },
      educatorRisks: {},
      educatorNote: "",
      dietitian: {},
      dietitianNotes: {},
      medicalChecks: {},
      dietitianAdvice: "",
      nextFollowUp: ""
    };
    const patientQuestions = [
      { id: "appetite", title: "最近 1 個月食慾", choices: ["正常", "稍差", "明顯變差，常吃不下"] },
      { id: "mealAmount", title: "最近 1 個月每餐進食量", choices: ["幾乎正常", "約少 1/4", "少 1/3 以上"] },
      { id: "skipMeals", title: "最近 1 個月是否常跳餐", choices: ["沒有", "每週 1-2 次", "每週 ≥3 次"] },
      { id: "proteinFoods", title: "肉、魚、蛋、豆腐、奶類攝取", choices: ["每天都有", "不是每天", "幾乎很少吃"] },
      { id: "weightLoss", title: "最近 3 個月體重變化，非刻意減重", choices: ["沒變或增加", "減少 1-3 kg", "減少 >3 kg 或衣服明顯變鬆"] },
      { id: "muscleLoss", title: "最近是否覺得肌肉變少、手腳變細", choices: ["沒有", "有一點", "明顯"] },
      { id: "function", title: "走路、爬樓梯、起身是否比以前吃力", choices: ["沒有", "稍微", "明顯變差"] },
      { id: "giSymptoms", title: "噁心、嘔吐、腹瀉、便祕、味覺改變", choices: ["沒有", "偶爾", "常常影響進食"] },
      { id: "restriction", title: "因怕血糖、鉀、磷、蛋白而不敢吃", choices: ["沒有", "有時候", "常常，吃得很少"] },
      { id: "infection", title: "最近 1 個月住院、感染、傷口、足部潰瘍、發炎", choices: ["沒有", "有輕微", "有明顯或需治療"] }
    ];

    const redFlagItems = [
      { id: "weightLoss5", title: "體重下降", text: "3 個月內非刻意體重下降 ≥5% 或 6 個月 ≥10%" },
      { id: "lowIntakeOrInfection", title: "攝取不足或發炎", text: "連續 1 週吃不到平常一半；或住院、感染、足部潰瘍、壓瘡" },
      { id: "albuminAndSymptoms", title: "白蛋白合併症狀", text: "血清白蛋白 <3.5 g/dL 合併食慾差、體重下降、發炎或肌肉流失" },
      { id: "muscleStrength", title: "肌力或 nPCR/nPNA", text: "明顯肌力下降、肌肉萎縮、透析患者 nPCR/nPNA 持續偏低" }
    ];

    const basicFields = [
      { id: "name", label: "姓名", type: "text" },
      { id: "mrn", label: "病歷號", type: "text" },
      { id: "date", label: "日期", type: "date" },
      { id: "respondent", label: "填寫者", type: "select", options: ["", "本人", "家屬", "照護者"] },
      { id: "age", label: "年齡", type: "number", min: 0 },
      { id: "sex", label: "性別", type: "select", options: ["", "女", "男", "其他/未填"] },
      { id: "ckdStage", label: "DKD/CKD 分期", type: "select", options: ["", "G1", "G2", "G3a", "G3b", "G4", "G5", "透析"] },
      { id: "dialysis", label: "透析", type: "select", options: ["否", "HD", "PD"] },
      { id: "height", label: "身高 cm", type: "number", min: 0, step: "0.1" },
      { id: "weight", label: "目前體重 kg", type: "number", min: 0, step: "0.1" },
      { id: "dryWeight", label: "乾體重 kg", type: "number", min: 0, step: "0.1" }
    ];

    const educatorFields = [
      { id: "egfr", label: "eGFR", type: "number", step: "0.1" },
      { id: "uacr", label: "UACR/UPCR", type: "text" },
      { id: "hba1c", label: "HbA1c", type: "number", step: "0.1" },
      { id: "dialysisDryWeight", label: "透析/乾體重", type: "text" },
      { id: "weightToday", label: "今日體重 kg", type: "number", step: "0.1" },
      { id: "weight1m", label: "1 個月前 kg", type: "number", step: "0.1" },
      { id: "weight3m", label: "3 個月前 kg", type: "number", step: "0.1" },
      { id: "weight6m", label: "6 個月前 kg", type: "number", step: "0.1" },
      { id: "edema", label: "水腫", type: "select", options: ["", "無", "輕微", "明顯"] },
      { id: "heartFailure", label: "心衰/腹水", type: "select", options: ["", "否", "是"] },
      { id: "recentHospital", label: "近期住院", type: "select", options: ["", "否", "是"] },
      { id: "woundInfection", label: "足部傷口/感染", type: "select", options: ["", "否", "是"] }
    ];

    const educatorRisks = [
      { id: "egfrLow", title: "eGFR <30 ml/min/1.73m²", text: "晚期 CKD 風險增加" },
      { id: "proteinuria", title: "UACR ≥300 mg/g 或明顯蛋白尿", text: "白蛋白下降需小心解讀" },
      { id: "rapidDecline", title: "近期快速腎功能惡化", text: "尿毒症症狀可能惡化" },
      { id: "glucoseIssue", title: "HbA1c 過高或反覆低血糖導致飲食受限", text: "飲食限制過度常見" },
      { id: "gastroparesis", title: "糖尿病胃輕癱、噁心、早飽", text: "直接造成攝取不足" },
      { id: "neuropathy", title: "周邊神經病變造成活動量下降", text: "肌少症風險" },
      { id: "wound", title: "足部潰瘍、感染或慢性傷口", text: "發炎與分解代謝" },
      { id: "heartFailure", title: "心衰竭或反覆水腫", text: "體重可能被水分掩蓋" },
      { id: "overRestriction", title: "低蛋白飲食執行過度，熱量不足", text: "DKD 常見可逆因素" },
      { id: "social", title: "獨居、牙口差、經濟或照護問題", text: "社會/照護風險" }
    ];

    const dietitianItems = [
      { id: "albumin", category: "生化", indicator: "Serum albumin", criteria: "<3.8 g/dL；<3.5 g/dL 更具特異性", score: 1, main: true, reminder: "排除大量蛋白尿、肝病、急性感染單獨解釋" },
      { id: "prealbumin", category: "生化", indicator: "Prealbumin / transthyretin", criteria: "<30 mg/dL，若可取得", score: 1, main: false },
      { id: "cholesterol", category: "生化", indicator: "Total cholesterol", criteria: "<100 mg/dL，且非降脂藥造成", score: 1, main: false },
      { id: "crp", category: "生化", indicator: "CRP 升高", criteria: "支持發炎/病因因子", score: 1, main: false },
      { id: "bicarbonate", category: "生化", indicator: "Bicarbonate", criteria: "<22 mmol/L，支持代謝酸中毒風險", score: 1, main: false },
      { id: "weightLoss3m", category: "體重/脂肪", indicator: "非刻意體重下降", criteria: "3 個月 ≥5%", score: 2, main: true, reminder: "水腫/心衰者請用乾體重或去水腫後體重" },
      { id: "weightLoss6m", category: "體重/脂肪", indicator: "非刻意體重下降", criteria: "6 個月 ≥10%", score: 2, main: true },
      { id: "bmiLow", category: "體重/脂肪", indicator: "BMI", criteria: "<23 kg/m² 亞洲 DKD 可提高警覺", score: 1, main: false },
      { id: "fatLoss", category: "體重/脂肪", indicator: "體脂明顯下降", criteria: "皮下脂肪下降、衣服變鬆", score: 1, main: false },
      { id: "dryWeightLoss", category: "體重/脂肪", indicator: "透析患者乾體重下降", criteria: "≥5% / 3 個月", score: 2, main: true },
      { id: "calf", category: "肌肉量/肌力", indicator: "小腿圍", criteria: "男 <34 cm；女 <33 cm 或較前下降", score: 1, main: true, reminder: "肥胖型 PEW 需特別看肌肉與肌力" },
      { id: "arm", category: "肌肉量/肌力", indicator: "上臂圍 / 上臂肌圍", criteria: "低於同齡族群或連續下降", score: 1, main: false },
      { id: "grip", category: "肌肉量/肌力", indicator: "握力", criteria: "男 <28 kg；女 <18 kg 或較前下降 >10%", score: 1, main: true },
      { id: "sitStand", category: "肌肉量/肌力", indicator: "5 次坐站測試", criteria: ">12 秒或明顯變慢", score: 1, main: false },
      { id: "biaDxa", category: "肌肉量/肌力", indicator: "BIA / DXA 肌肉量", criteria: "低肌肉量", score: 2, main: true },
      { id: "clinicalWasting", category: "肌肉量/肌力", indicator: "臨床肌肉萎縮", criteria: "顳肌、鎖骨、肩胛、股四頭肌萎縮", score: 1, main: false },
      { id: "energy", category: "飲食攝取", indicator: "熱量攝取", criteria: "<25 kcal/kg/day 持續 ≥1-2 週", score: 1, main: true, reminder: "低蛋白飲食不能犧牲足夠熱量" },
      { id: "proteinCkd", category: "飲食攝取", indicator: "蛋白質攝取，非透析 CKD", criteria: "明顯低於醫囑，且熱量不足", score: 1, main: false },
      { id: "proteinDialysis", category: "飲食攝取", indicator: "蛋白質攝取，HD / PD", criteria: "<1.0 g/kg/day 或 nPCR/nPNA 偏低", score: 1, main: false },
      { id: "intake75", category: "飲食攝取", indicator: "進食量", criteria: "<平常 75% 持續 ≥1 個月", score: 1, main: true },
      { id: "intake50", category: "飲食攝取", indicator: "進食量", criteria: "<平常 50% 持續 ≥1 週", score: 2, main: true },
      { id: "giDiet", category: "飲食攝取", indicator: "胃腸症狀", criteria: "噁心、嘔吐、早飽、腹瀉、便祕影響進食", score: 1, main: false },
      { id: "overRestrictionDiet", category: "飲食攝取", indicator: "過度飲食限制", criteria: "因怕糖、鉀、磷、蛋白而長期吃太少", score: 1, main: false }
    ];

    const medicalChecks = [
      "大量蛋白尿",
      "感染/CRP 高",
      "心衰/水腫",
      "肝病",
      "腫瘤",
      "代謝酸中毒",
      "藥物或胃腸副作用"
    ];

    const referenceItems = [
      { title: "Albumin", body: "<3.8 g/dL 警覺；<3.5 g/dL 更具特異性。大量蛋白尿、水腫、肝病、感染會干擾，不可單獨診斷。" },
      { title: "CRP", body: "升高支持發炎或疾病負擔，足部傷口、感染、住院後常見。" },
      { title: "非刻意體重下降", body: "3 個月 ≥5% 或 6 個月 ≥10%。水腫者用乾體重或去水腫後體重。" },
      { title: "小腿圍", body: "男 <34 cm；女 <33 cm 或較前下降。肥胖型 PEW 更需要量測。" },
      { title: "握力", body: "男 <28 kg；女 <18 kg 或較前下降 >10%。糖尿病神經病變、關節病變需註記。" },
      { title: "進食量", body: "<75% 持續 ≥1 月；<50% 持續 ≥1 週。過度限糖、限鉀、限磷、限蛋白常見。" },
      { title: "透析蛋白質攝取", body: "HD/PD <1.0 g/kg/day 或 nPCR/nPNA 低時需提高警覺，並與磷、鉀、發炎共同評估。" },
      { title: "DKD-PEW", body: "四大類中 ≥3 類陽性較支持 PEW；避免只依 albumin 或 BMI 判讀。" }
    ];
