    function patientScore() {
      return patientQuestions.reduce((sum, q) => sum + numberValue(state.patientAnswers[q.id]), 0);
    }

    function redFlagCount() {
      return redFlagItems.reduce((sum, item) => sum + (state.redFlags[item.id] ? 1 : 0), 0);
    }

    function educatorScore() {
      return educatorRisks.reduce((sum, item) => sum + (state.educatorRisks[item.id] ? 1 : 0), 0);
    }

    function dietitianStats() {
      const categoryScores = {};
      let total = 0;
      for (const item of dietitianItems) {
        const score = state.dietitian[item.id] === true ? item.score : 0;
        total += score;
        categoryScores[item.category] = (categoryScores[item.category] || 0) + score;
      }
      const categories = ["生化", "體重/脂肪", "肌肉量/肌力", "飲食攝取"].map(category => ({
        category,
        score: categoryScores[category] || 0,
        positive: (categoryScores[category] || 0) >= 1
      }));
      return {
        total,
        categories,
        positiveCount: categories.filter(c => c.positive).length
      };
    }

    function bmiValue() {
      const h = numberValue(state.basics.height);
      const w = numberValue(state.basics.dryWeight || state.basics.weight);
      if (!h || !w) return null;
      return w / ((h / 100) ** 2);
    }

    function patientInterpretation(score, flags) {
      if (score >= 11) {
        return {
          badge: "極高風險",
          kind: "rose",
          statusClass: "status-high",
          text: "極高風險：1 週內進一步評估",
          action: "建議 1 週內聯絡照護團隊，並確認感染、發炎、水腫或近期住院因素。",
          next: "1 週內進一步評估"
        };
      }
      if (score >= 7) {
        return {
          badge: "高風險",
          kind: "rose",
          statusClass: "status-high",
          text: "高風險：建議進一步評估",
          action: "建議安排進一步營養照護評估，2-4 週內追蹤攝取量、體重與肌力變化。",
          next: "進一步評估"
        };
      }
      if (score >= 4) {
        return {
          badge: flags > 0 ? "PEW 風險＋紅旗" : "PEW 風險",
          kind: flags > 0 ? "amber" : "blue",
          statusClass: "status-risk",
          text: "PEW 風險：建議追蹤評估",
          action: flags > 0 ? "已有紅旗，建議聯絡照護團隊或安排進一步評估。" : "建議追蹤飲食、體重與活動力變化。",
          next: flags > 0 ? "進一步評估" : "追蹤評估"
        };
      }
      if (flags > 0) {
        return {
          badge: "有紅旗",
          kind: "amber",
          statusClass: "status-risk",
          text: "有紅旗：建議進一步評估",
          action: "即使總分不高，任一紅旗仍建議聯絡照護團隊或安排進一步評估。",
          next: "進一步評估"
        };
      }
      return {
        badge: "低風險",
        kind: "",
        statusClass: "status-low",
        text: "低風險：例行追蹤",
        action: "若食慾、體重或活動力變差，請提前回報照護團隊。",
        next: "例行追蹤"
      };
    }

    function educatorRecommendation(dkdScore) {
      if (dkdScore >= 3) {
        return {
          badge: "高風險",
          kind: "rose",
          text: "DKD 風險因子偏高",
          action: "建議安排進一步營養評估，並確認水腫、蛋白尿、感染或飲食限制是否影響判讀。",
          tier: "高",
          need: "進一步營養評估"
        };
      }
      if (dkdScore >= 1) {
        return {
          badge: "中等風險",
          kind: "amber",
          text: "DKD 風險因子需追蹤",
          action: "建議 1 個月內複評；若水腫、體重下降、攝取不足或照護資源問題變明顯，可安排營養評估。",
          tier: "中",
          need: "追蹤或評估"
        };
      }
      return {
        badge: "例行追蹤",
        kind: "",
        text: "例行追蹤",
        action: "若 DKD 風險因子增加，請提早複評或安排進一步營養評估。",
        tier: "低",
        need: "例行追蹤"
      };
    }

    function dietitianInterpretation(stats) {
      if (stats.positiveCount >= 3) {
        return {
          badge: "符合 DKD-PEW",
          kind: "rose",
          text: "符合 DKD-PEW：高專一性判定",
          action: "建議營養介入並與醫師共同評估可逆因素，2-4 週內追蹤。"
        };
      }
      if (stats.positiveCount === 2) {
        return {
          badge: "疑似 PEW",
          kind: "amber",
          text: "疑似 PEW：2-4 週內重評與介入",
          action: "建議先處理攝取不足、發炎或過度飲食限制，2-4 週內重評。"
        };
      }
      if (stats.positiveCount === 1) {
        return {
          badge: "單一類別異常",
          kind: "blue",
          text: "單一類別異常：追蹤並找原因",
          action: "請追蹤變化趨勢，並確認是否受蛋白尿、水腫、感染或藥物影響。"
        };
      }
      return {
        badge: "目前未符合",
        kind: "",
        text: "目前未符合 PEW",
        action: "請依臨床情境追蹤攝取量、體重與肌肉/肌力變化。"
      };
    }

    function updateAll() {
      const pScore = patientScore();
      const pFlags = redFlagCount();
      const p = patientInterpretation(pScore, pFlags);
      const eScore = educatorScore();
      const e = educatorRecommendation(eScore);
      const dStats = dietitianStats();
      const d = dietitianInterpretation(dStats);
      const bmi = bmiValue();

      setText("patientScore", pScore);
      setText("patientRedFlagCount", pFlags);
      setText("bmiResult", bmi ? `${bmi.toFixed(1)} kg/m²` : "未填寫");
      setText("patientInterpretation", p.text);
      setText("patientAction", p.action);
      setText("patientNextStep", p.next);
      setBadge("patientLevel", p.badge, p.kind);
      setMeter("patientMeter", Math.min(pScore / 20, 1), pScore >= 7 || pFlags ? "high" : pScore >= 4 ? "risk" : "");

      setText("educatorScore", eScore);
      setText("educatorRecommendation", e.text);
      setText("educatorAction", e.action);
      setText("educatorRiskTier", e.tier);
      setText("educatorCareNeed", e.need);
      setBadge("educatorLevel", e.badge, e.kind);
      setMeter("educatorMeter", Math.min(eScore / 10, 1), eScore >= 3 ? "high" : eScore >= 1 ? "risk" : "");

      setText("categoryPositiveCount", dStats.positiveCount);
      setText("dietitianInterpretation", d.text);
      setText("dietitianAction", d.action);
      setText("dietitianTotalScore", dStats.total);
      setBadge("dietitianLevel", d.badge, d.kind);
      setMeter("dietitianMeter", Math.min(dStats.positiveCount / 4, 1), dStats.positiveCount >= 3 ? "high" : dStats.positiveCount >= 2 ? "risk" : "");
      updateDietitianTableScores();
      renderCategorySummary(dStats);

      setBadge("finalBadge", "獨立評估", "blue");
      setText("finalClassification", "三份評估各自成立");
      setText("finalAction", "病人自填、衛教師評估、營養師評估可分別使用；摘要頁不產生因果式結論。");
      renderSummaryRows(pScore, pFlags, p, eScore, e, dStats, d);
      updateCategorySummaryIds(dStats);

      saveState();
    }

    function setMeter(id, ratio, className) {
      const el = byId(id);
      if (!el) return;
      el.style.width = `${Math.max(4, ratio * 100)}%`;
      el.className = className;
    }

    function updateDietitianTableScores() {
      for (const item of dietitianItems) {
        const cell = document.querySelector(`[data-score-for="${item.id}"]`);
        if (cell) cell.textContent = state.dietitian[item.id] === true ? item.score : 0;
      }
    }

    function renderCategorySummary(stats) {
      byId("categorySummary").innerHTML = stats.categories.map(item => `
        <div class="summary-item">
          <span>${escapeHtml(item.category)}</span>
          <strong class="${item.positive ? "status-high" : "status-low"}">${item.positive ? "陽性" : "陰性"} (${item.score} 分)</strong>
        </div>
      `).join("");
    }

    function updateCategorySummaryIds(stats) {
      const map = {
        "生化": "sumBio",
        "體重/脂肪": "sumWeight",
        "肌肉量/肌力": "sumMuscle",
        "飲食攝取": "sumIntake"
      };
      for (const item of stats.categories) {
        const el = byId(map[item.category]);
        if (!el) continue;
        el.textContent = item.positive ? "陽性" : "陰性";
        el.className = item.positive ? "status-high" : "status-low";
      }
    }

    function renderSummaryRows(pScore, pFlags, p, eScore, e, dStats, d) {
      const nutritionTotalText = dStats.total >= 7 ? "高度可能 PEW" : dStats.total >= 5 ? "疑似 PEW" : dStats.total >= 3 ? "輕度風險" : "低風險";
      const rows = [
        ["病人自填", "總分", `${pScore} / 20`, p.text, p.next, pScore >= 7 ? "2-4 週內" : pScore >= 4 ? "1 個月內" : "例行"],
        ["病人自填", "紅旗數", `${pFlags}`, pFlags >= 1 ? "有紅旗" : "無紅旗", pFlags >= 1 ? "聯絡照護團隊" : "例行追蹤", pFlags >= 1 ? "儘快" : "例行"],
        ["衛教師評估", "DKD 風險因子", `${eScore} / 10`, e.text, e.need, eScore >= 3 ? "儘快或依院內流程" : eScore >= 1 ? "1 個月內" : "例行"],
        ["營養師確認", "四大類陽性數", `${dStats.positiveCount} / 4`, d.text, d.action, dStats.positiveCount >= 2 ? "2-4 週內" : "依病況"],
        ["營養師確認", "PEW 總分", `${dStats.total}`, nutritionTotalText, "依營養師處方追蹤", "依病況"]
      ];
      byId("summaryRows").innerHTML = rows.map(row => `
        <tr>
          <td>${escapeHtml(row[0])}</td>
          <td>${escapeHtml(row[1])}</td>
          <td><strong>${escapeHtml(row[2])}</strong></td>
          <td>${escapeHtml(row[3])}</td>
          <td>${escapeHtml(row[4])}</td>
          <td>${escapeHtml(row[5])}</td>
        </tr>
      `).join("");
    }

    function attachListeners() {
      document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
          const target = tab.dataset.tab;
          document.querySelectorAll(".tab").forEach(t => t.setAttribute("aria-selected", String(t === tab)));
          document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("active", panel.id === target));
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });

      document.addEventListener("input", event => {
        const target = event.target;
        if (target.matches("[data-section][data-key]")) {
          state[target.dataset.section][target.dataset.key] = target.value;
          syncDuplicateBasicFields(target.dataset.key, target.value, target.id);
          updateAll();
        }
        if (target.matches("[data-state]")) {
          state[target.dataset.state] = target.value;
          updateAll();
        }
        if (target.matches("[data-diet-note]")) {
          state.dietitianNotes[target.dataset.dietNote] = target.value;
          updateAll();
        }
      });

      document.addEventListener("change", event => {
        const target = event.target;
        if (target.matches("[data-patient-id]")) {
          state.patientAnswers[target.dataset.patientId] = Number(target.value);
          updateAll();
        }
        if (target.matches("[data-red-flag]")) {
          state.redFlags[target.dataset.redFlag] = target.checked;
          updateAll();
        }
        if (target.matches("[data-educator-risk]")) {
          state.educatorRisks[target.dataset.educatorRisk] = target.checked;
          updateAll();
        }
        if (target.matches("[data-diet-id]")) {
          state.dietitian[target.dataset.dietId] = target.value === "yes";
          updateAll();
        }
        if (target.matches("[data-medical-check]")) {
          state.medicalChecks[target.dataset.medicalCheck] = target.checked;
          updateAll();
        }
      });

      byId("printBtn").addEventListener("click", () => window.print());
      byId("resetBtn").addEventListener("click", () => {
        const ok = confirm("確定要清除本頁已填資料？");
        if (!ok) return;
        localStorage.removeItem(STORAGE_KEY);
        state = structuredClone(defaultState);
        init();
      });
    }

    function syncDuplicateBasicFields(key, value, originId) {
      document.querySelectorAll(`[data-section="basics"][data-key="${key}"]`).forEach(input => {
        if (input.id !== originId) input.value = value;
      });
    }

    function init() {
      renderBasicFields();
      renderEducatorFields();
      renderPatientQuestions();
      renderRedFlags();
      renderEducatorRisks();
      renderDietitianRows();
      renderMedicalChecks();
      renderReferences();

      const educatorNote = byId("educatorNote");
      if (educatorNote) educatorNote.value = state.educatorNote || "";
      const advice = byId("dietitianAdvice");
      if (advice) advice.value = state.dietitianAdvice || "";
      const followUp = byId("nextFollowUp");
      if (followUp) followUp.value = state.nextFollowUp || "";

      updateAll();
    }

    attachListeners();
    init();
