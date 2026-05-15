import { computeTotals, suggestPersonalMatch } from './math.mjs';

const STORAGE_KEY = 'bakesale-v1-state';
const form = document.getElementById('inputs');
const resetButton = document.getElementById('resetButton');
const topUpButton = document.getElementById('topUpButton');
const capStatus = document.getElementById('capStatus');

const formatCurrency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format;

function readState() {
  const data = new FormData(form);
  return {
    donationsFromOthers: data.get('donationsFromOthers') ?? '',
    giftAidFromOthers: data.get('giftAidFromOthers') ?? '',
    numBakers: data.get('numBakers') ?? '',
    personalMatchOverride: data.get('personalMatchOverride') ?? '',
  };
}

function writeState(state) {
  for (const [key, value] of Object.entries(state)) {
    const el = form.elements[key];
    if (!el) continue;
    if (el.type === 'checkbox') {
      el.checked = Boolean(value);
    } else {
      el.value = value ?? '';
    }
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw);
    writeState(stored);
  } catch {
    // localStorage unavailable or corrupt — start blank.
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota) — continue without persistence.
  }
}

function renderCapStatus(state, totals) {
  const numBakers = Number(state.numBakers) || 0;
  if (numBakers === 0) {
    capStatus.hidden = true;
    capStatus.textContent = '';
    capStatus.classList.remove('met');
    return;
  }
  capStatus.hidden = false;
  if (totals.topUpToCap === 0) {
    capStatus.textContent = `Employer cap fully met (${formatCurrency(totals.employerCap)} = £200 × ${numBakers} bakers)`;
    capStatus.classList.add('met');
  } else {
    capStatus.textContent = `${formatCurrency(totals.topUpToCap)} more would unlock the full ${formatCurrency(totals.employerCap)} employer cap`;
    capStatus.classList.remove('met');
  }
}

function render() {
  const state = readState();
  saveToStorage(state);

  const totals = computeTotals(state);

  for (const [key, value] of Object.entries(totals)) {
    const out = document.querySelector(`output[name="${key}"]`);
    if (out) out.value = formatCurrency(value);
  }

  renderCapStatus(state, totals);

  const donations = Number(state.donationsFromOthers) || 0;
  const suggestion = suggestPersonalMatch(donations, totals.employerCap);
  const overrideStr = state.personalMatchOverride;
  const overrideProvided = overrideStr !== '' && overrideStr !== null && overrideStr !== undefined;
  const overrideValue = Number(overrideStr) || 0;
  const applied = suggestion > 0 && overrideProvided &&
    overrideValue.toFixed(2) === suggestion.toFixed(2);
  topUpButton.classList.toggle('applied', applied);
}

let renderTimer = null;
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 50);
}

form.addEventListener('input', scheduleRender);
form.addEventListener('change', scheduleRender);

resetButton.addEventListener('click', () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore — same reason as saveToStorage.
  }
  form.reset();
  render();
});

topUpButton.addEventListener('click', () => {
  const state = readState();
  const donations = Number(state.donationsFromOthers) || 0;
  const bakers = Number(state.numBakers) || 0;
  const cap = 200 * bakers;
  const suggestion = suggestPersonalMatch(donations, cap);
  form.elements.personalMatchOverride.value = suggestion.toFixed(2);
  render();
});

loadFromStorage();
render();
