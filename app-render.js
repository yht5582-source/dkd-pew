    function renderBasicFields() {
      byId("basicFields").innerHTML = basicFields.map(field => fieldMarkup(field, "basics")).join("");
      byId("summaryBasics").innerHTML = basicFields
        .filter(field => ["name", "mrn", "date", "ckdStage", "dialysis", "height", "weight", "dryWeight"].includes(field.id))
        .map(field => fieldMarkup(field, "basics"))
        .join("");
    }

    function renderEducatorFields() {
      byId("educatorFields").innerHTML = educatorFields.map(field => fieldMarkup(field, "educatorFields")).join("");
    }

    function renderPatientQuestions() {
      byId("patientQuestions").innerHTML = patientQuestions.map((q, index) => {
        const choices = q.choices.map((label, score) => `
          <label class="choice">
            <input type="radio" name="patient-${q.id}" data-patient-id="${q.id}" value="${score}" ${state.patientAnswers[q.id] === score ? "checked" : ""}>
            <span>${score} 分：${escapeHtml(label)}</span>
          </label>
        `).join("");
        return `
          <div class="question-row">
            <div class="q-num">${index + 1}</div>
            <div class="q-title">${escapeHtml(q.title)}</div>
            <div class="choices">${choices}</div>
          </div>
        `;
      }).join("");
    }

    function renderRedFlags() {
      byId("redFlags").innerHTML = redFlagItems.map(item => `
        <label class="check-row">
          <input type="checkbox" data-red-flag="${item.id}" ${state.redFlags[item.id] ? "checked" : ""}>
          <span><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</span>
        </label>
      `).join("");
    }

    function renderEducatorRisks() {
      byId("educatorRisks").innerHTML = educatorRisks.map(item => `
        <label class="check-row">
          <input type="checkbox" data-educator-risk="${item.id}" ${state.educatorRisks[item.id] ? "checked" : ""}>
          <span><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</span>
        </label>
      `).join("");
    }

    function renderDietitianRows() {
      byId("dietitianRows").innerHTML = dietitianItems.map(item => {
        const yes = state.dietitian[item.id] === true;
        const no = state.dietitian[item.id] === false;
        const score = yes ? item.score : 0;
        return `
          <tr>
            <td><span class="category-pill">${escapeHtml(item.category)}</span></td>
            <td><strong>${escapeHtml(item.indicator)}</strong>${item.reminder ? `<br><span class="note">${escapeHtml(item.reminder)}</span>` : ""}</td>
            <td>${escapeHtml(item.criteria)}</td>
            <td>
              <div class="choices two">
                <label class="choice"><input type="radio" name="diet-${item.id}" data-diet-id="${item.id}" value="yes" ${yes ? "checked" : ""}>是</label>
                <label class="choice"><input type="radio" name="diet-${item.id}" data-diet-id="${item.id}" value="no" ${no ? "checked" : ""}>否</label>
              </div>
            </td>
            <td data-score-for="${item.id}">${score}</td>
            <td>${item.main ? "是" : "否"}</td>
            <td><input aria-label="${escapeHtml(item.indicator)} 備註或數值" data-diet-note="${item.id}" value="${escapeHtml(state.dietitianNotes[item.id] || "")}" style="width:100%; min-width:140px; border:1px solid var(--line); border-radius:8px; padding:7px;"></td>
          </tr>
        `;
      }).join("");
    }

    function renderMedicalChecks() {
      byId("medicalChecks").innerHTML = medicalChecks.map((label, index) => `
        <label class="check-row">
          <input type="checkbox" data-medical-check="${index}" ${state.medicalChecks[index] ? "checked" : ""}>
          <span><strong>${escapeHtml(label)}</strong></span>
        </label>
      `).join("");
    }

    function renderReferences() {
      byId("referenceGrid").innerHTML = referenceItems.map(item => `
        <div class="ref-item">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.body)}</p>
        </div>
      `).join("");
    }

