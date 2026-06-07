    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return structuredClone(defaultState);
        return mergeDeep(structuredClone(defaultState), JSON.parse(raw));
      } catch {
        return structuredClone(defaultState);
      }
    }

    function saveState() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function mergeDeep(target, source) {
      for (const key of Object.keys(source || {})) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
          target[key] = mergeDeep(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
      return target;
    }

    function byId(id) {
      return document.getElementById(id);
    }

    function numberValue(value) {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }

    function setText(id, value) {
      const el = byId(id);
      if (el) el.textContent = value;
    }

    function setBadge(id, text, kind = "") {
      const el = byId(id);
      if (!el) return;
      el.textContent = text;
      el.className = `badge ${kind}`.trim();
    }

    function fieldMarkup(field, section) {
      const value = state[section][field.id] ?? "";
      if (field.type === "select") {
        const opts = field.options.map(option => `<option value="${escapeHtml(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option || "請選擇")}</option>`).join("");
        return `<div class="field"><label for="${section}-${field.id}">${field.label}</label><select id="${section}-${field.id}" data-section="${section}" data-key="${field.id}">${opts}</select></div>`;
      }
      const min = field.min !== undefined ? ` min="${field.min}"` : "";
      const max = field.max !== undefined ? ` max="${field.max}"` : "";
      const step = field.step ? ` step="${field.step}"` : "";
      return `<div class="field"><label for="${section}-${field.id}">${field.label}</label><input id="${section}-${field.id}" data-section="${section}" data-key="${field.id}" type="${field.type}" value="${escapeHtml(value)}"${min}${max}${step}></div>`;
    }

    function escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

let state = loadState();
