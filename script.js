/* ==================================================
   LILITH.exe — PERSONAL INTELLIGENCE CENTER
   Public-source queries and local utilities only.
================================================== */

/* Clock */
function updateClock() {
  const now = new Date();
  const clock = document.getElementById("clock");
  const date = document.getElementById("date");
  if (clock) clock.textContent = now.toLocaleTimeString("pt-BR", { hour12: false });
  if (date) date.textContent = now.toLocaleDateString("pt-BR");
}
updateClock();
setInterval(updateClock, 1000);

/* Navigation */
function openView(viewId) {
  const target = document.getElementById(viewId);
  if (!target) return;
  document.querySelectorAll(".view").forEach(view => {
    view.hidden = true;
    view.classList.remove("active");
  });
  target.hidden = false;
  target.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
  if (viewId === "terminal") terminalInput?.focus();
}
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => openView(button.dataset.view)));
document.querySelectorAll("[data-open-view]").forEach(button => button.addEventListener("click", () => openView(button.dataset.openView)));

/* Activity log */
function logActivity(message) {
  const log = document.getElementById("activity-log");
  if (!log) return;
  const row = document.createElement("p");
  const time = document.createElement("time");
  time.textContent = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const text = document.createElement("span");
  text.textContent = message;
  row.append(time, text);
  log.prepend(row);
  while (log.children.length > 6) log.lastElementChild.remove();
}

/* Terminal: commands run only in this local interface */
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("terminal-output");

function writeTerminalLine(message, className = "") {
  if (!terminalOutput) return;
  const line = document.createElement("p");
  line.textContent = message;
  if (className) line.className = className;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
const terminalCommands = {
  help: () => ["AVAILABLE COMMANDS", "------------------------------", "help     - list commands", "clear    - clear terminal", "date     - current date", "time     - current time", "whoami   - current local profile", "about    - about LILITH.exe", "status   - interface status", "banner   - display banner", "echo     - repeat a message", "profile  - operator profile", "system   - local app information", "matrix   - visual message", "joke     - random message", "notes    - note count", "------------------------------"],
  date: () => ["Date: " + new Date().toLocaleDateString("pt-BR")],
  time: () => ["Time: " + new Date().toLocaleTimeString("pt-BR")],
  whoami: () => ["User: operator", "System: LILITH.exe", "Environment: local browser"],
  about: () => ["LILITH.exe — Personal Intelligence Center", "Version: 2.0.0", "Public-source research and personal utilities.", "Runs in your browser."],
  status: () => ["Interface: ONLINE", "Terminal: READY", "Public APIs: available when internet is connected", "Remote access: NOT USED", "Status: OPERATIONAL"],
  banner: () => ["██╗     ██╗██╗     ██╗████████╗██╗  ██╗", "██║     ██║██║     ██║╚══██╔══╝██║  ██║", "██║     ██║██║     ██║   ██║   ███████║", "╚██████╗██║███████╗██║   ██║   ██║  ██║", "        L I L I T H . e x e"],
  profile: () => ["OPERATOR PROFILE", "Codename: LILITH", "Mode: DARK", "Scope: public information + local tools", "Status: ACTIVE"],
  system: () => ["Application: LILITH.exe", "Environment: Browser", "Storage: Local browser storage", "Remote access: Not used by terminal"],
  matrix: () => ["01001100 01001001 01001100 01001001 01010100 01001000", "WAKE UP, OPERATOR...", "PUBLIC DATA ONLY.", "JUST KIDDING. <3"],
  joke: () => { const jokes = ["Erro 404: minha paciência não foi encontrada.", "A noite é jovem. O código também.", "Salve o arquivo antes de salvar o mundo.", "Keep calm and trust your code."]; return [jokes[Math.floor(Math.random() * jokes.length)]]; },
  notes: () => [`Saved notes: ${Array.isArray(notes) ? notes.length : 0}`]
};
function runTerminalCommand(raw) {
  const input = raw.trim();
  if (!input) return;
  writeTerminalLine("operator@lilith:~$ " + input, "command-line");
  const firstSpace = input.search(/\s/);
  const command = (firstSpace < 0 ? input : input.slice(0, firstSpace)).toLowerCase();
  const argument = firstSpace < 0 ? "" : input.slice(firstSpace).trim();
  if (command === "clear") { terminalOutput?.replaceChildren(); return; }
  if (command === "echo") { writeTerminalLine(argument || "(empty message)"); return; }
  if (Object.prototype.hasOwnProperty.call(terminalCommands, command)) {
    terminalCommands[command]().forEach(line => writeTerminalLine(line));
    return;
  }
  writeTerminalLine("Unknown command: " + command, "terminal-error");
  writeTerminalLine('Type "help" to list commands.');
}
if (terminalForm && terminalInput && terminalOutput) {
  terminalForm.addEventListener("submit", event => {
    event.preventDefault();
    runTerminalCommand(terminalInput.value);
    terminalInput.value = "";
  });
}

/* Local notes */
const notesKey = "lilith-notes";
const notesForm = document.getElementById("notes-form");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const notesList = document.getElementById("notes-list");
const notesCount = document.getElementById("notes-count");
let notes = [];
try {
  const saved = JSON.parse(localStorage.getItem(notesKey) || "[]");
  notes = Array.isArray(saved) ? saved : [];
} catch { notes = []; }

function saveNotes() {
  try {
    localStorage.setItem(notesKey, JSON.stringify(notes));
    return true;
  } catch {
    alert("Não foi possível salvar as notas neste navegador.");
    return false;
  }
}
function renderNotes() {
  if (!notesList) return;
  notesList.replaceChildren();
  if (!notes.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma nota salva ainda.";
    notesList.appendChild(empty);
  }
  notes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-card";
    const title = document.createElement("h3");
    title.textContent = note.title;
    const content = document.createElement("p");
    content.textContent = note.content;
    const date = document.createElement("small");
    date.textContent = note.createdAt ? new Date(note.createdAt).toLocaleString("pt-BR") : "";
    const actions = document.createElement("div");
    actions.className = "note-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "note-delete";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => {
      if (!confirm(`Excluir a nota "${note.title}"?`)) return;
      const oldNotes = notes;
      notes = notes.filter(item => item.id !== note.id);
      if (!saveNotes()) notes = oldNotes;
      renderNotes();
      updateNotesCount();
    });
    actions.appendChild(remove);
    card.append(title, content, date, actions);
    notesList.appendChild(card);
  });
  if (notesCount) notesCount.textContent = `${notes.length} note(s)`;
}
function updateNotesCount() {
  const dashboardCount = document.getElementById("dashboard-notes-count");
  if (dashboardCount) dashboardCount.textContent = `${notes.length} notes`;
}
if (notesForm && noteTitle && noteContent) {
  notesForm.addEventListener("submit", event => {
    event.preventDefault();
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (!title || !content) return;
    const note = { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())), title, content, createdAt: new Date().toISOString() };
    notes.unshift(note);
    if (!saveNotes()) notes.shift();
    renderNotes();
    updateNotesCount();
    notesForm.reset();
    logActivity("A local note was saved.");
  });
}
renderNotes();
updateNotesCount();

/* Shared helpers for public API requests */
async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "Accept": "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
function setBusy(button, busy, busyText = "Loading...") {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}
function formatNumber(value, maximumFractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "No data";
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-US", { maximumFractionDigits }) : String(value);
}
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/* Public Data Explorer — Wikipedia REST API */
const explorerForm = document.getElementById("explorer-form");
const explorerQuery = document.getElementById("explorer-query");
const explorerStatus = document.getElementById("explorer-status");
const explorerResults = document.getElementById("explorer-results");
const explorerButton = document.getElementById("explorer-search");
if (explorerForm && explorerQuery && explorerStatus && explorerResults) {
  explorerForm.addEventListener("submit", async event => {
    event.preventDefault();
    const query = explorerQuery.value.trim();
    if (!query) return;
    explorerResults.replaceChildren();
    explorerStatus.textContent = "Searching Wikipedia...";
    setBusy(explorerButton, true, "Searching...");
    try {
      const url = new URL("https://pt.wikipedia.org/w/rest.php/v1/search/page");
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "10");
      const data = await fetchJson(url.toString());
      const pages = Array.isArray(data.pages) ? data.pages : [];
      if (!pages.length) {
        explorerStatus.textContent = "Nenhum resultado encontrado. Tente outros termos.";
        return;
      }
      pages.forEach(page => {
        const card = makeElement("article", "explorer-result");
        const title = makeElement("h3", "", page.title || "Untitled");
        const description = makeElement("p", "", page.description || page.excerpt?.replace(/<[^>]*>/g, "") || "Descrição não disponível.");
        const link = makeElement("a", "", "Open original article ↗");
        link.href = "https://pt.wikipedia.org/wiki/" + encodeURIComponent(page.key || page.title);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(title, description, link);
        explorerResults.appendChild(card);
      });
      explorerStatus.textContent = `${pages.length} result(s) found. Source: Wikipedia.`;
      logActivity(`Wikipedia search: ${query}`);
    } catch (error) {
      explorerStatus.textContent = "A pesquisa falhou. Verifique a conexão e tente novamente.";
      console.error(error);
    } finally {
      setBusy(explorerButton, false);
    }
  });
}

/* Weather — Open-Meteo geocoding and forecast APIs */
const weatherForm = document.getElementById("weather-form");
const weatherCity = document.getElementById("weather-city");
const weatherStatus = document.getElementById("weather-status");
const weatherResults = document.getElementById("weather-results");
const weatherButton = document.getElementById("weather-search");
const weatherCodes = {
  0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
  61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
  80: "Rain showers", 81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail"
};
if (weatherForm && weatherCity && weatherStatus && weatherResults) {
  weatherForm.addEventListener("submit", async event => {
    event.preventDefault();
    const city = weatherCity.value.trim();
    if (!city) return;
    weatherResults.replaceChildren();
    weatherStatus.textContent = "Finding location...";
    setBusy(weatherButton, true, "Loading...");
    try {
      const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
      geoUrl.searchParams.set("name", city);
      geoUrl.searchParams.set("count", "1");
      geoUrl.searchParams.set("language", "en");
      geoUrl.searchParams.set("format", "json");
      const geo = await fetchJson(geoUrl.toString());
      if (!geo.results?.length) {
        weatherStatus.textContent = "Local não encontrado. Tente nome de cidade + país.";
        return;
      }
      const place = geo.results[0];
      weatherStatus.textContent = "Fetching forecast...";
      const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
      forecastUrl.searchParams.set("latitude", place.latitude);
      forecastUrl.searchParams.set("longitude", place.longitude);
      forecastUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m");
      forecastUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
      forecastUrl.searchParams.set("forecast_days", "5");
      forecastUrl.searchParams.set("timezone", "auto");
      const forecast = await fetchJson(forecastUrl.toString());
      const current = forecast.current;
      const unit = forecast.current_units?.temperature_2m || "°C";
      const heading = makeElement("div", "weather-current");
      const left = makeElement("div");
      left.append(makeElement("div", "weather-city", `${place.name}${place.admin1 ? ", " + place.admin1 : ""}, ${place.country}`));
      left.append(makeElement("p", "weather-meta", `${weatherCodes[current.weather_code] || "Weather conditions"} · Feels like ${current.apparent_temperature}${unit}`));
      const right = makeElement("div");
      right.append(makeElement("div", "weather-temp", `${current.temperature_2m}${unit}`));
      right.append(makeElement("p", "weather-meta", `Humidity ${current.relative_humidity_2m}% · Wind ${current.wind_speed_10m} km/h`));
      heading.append(left, right);
      weatherResults.appendChild(heading);
      const tableWrap = makeElement("div", "data-table-wrap");
      const table = makeElement("table", "data-table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      ["Date", "Conditions", "High", "Low", "Precip. chance"].forEach(label => headRow.appendChild(makeElement("th", "", label)));
      thead.appendChild(headRow);
      const tbody = document.createElement("tbody");
      forecast.daily.time.forEach((day, i) => {
        const row = document.createElement("tr");
        [day, weatherCodes[forecast.daily.weather_code[i]] || "Unknown", `${forecast.daily.temperature_2m_max[i]}°`, `${forecast.daily.temperature_2m_min[i]}°`, `${forecast.daily.precipitation_probability_max?.[i] ?? "—"}%`].forEach(value => row.appendChild(makeElement("td", "", value)));
        tbody.appendChild(row);
      });
      table.append(thead, tbody);
      tableWrap.appendChild(table);
      weatherResults.appendChild(tableWrap);
      weatherStatus.textContent = "Weather data loaded.";
      logActivity(`Weather lookup: ${place.name}`);
    } catch (error) {
      weatherStatus.textContent = "Não foi possível carregar o clima. Tente novamente em instantes.";
      console.error(error);
    } finally {
      setBusy(weatherButton, false);
    }
  });
}

/* World Bank indicators API */
const economyForm = document.getElementById("economy-form");
const economyCountry = document.getElementById("economy-country");
const economyIndicator = document.getElementById("economy-indicator");
const economyStatus = document.getElementById("economy-status");
const economyResults = document.getElementById("economy-results");
const economyButton = document.getElementById("economy-search");
if (economyForm && economyCountry && economyIndicator && economyStatus && economyResults) {
  economyForm.addEventListener("submit", async event => {
    event.preventDefault();
    const country = economyCountry.value;
    const indicator = economyIndicator.value;
    const countryName = economyCountry.selectedOptions[0]?.textContent || country;
    const indicatorName = economyIndicator.selectedOptions[0]?.textContent || indicator;
    economyResults.replaceChildren();
    economyStatus.textContent = "Fetching World Bank data...";
    setBusy(economyButton, true, "Loading...");
    try {
      const url = new URL(`https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}`);
      url.searchParams.set("format", "json");
      url.searchParams.set("per_page", "15");
      url.searchParams.set("date", "2010:2025");
      const data = await fetchJson(url.toString());
      const rows = Array.isArray(data?.[1]) ? data[1].filter(item => item.value !== null) : [];
      const heading = makeElement("div", "weather-current");
      heading.append(makeElement("div", "weather-city", countryName));
      heading.append(makeElement("div", "weather-meta", indicatorName));
      economyResults.appendChild(heading);
      if (!rows.length) {
        economyStatus.textContent = "Nenhum dado disponível para esse indicador e período.";
        return;
      }
      const tableWrap = makeElement("div", "data-table-wrap");
      const table = makeElement("table", "data-table");
      const thead = document.createElement("thead");
      const headRow = document.createElement("tr");
      ["Year", "Value", "Country", "Indicator"].forEach(label => headRow.appendChild(makeElement("th", "", label)));
      thead.appendChild(headRow);
      const tbody = document.createElement("tbody");
      rows.forEach(item => {
        const row = document.createElement("tr");
        const value = Number(item.value);
        const formatted = Number.isFinite(value) ? value.toLocaleString("en-US", { maximumFractionDigits: 2 }) : String(item.value);
        [item.date, formatted, item.country?.value || countryName, item.indicator?.value || indicatorName].forEach(text => row.appendChild(makeElement("td", "", text)));
        tbody.appendChild(row);
      });
      table.append(thead, tbody);
      tableWrap.appendChild(table);
      economyResults.appendChild(tableWrap);
      economyStatus.textContent = `${rows.length} data point(s) loaded from the World Bank.`;
      logActivity(`World Bank indicator: ${countryName}`);
    } catch (error) {
      economyStatus.textContent = "Não foi possível carregar os indicadores. Tente novamente.";
      console.error(error);
    } finally {
      setBusy(economyButton, false);
    }
  });
}

/* Password generator */
const passwordLength = document.getElementById("password-length");
const passwordLengthValue = document.getElementById("password-length-value");
const includeUppercase = document.getElementById("include-uppercase");
const includeLowercase = document.getElementById("include-lowercase");
const includeNumbers = document.getElementById("include-numbers");
const includeSymbols = document.getElementById("include-symbols");
const generatePasswordButton = document.getElementById("generate-password");
const generatedPassword = document.getElementById("generated-password");
const copyPasswordButton = document.getElementById("copy-password");
const passwordFeedback = document.getElementById("password-feedback");
if (passwordLength && passwordLengthValue) {
  passwordLengthValue.textContent = passwordLength.value;
  passwordLength.addEventListener("input", () => passwordLengthValue.textContent = passwordLength.value);
}
function randomIndex(max) {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    const range = 0x100000000;
    const limit = range - range % max;
    let value;
    do { crypto.getRandomValues(values); value = values[0]; } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}
function generateSecurePassword(length, options) {
  const groups = [];
  if (options.uppercase) groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (options.lowercase) groups.push("abcdefghijklmnopqrstuvwxyz");
  if (options.numbers) groups.push("0123456789");
  if (options.symbols) groups.push("!@#$%^&*()-_=+[]{};:,.?");
  if (!groups.length) return null;
  const all = groups.join("");
  const chars = groups.map(group => group[randomIndex(group.length)]);
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
if (generatePasswordButton) {
  generatePasswordButton.addEventListener("click", () => {
    const password = generateSecurePassword(Number(passwordLength?.value || 20), {
      uppercase: includeUppercase?.checked ?? true,
      lowercase: includeLowercase?.checked ?? true,
      numbers: includeNumbers?.checked ?? true,
      symbols: includeSymbols?.checked ?? true
    });
    if (!password) {
      if (passwordFeedback) passwordFeedback.textContent = "Selecione ao menos um tipo de caractere.";
      return;
    }
    if (generatedPassword) generatedPassword.value = password;
    if (passwordFeedback) passwordFeedback.textContent = "Senha gerada localmente. Guarde-a em local seguro.";
  });
}
if (copyPasswordButton) {
  copyPasswordButton.addEventListener("click", async () => {
    const value = generatedPassword?.value || "";
    if (!value) {
      if (passwordFeedback) passwordFeedback.textContent = "Gere uma senha antes de copiar.";
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      if (passwordFeedback) passwordFeedback.textContent = "Senha copiada.";
    } catch {
      generatedPassword.select();
      if (passwordFeedback) passwordFeedback.textContent = "Copie manualmente com Ctrl+C.";
    }
  });
}

/* Password strength estimate — local only */
const securityPassword = document.getElementById("security-password");
const showSecurityPassword = document.getElementById("show-security-password");
const analyzePasswordButton = document.getElementById("analyze-password");
const securityResult = document.getElementById("security-result");
if (showSecurityPassword && securityPassword) {
  showSecurityPassword.addEventListener("change", () => securityPassword.type = showSecurityPassword.checked ? "text" : "password");
}
function analyzePasswordStrength(password) {
  let score = 0;
  const tips = [];
  if (password.length >= 8) score++; else tips.push("Use pelo menos 8 caracteres.");
  if (password.length >= 12) score++; else tips.push("Prefira 12 ou mais caracteres.");
  if (/[a-z]/.test(password)) score++; else tips.push("Adicione letras minúsculas.");
  if (/[A-Z]/.test(password)) score++; else tips.push("Adicione letras maiúsculas.");
  if (/[0-9]/.test(password)) score++; else tips.push("Adicione números.");
  if (/[^A-Za-z0-9]/.test(password)) score++; else tips.push("Adicione símbolos.");
  if (/(.)\1{2,}/.test(password)) { score--; tips.push("Evite repetições longas."); }
  if (/password|senha|qwerty|123456|abcdef/i.test(password)) { score -= 2; tips.push("Evite palavras e sequências comuns."); }
  score = Math.max(0, Math.min(score, 6));
  const label = score <= 2 ? "Fraca" : score <= 4 ? "Moderada" : "Forte";
  return { score, label, tips };
}
if (analyzePasswordButton && securityPassword && securityResult) {
  analyzePasswordButton.addEventListener("click", () => {
    securityResult.replaceChildren();
    const password = securityPassword.value;
    if (!password) { securityResult.textContent = "Digite uma senha fictícia para analisar."; return; }
    const result = analyzePasswordStrength(password);
    securityResult.appendChild(makeElement("h3", "", `Resultado: ${result.label}`));
    securityResult.appendChild(makeElement("p", "", `Pontuação indicativa: ${result.score}/6`));
    if (result.tips.length) {
      const list = document.createElement("ul");
      result.tips.forEach(tip => list.appendChild(makeElement("li", "", tip)));
      securityResult.appendChild(list);
    } else {
      securityResult.appendChild(makeElement("p", "", "Boa variedade de características. Use uma senha exclusiva."));
    }
    securityResult.appendChild(makeElement("small", "", "Estimativa local simples: não verifica vazamentos e não garante segurança."));
  });
}

console.log("%c LILITH.exe ", "background:#190b13;color:#ff8ca7;font-weight:bold;padding:6px");
console.log("Interface initialized. Public data sources: Wikipedia, Open-Meteo, World Bank.");


const formRastro = document.getElementById("form-rastro");

if (formRastro) {
  formRastro.addEventListener("submit", function (event) {
    event.preventDefault();

    const campo = document.getElementById("telefone");
    const resultado = document.getElementById("resultado-rastro");

    const telefone = campo.value.trim();
    const numeros = telefone.replace(/\D/g, "");

    if (numeros.length < 8 || numeros.length > 15) {
      resultado.textContent =
        "Número inválido ou formato não reconhecido.";
      return;
    }

    resultado.textContent =
      "Abrindo pesquisa em fontes públicas...";

    const consulta = `"${telefone}"`;
    const url = "https://www.google.com/search?q=" +
      encodeURIComponent(consulta);

    window.open(url, "_blank", "noopener,noreferrer");

    resultado.textContent =
      "Pesquisa aberta em uma nova aba. Confira as fontes e confirme as informações manualmente.";
  });
}
