// node tests.cjs — scoring logic tests (no DOM)
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const store = {};
const ctx = vm.createContext({
  structuredClone, console,
  localStorage: { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } }
});
for (const f of ["app-data.js", "app-utils.js", "app-render.js", "app-logic.js"]) {
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
console.log(`${n} tests passed`);
