document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("json-input");
  const output = document.getElementById("json-output");
  const status = document.getElementById("json-status");
  const indentSelect = document.getElementById("indent-size");
  const sortToggle = document.getElementById("sort-keys");
  const actionButtons = document.querySelectorAll("[data-action]");
  const treeContainer = document.getElementById("json-tree");
  const viewButtons = document.querySelectorAll("[data-view]");
  let currentView = "pretty";

  if (!input || !output || !status) {
    return;
  }

  const setStatus = (type, message) => {
    status.dataset.status = type;
    status.textContent = message;
  };

  const sortJsonValue = (value) => {
    if (Array.isArray(value)) {
      return value.map(sortJsonValue);
    }
    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, key) => {
          acc[key] = sortJsonValue(value[key]);
          return acc;
        }, {});
    }
    return value;
  };

  const indentToken = () => {
    const selection = indentSelect?.value || "2";
    if (selection === "tab") {
      return "\t";
    }
    const spaces = Math.max(parseInt(selection, 10) || 2, 1);
    return " ".repeat(spaces);
  };

  const describeIndent = () => {
    const selection = indentSelect?.value || "2";
    if (selection === "tab") {
      return "tabs";
    }
    return `${selection} spaces`;
  };

  const readJson = () => {
    const raw = input.value.trim();
    if (!raw) {
      output.value = "";
      setStatus("info", "Paste or drop JSON to begin.");
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      output.value = "";
      setStatus("error", `Syntax error: ${error.message}`);
      return null;
    }
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const renderTree = (value, label = "root") => {
    if (Array.isArray(value)) {
      const items = value
        .map((child, index) => renderTree(child, `[${index}]`))
        .join("");
      return `<details open><summary>${label} · ${value.length} items</summary>${items}</details>`;
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value)
        .map(([key, child]) => renderTree(child, key))
        .join("");
      return `<details open><summary>${label} · ${Object.keys(value).length} keys</summary>${entries}</details>`;
    }

    let type = typeof value;
    if (value === null) {
      type = "null";
    }
    const displayValue = value === null ? "null" : escapeHtml(value);
    return `<div class="tree-leaf"><span class="tree-key">${label}:</span><span class="tree-value tree-value-${type}">${displayValue}</span></div>`;
  };

  const runFormatter = (mode) => {
    const parsed = readJson();
    if (parsed === null) {
      if (treeContainer) {
        treeContainer.innerHTML = "";
        treeContainer.hidden = true;
      }
      output.hidden = false;
      if (treeContainer) {
        treeContainer.hidden = true;
      }
      return;
    }

    const shouldSort = Boolean(sortToggle?.checked);
    const source = shouldSort ? sortJsonValue(parsed) : parsed;

    let formatted;
    if (mode === "minify") {
      formatted = JSON.stringify(source);
      setStatus("success", "JSON minified successfully.");
    } else {
      formatted = JSON.stringify(source, null, indentToken());
      setStatus("success", `Pretty-printed with ${describeIndent()}.`);
    }

    output.value = formatted;
    if (treeContainer) {
      treeContainer.innerHTML = renderTree(source);
      if (currentView === "tree") {
        treeContainer.hidden = false;
        output.hidden = true;
      }
    }
  };

  const copyOutput = async () => {
    const text = output.value;
    if (!text.trim()) {
      setStatus("info", "Nothing to copy yet.");
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const temp = document.createElement("textarea");
        temp.value = text;
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.focus();
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      setStatus("success", "Formatted JSON copied to clipboard.");
    } catch (error) {
      setStatus("error", "Clipboard permissions denied.");
    }
  };

  const clearAll = () => {
    input.value = "";
    output.value = "";
    if (treeContainer) {
      treeContainer.innerHTML = "";
      treeContainer.hidden = true;
    }
    output.hidden = false;
    setStatus("info", "Editor cleared.");
    input.focus();
  };

  const handleAction = (event) => {
    const action = event.currentTarget.getAttribute("data-action");
    if (action === "format") {
      runFormatter("format");
    } else if (action === "minify") {
      runFormatter("minify");
    } else if (action === "copy") {
      copyOutput();
    } else if (action === "clear") {
      clearAll();
    }
  };

  actionButtons.forEach((button) => {
    button.addEventListener("click", handleAction);
  });

  const updateView = (mode) => {
    if (!treeContainer) {
      return;
    }
    currentView = mode;
    viewButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.view === mode);
    });
    if (mode === "tree") {
      treeContainer.hidden = false;
      output.hidden = true;
    } else {
      treeContainer.hidden = true;
      output.hidden = false;
    }
  };

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.view;
      if (target) {
        updateView(target);
      }
    });
  });

  updateView("pretty");

  const highlightDropState = (state) => {
    if (state) {
      input.classList.add("is-dragging");
    } else {
      input.classList.remove("is-dragging");
    }
  };

  ["dragenter", "dragover"].forEach((eventName) => {
    input.addEventListener(eventName, (event) => {
      event.preventDefault();
      highlightDropState(true);
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    input.addEventListener(eventName, () => highlightDropState(false));
  });

  input.addEventListener("drop", (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      input.value = reader.result;
      setStatus("info", `Loaded ${file.name}. Click Format JSON to beautify.`);
    };
    reader.readAsText(file);
  });

  input.addEventListener("input", () => {
    if (!input.value.trim()) {
      output.value = "";
      if (treeContainer) {
        treeContainer.innerHTML = "";
        treeContainer.hidden = true;
      }
      output.hidden = false;
      setStatus("info", "Paste or drop JSON to begin.");
    }
  });
});
