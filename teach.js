    const QUIZ_LETTERS = ["A", "B", "C", "D"];
    const quizState = { filter: "全部", answers: new Map() };

    function buildCaseState(item, scenario) {
      const input = item.input;
      const next = structuredClone(defaultState);
      Object.assign(next.basics, input.basics);
      next.basics.name = `示範：${item.title}`;
      next.patientAnswers = { ...input.patientAnswers };
      input.redFlags.forEach(id => { next.redFlags[id] = true; });
      Object.assign(next.educatorFields, input.educatorFields);
      input.educatorRisks.forEach(id => { next.educatorRisks[id] = true; });
      dietitianItems.forEach(entry => {
        if (scenario.yes.includes(entry.id)) next.dietitian[entry.id] = true;
        else if (!input.na.includes(entry.id)) next.dietitian[entry.id] = false;
      });
      next.dietitianNotes = { ...input.notes };
      input.medicalChecks.forEach(index => { next.medicalChecks[index] = true; });
      next.demoCase = `${item.title}（${scenario.label}）`;
      return next;
    }

    // 引擎函式讀全域 state，暫時換入病例再還原
    function evaluateCase(item, scenario) {
      const saved = state;
      state = buildCaseState(item, scenario);
      try {
        const score = patientScore();
        const flags = redFlagCount();
        const educator = educatorScore();
        const stats = dietitianStats();
        return {
          patient: score,
          flags,
          patientBadge: patientInterpretation(score, flags).badge,
          educator,
          tier: educatorRecommendation(educator).tier,
          positive: stats.positiveCount,
          badge: dietitianInterpretation(stats).badge,
          total: stats.total,
          support: stats.supportCount,
          trend: weightTrend(),
          hints: educatorHints().length,
          bmi: bmiValue()
        };
      } finally {
        state = saved;
      }
    }

    function hasUserData() {
      if (state.demoCase) return false;
      return JSON.stringify(state) !== JSON.stringify(defaultState);
    }

    function loadTeachCase(caseId, scenarioIndex) {
      const item = TEACH_CASES.find(entry => entry.id === caseId);
      if (hasUserData() && !confirm("帶入示範病例會覆蓋本頁已填資料，確定要繼續？")) return;
      state = buildCaseState(item, item.scenarios[scenarioIndex]);
      init();
      showTab("patient");
      window.scrollTo(0, 0);
    }

    function renderDemoBanner() {
      const banner = byId("demoBanner");
      if (!banner) return;
      banner.hidden = !state.demoCase;
      setText("demoBannerText", state.demoCase ? `示範病例：${state.demoCase}。這是虛構資料，不是真實病人。` : "");
    }

    function clearDemoCase() {
      localStorage.removeItem(STORAGE_KEY);
      state = structuredClone(defaultState);
      init();
    }

    function teachSourceLinks(keys) {
      return keys.map(key => `<a href="${TEACH_SOURCES[key].url}" target="_blank" rel="noopener">${escapeHtml(TEACH_SOURCES[key].label)}</a>`).join("、");
    }

    function teachList(items) {
      return `<ul>${items.map(text => `<li>${escapeHtml(text)}</li>`).join("")}</ul>`;
    }

    function scenarioRow(item, scenario, index) {
      const r = evaluateCase(item, scenario);
      return `<tr>
        <th scope="row">${escapeHtml(scenario.label)}</th>
        <td>${r.patient}／20，紅旗 ${r.flags}</td>
        <td>${r.educator}／10（${escapeHtml(r.tier)}）</td>
        <td>${r.positive}／4 類</td>
        <td><strong>${escapeHtml(r.badge)}</strong></td>
        <td><button type="button" class="btn small" data-load-case="${item.id}" data-load-scenario="${index}">帶入工具</button></td>
      </tr>`;
    }

    function renderTeachCases() {
      byId("caseList").innerHTML = TEACH_CASES.map((item, index) => `
        <article class="tool-card case-card" id="case-${item.id}">
          <header class="case-head">
            <span class="q-num">${index + 1}</span>
            <div><span class="case-tag">${escapeHtml(item.tag)}</span><h3>${escapeHtml(item.title)}</h3></div>
          </header>
          <p>${escapeHtml(item.stem)}</p>
          <ul class="case-facts">${item.facts.map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
          <p class="case-question"><strong>想一想：</strong>${escapeHtml(item.question)}</p>
          <div class="table-wrap">
            <table class="case-table">
              <thead><tr><th scope="col">情境</th><th scope="col">病人自填</th><th scope="col">衛教師</th><th scope="col">營養師</th><th scope="col">判讀</th><th scope="col" aria-label="帶入工具"></th></tr></thead>
              <tbody>${item.scenarios.map((scenario, i) => scenarioRow(item, scenario, i)).join("")}</tbody>
            </table>
          </div>
          <details class="case-answer">
            <summary>看判讀與處置思路</summary>
            <h4>判讀</h4>${teachList(item.read)}
            <h4>處置思路</h4>${teachList(item.plan)}
            <p class="case-pitfall"><strong>常見陷阱：</strong>${escapeHtml(item.pitfall)}</p>
            <p class="source-line">依據：${teachSourceLinks(item.src)}</p>
          </details>
        </article>
      `).join("");
    }

    function renderTeachQuiz() {
      const visible = TEACH_QUIZ.map((item, index) => ({ item, index }))
        .filter(({ item }) => quizState.filter === "全部" || item.level === quizState.filter);
      const answered = visible.filter(({ index }) => quizState.answers.has(index));
      const correct = answered.filter(({ item, index }) => quizState.answers.get(index) === item.answer).length;
      setText("quizScore", `已答 ${answered.length}／${visible.length}，答對 ${correct}`);
      document.querySelectorAll("[data-quiz-filter]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.quizFilter === quizState.filter));
      });
      byId("quizList").innerHTML = visible.map(({ item, index }) => {
        const chosen = quizState.answers.get(index);
        const done = chosen !== undefined;
        const options = item.options.map((option, i) => {
          const mark = !done ? "" : i === item.answer ? " is-correct" : i === chosen ? " is-wrong" : "";
          return `<button type="button" class="quiz-option${mark}" data-question="${index}" data-option="${i}"${done ? " disabled" : ""}><span>${QUIZ_LETTERS[i]}</span><div>${escapeHtml(option)}</div></button>`;
        }).join("");
        const feedback = done ? `<div class="quiz-feedback ${chosen === item.answer ? "right" : "wrong"}" role="status"><strong>${chosen === item.answer ? "答對" : `答錯，正解 ${QUIZ_LETTERS[item.answer]}`}</strong>：${escapeHtml(item.why)}${item.src.length ? `<span class="source-line">依據：${teachSourceLinks(item.src)}</span>` : ""}</div>` : "";
        return `<article class="tool-card quiz-card"><p class="quiz-stem"><span class="quiz-level${item.level === "高階" ? " advanced" : ""}">${escapeHtml(item.level)}</span><strong>${index + 1}.</strong> ${escapeHtml(item.stem)}</p><div class="quiz-options">${options}</div>${feedback}</article>`;
      }).join("");
    }

    function renderTeachMap() {
      const half = Math.ceil(TEACH_MAP.branches.length / 2);
      const branch = (entry, index) => `<details class="mm-branch" data-branch="${index}" open style="--branch:${entry.color}"><summary class="mm-node">${escapeHtml(entry.title)}</summary><ul>${entry.leaves.map(leaf => `<li class="mm-leaf">${escapeHtml(leaf)}</li>`).join("")}</ul></details>`;
      const body = byId("mapBody");
      body.innerHTML = `<svg class="mm-lines" aria-hidden="true"></svg>
        <div class="mm-side mm-left">${TEACH_MAP.branches.slice(0, half).map((entry, i) => branch(entry, i)).join("")}</div>
        <div class="mm-center"><strong>${escapeHtml(TEACH_MAP.center[0])}</strong><span>${escapeHtml(TEACH_MAP.center[1])}</span></div>
        <div class="mm-side mm-right">${TEACH_MAP.branches.slice(half).map((entry, i) => branch(entry, i + half)).join("")}</div>`;
      body.querySelectorAll("details").forEach(node => node.addEventListener("toggle", drawTeachMap));
    }

    function drawTeachMap() {
      const box = byId("mapBody");
      const svg = box && box.querySelector(".mm-lines");
      if (!svg || box.offsetParent === null || getComputedStyle(svg).display === "none") return;
      const origin = box.getBoundingClientRect();
      svg.setAttribute("width", origin.width);
      svg.setAttribute("height", origin.height);
      const rect = element => {
        const r = element.getBoundingClientRect();
        return { left: r.left - origin.left, right: r.right - origin.left, y: r.top - origin.top + r.height / 2 };
      };
      const curve = (x1, y1, x2, y2, color, width) => {
        const mid = (x1 + x2) / 2;
        return `<path d="M${x1} ${y1}C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
      };
      const center = rect(box.querySelector(".mm-center"));
      let paths = "";
      box.querySelectorAll(".mm-branch").forEach(node => {
        const color = TEACH_MAP.branches[Number(node.dataset.branch)].color;
        const title = rect(node.querySelector(".mm-node"));
        const left = node.parentElement.classList.contains("mm-left");
        paths += left ? curve(center.left, center.y, title.right, title.y, color, 2.5) : curve(center.right, center.y, title.left, title.y, color, 2.5);
        if (!node.open) return;
        node.querySelectorAll(".mm-leaf").forEach(leaf => {
          const target = rect(leaf);
          paths += left ? curve(title.left, title.y, target.right, target.y, color, 1.25) : curve(title.right, title.y, target.left, target.y, color, 1.25);
        });
      });
      svg.innerHTML = paths;
    }

    function initTeach() {
      renderTeachCases();
      renderTeachQuiz();
      renderTeachMap();
      const sources = Object.values(TEACH_SOURCES).map(source => `<li><a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.cite)}</a></li>`).join("");
      document.querySelectorAll(".source-list").forEach(node => { node.innerHTML = sources; });

      document.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        if (button.dataset.loadCase) loadTeachCase(button.dataset.loadCase, Number(button.dataset.loadScenario));
        if (button.dataset.question) {
          quizState.answers.set(Number(button.dataset.question), Number(button.dataset.option));
          renderTeachQuiz();
        }
        if (button.dataset.quizFilter) {
          quizState.filter = button.dataset.quizFilter;
          renderTeachQuiz();
        }
        if (button.dataset.mapAll) {
          byId("mapBody").querySelectorAll("details").forEach(node => { node.open = button.dataset.mapAll === "open"; });
          drawTeachMap();
        }
      });
      byId("quizReset").addEventListener("click", () => {
        quizState.answers.clear();
        renderTeachQuiz();
      });
      byId("demoClear").addEventListener("click", clearDemoCase);
      window.addEventListener("resize", drawTeachMap);
    }
