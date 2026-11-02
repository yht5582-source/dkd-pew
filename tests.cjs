// node tests.cjs — scoring logic tests (no DOM)
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const store = {};
const ctx = vm.createContext({
  structuredClone, console,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }
});
for (const f of ["app-data.js", "app-utils.js", "app-render.js", "app-logic.js", "teach-content.js", "teach.js"]) {
  vm.runInContext(fs.readFileSync(`${__dirname}/${f}`, "utf8"), ctx, { filename: f });
}
const run = code => vm.runInContext(code, ctx);
const reset = () => run("state = structuredClone(defaultState)");

let n = 0;
function test(name, fn) { reset(); fn(); n += 1; }

test("empty patient form: score 0, 0 answered, low risk", () => {
  assert.strictEqual(run("patientScore()"), 0);
  assert.strictEqual(run("patientAnsweredCount()"), 0);
  assert.strictEqual(run("patientInterpretation(0,0).badge"), "低風險");
});
test("patient thresholds 4/7/11 and red flag", () => {
  assert.strictEqual(run("patientInterpretation(3,1).badge"), "有紅旗");
  assert.strictEqual(run("patientInterpretation(4,0).badge"), "PEW 風險");
  assert.strictEqual(run("patientInterpretation(4,1).badge"), "PEW 風險＋紅旗");
  assert.strictEqual(run("patientInterpretation(7,0).badge"), "高風險");
  assert.strictEqual(run("patientInterpretation(11,0).badge"), "極高風險");
});
test("answering 0 counts as answered", () => {
  run('state.patientAnswers = { appetite: 0, mealAmount: 2 }');
  assert.strictEqual(run("patientAnsweredCount()"), 2);
  assert.strictEqual(run("patientScore()"), 2);
});
test("CRP + bicarbonate alone do not make biochem category positive", () => {
  run('state.dietitian = { crp: true, bicarbonate: true }');
  const s = run("dietitianStats()");
  assert.strictEqual(s.positiveCount, 0);
  assert.strictEqual(s.total, 0);
  assert.strictEqual(s.supportCount, 2);
});
test("GI symptoms + over-restriction do not make intake positive", () => {
  run('state.dietitian = { giDiet: true, overRestrictionDiet: true }');
  assert.strictEqual(run("dietitianStats().positiveCount"), 0);
});
test("3 ISRNM categories → DKD-PEW", () => {
  run('state.dietitian = { albumin: true, weightLoss3m: true, grip: true, energy: false }');
  const s = run("dietitianStats()");
  assert.strictEqual(s.positiveCount, 3);
  assert.strictEqual(s.total, 4);
  assert.strictEqual(s.answered, 4);
  assert.strictEqual(run("dietitianInterpretation(dietitianStats()).badge"), "符合 DKD-PEW");
});
test("2 categories → suspected", () => {
  run('state.dietitian = { albumin: true, intake50: true }');
  assert.strictEqual(run("dietitianInterpretation(dietitianStats()).badge"), "疑似 PEW");
});
test("weight trend percentages", () => {
  run('state.educatorFields.weightToday = "57"; state.educatorFields.weight3m = "60"; state.educatorFields.weight6m = ""');
  const t = run("weightTrend()");
  assert.ok(Math.abs(t.m3 - (-5)) < 1e-9);
  assert.strictEqual(t.m6, null);
  assert.strictEqual(t.m1, null);
  assert.strictEqual(run("formatTrend(weightTrend().m3)"), "-5.0%");
  assert.strictEqual(run("formatTrend(2.345)"), "+2.3%");
});
test("weight trend ignores missing today weight", () => {
  run('state.educatorFields.weight3m = "60"');
  assert.strictEqual(run("weightTrend().m3"), null);
});
test("educator hints: eGFR, UACR, weight loss, edema", () => {
  run('Object.assign(state.educatorFields, { egfr: "25", uacr: "1,250 mg/g", weightToday: "54", weight6m: "60", edema: "明顯" })');
  const h = run("educatorHints()");
  assert.ok(h.some(x => x.includes("eGFR 25")));
  assert.ok(h.some(x => x.includes("UACR/UPCR 1250")));
  assert.ok(h.some(x => x.includes("6 個月體重下降 10.0%")));
  assert.ok(h.some(x => x.includes("乾體重")));
  assert.ok(!h.some(x => x.includes("3 個月")));
});
test("educator hints disappear once risk is checked", () => {
  run('state.educatorFields.egfr = "20"; state.educatorRisks.egfrLow = true');
  assert.strictEqual(run("educatorHints().length"), 0);
});
test("eGFR 30 is not <30; UACR 299 not flagged", () => {
  run('state.educatorFields.egfr = "30"; state.educatorFields.uacr = "299"');
  assert.strictEqual(run("educatorHints().length"), 0);
});
test("educator tiers", () => {
  assert.strictEqual(run("educatorRecommendation(0).tier"), "低");
  assert.strictEqual(run("educatorRecommendation(1).tier"), "中");
  assert.strictEqual(run("educatorRecommendation(3).tier"), "高");
});
test("BMI uses dry weight when given", () => {
  run('state.basics.height = "160"; state.basics.weight = "70"; state.basics.dryWeight = "64"');
  assert.ok(Math.abs(run("bmiValue()") - 25) < 1e-9);
});
test("summary basics fields get unique ids", () => {
  const a = run('fieldMarkup(basicFields[0], "basics")');
  const b = run('fieldMarkup(basicFields[0], "basics", "summary-basics")');
  assert.ok(a.includes('id="basics-name"') && b.includes('id="summary-basics-name"'));
});
test("saveState survives a throwing localStorage", () => {
  run('const orig = localStorage.setItem; localStorage.setItem = () => { throw new Error("quota"); }; saveState(); localStorage.setItem = orig;');
});
test("every supportive item is marked and non-main", () => {
  const ids = run("dietitianItems.filter(i => i.support).map(i => i.id)");
  assert.deepStrictEqual([...ids].sort(), ["bicarbonate", "crp", "giDiet", "overRestrictionDiet"]);
  assert.ok(run("dietitianItems.filter(i => i.support).every(i => !i.main)"));
});

// 教學內容：病例 expect 對引擎、題庫結構
const close1 = (actual, expected, label) => assert.ok(actual !== null && Math.abs(actual - expected) < 0.051, `${label}: ${actual} vs ${expected}`);
const cases = run("TEACH_CASES");
const quiz = run("TEACH_QUIZ");
const sources = run("Object.keys(TEACH_SOURCES)");
test("6 cases with unique ids and valid field ids", () => {
  assert.strictEqual(cases.length, 6);
  assert.strictEqual(new Set(cases.map(c => c.id)).size, 6);
  const dietIds = run("dietitianItems.map(i => i.id)");
  const riskIds = run("educatorRisks.map(i => i.id)");
  const flagIds = run("redFlagItems.map(i => i.id)");
  const questionIds = run("patientQuestions.map(q => q.id)");
  const medicalCount = run("medicalChecks.length");
  for (const c of cases) {
    assert.deepStrictEqual(Object.keys(c.input.patientAnswers).sort(), [...questionIds].sort(), c.id);
    c.input.educatorRisks.forEach(id => assert.ok(riskIds.includes(id), id));
    c.input.redFlags.forEach(id => assert.ok(flagIds.includes(id), id));
    c.input.na.forEach(id => assert.ok(dietIds.includes(id), id));
    Object.keys(c.input.notes).forEach(id => assert.ok(dietIds.includes(id), id));
    c.input.medicalChecks.forEach(i => assert.ok(i < medicalCount));
    c.src.forEach(key => assert.ok(sources.includes(key), key));
    assert.ok(c.scenarios.length >= 2);
    for (const s of c.scenarios) {
      s.yes.forEach(id => assert.ok(dietIds.includes(id), id));
      s.yes.forEach(id => assert.ok(!c.input.na.includes(id), `${c.id} ${id} in both yes and na`));
    }
  }
});
for (const c of cases) {
  c.scenarios.forEach((s, i) => {
    test(`case ${c.id} / ${s.label} matches engine`, () => {
      const r = run(`evaluateCase(TEACH_CASES.find(c => c.id === "${c.id}"), TEACH_CASES.find(c => c.id === "${c.id}").scenarios[${i}])`);
      assert.strictEqual(r.positive, s.expect.positive);
      assert.strictEqual(r.badge, s.expect.badge);
      assert.strictEqual(r.total, s.expect.total);
      assert.strictEqual(r.support, s.expect.support);
      assert.strictEqual(r.patient, c.expect.patient);
      assert.strictEqual(r.flags, c.expect.flags);
      assert.strictEqual(r.patientBadge, c.expect.patientBadge);
      assert.strictEqual(r.educator, c.expect.educator);
      assert.strictEqual(r.tier, c.expect.tier);
      close1(r.bmi, c.expect.bmi, "bmi");
      close1(r.trend.m3, c.expect.m3, "m3");
      if (c.expect.m6 === null) assert.strictEqual(r.trend.m6, null);
      else close1(r.trend.m6, c.expect.m6, "m6");
      if (c.expect.hints !== undefined) assert.strictEqual(r.hints, c.expect.hints);
    });
  });
}
test("evaluateCase leaves the live state untouched", () => {
  run('state.basics.name = "real"; evaluateCase(TEACH_CASES[0], TEACH_CASES[0].scenarios[0])');
  assert.strictEqual(run("state.basics.name"), "real");
  assert.strictEqual(run("state.demoCase"), undefined);
});
test("hasUserData: clean state and demo state do not prompt; real data does", () => {
  assert.strictEqual(run("hasUserData()"), false);
  run("state = buildCaseState(TEACH_CASES[0], TEACH_CASES[0].scenarios[0])");
  assert.strictEqual(run("hasUserData()"), false);
  reset();
  run('state.basics.age = "70"');
  assert.strictEqual(run("hasUserData()"), true);
});
test("quiz: 20 questions, 10 + 10, A-D 5 each, valid sources", () => {
  assert.strictEqual(quiz.length, 20);
  assert.strictEqual(quiz.filter(q => q.level === "基礎").length, 10);
  assert.strictEqual(quiz.filter(q => q.level === "高階").length, 10);
  for (let a = 0; a < 4; a += 1) assert.strictEqual(quiz.filter(q => q.answer === a).length, 5);
  for (const q of quiz) {
    assert.strictEqual(q.options.length, 4);
    assert.strictEqual(new Set(q.options).size, 4);
    assert.ok(q.why.length > 0);
    q.src.forEach(key => assert.ok(sources.includes(key), key));
  }
});
test("quiz: the correct option is rarely the longest", () => {
  // 只算「唯一最長」；等長的數字選項不會洩題
  const longest = quiz.filter(q => q.options.every((o, i) => i === q.answer || o.length < q.options[q.answer].length));
  assert.ok(longest.length <= 5,`${longest.length} of 20: ${longest.map(q => q.stem.slice(0, 12)).join(" | ")}`);
});
test("quiz item 10 agrees with the engine", () => {
  assert.strictEqual(run("patientInterpretation(3,1).next"), "進一步評估");
});
test("quiz item 19: tool counts 3 categories for albumin + grip + intake75", () => {
  run('state.dietitian = { albumin: true, grip: true, intake75: true }');
  assert.strictEqual(run("dietitianStats().positiveCount"), 3);
});
test("the same weight loss counts once in the total but stays one category", () => {
  run('state.dietitian = { weightLoss3m: true, weightLoss6m: true, dryWeightLoss: true }');
  const s = run("dietitianStats()");
  assert.strictEqual(s.total, 2);
  assert.strictEqual(s.positiveCount, 1);
  assert.strictEqual(run("dietitianItemScores().weightLoss3m"), 2);
  assert.strictEqual(run("dietitianItemScores().dryWeightLoss"), 0);
});
test("weight hints say the criterion applies only if unintentional", () => {
  run('Object.assign(state.educatorFields, { weightToday: "54", weight3m: "60", weight6m: "60" })');
  const h = run("educatorHints()");
  assert.strictEqual(h.length, 2);
  assert.ok(h.every(x => x.includes("若為非刻意") && x.includes("刻意減重不計")));
});
test("non-ISRNM items are labelled as tool extensions", () => {
  const ids = run("dietitianItems.filter(i => i.extended).map(i => i.id)");
  assert.deepStrictEqual([...ids].sort(), ["calf", "clinicalWasting", "grip", "intake50", "intake75", "sitStand"]);
  assert.ok(run('renderDietitianRows.toString()').includes("工具擴充"));
});
test("albumin <3.5 is no longer described as more specific; cut-offs are labelled", () => {
  const text = run("JSON.stringify([dietitianItems, referenceItems])");
  assert.ok(!text.includes("更具特異性"));
  assert.ok(!text.includes("臨床常用"));
  assert.ok(text.includes("本工具設定（未經驗證）"));
});
test("map: 6 branches, each with leaves", () => {
  const branches = run("TEACH_MAP.branches");
  assert.strictEqual(branches.length, 6);
  branches.forEach(b => assert.ok(b.leaves.length >= 4));
});
console.log(`${n} tests passed`);
