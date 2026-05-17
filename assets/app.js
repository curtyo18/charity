/* charity — client-side renderer (real-path routing)
   Each page sets window.PAGE_CONFIG = { page, slug?, dataUrl, links }
   before this script loads, so per-page paths stay correct for nested
   /events/<slug>/index.html files under any GitHub Pages subpath. */

const FMT_GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP',
  minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const FMT_GBP_WHOLE = new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'GBP', maximumFractionDigits: 0,
});

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}
function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function formatYear(iso) { return iso.slice(0, 4); }

const CFG = window.PAGE_CONFIG || { page: 'home', dataUrl: './data/events.json', links: { home: './', tool: './tool/', eventBase: './events/' } };

async function loadData() {
  const res = await fetch(CFG.dataUrl);
  const d = await res.json();
  d.events.sort((a, b) => b.date.localeCompare(a.date));
  return d;
}

/* ───── Home ───── */
function renderHome(data) {
  const events = data.events;
  const total = events.reduce((s, e) => s + e.total, 0);
  const charities = new Set(events.map((e) => e.charity));
  const eventCount = events.length;
  const charityCount = charities.size;

  const byYear = {};
  for (const e of events) {
    const y = formatYear(e.date);
    byYear[y] = (byYear[y] || 0) + e.total;
  }
  const years = Object.keys(byYear).sort();
  const maxYear = Math.max(...Object.values(byYear), 1);

  return `
    <header class="page-head">
      <p class="eyebrow">Records · updated ${formatDate(events[0].date)}</p>
      <h1 class="headline">
        <span class="headline__num">${FMT_GBP.format(total)}</span>
        raised
      </h1>
      <p class="headline__sub">
        across ${eventCount} ${eventCount === 1 ? 'event' : 'events'} for
        ${charityCount} ${charityCount === 1 ? 'charity' : 'charities'},
        since ${formatYear(events[events.length - 1].date)}.
      </p>

      <div class="stat-strip" aria-label="Summary statistics">
        <div class="stat-strip__item"><p class="stat-strip__label">Total raised</p><p class="stat-strip__value">${FMT_GBP.format(total)}</p></div>
        <div class="stat-strip__item"><p class="stat-strip__label">Events</p><p class="stat-strip__value">${eventCount}</p></div>
        <div class="stat-strip__item"><p class="stat-strip__label">Charities</p><p class="stat-strip__value">${charityCount}</p></div>
      </div>
    </header>

    <section aria-labelledby="byyear-h" data-section="chart">
      <div class="section-head">
        <h2 id="byyear-h">By year</h2>
        <span class="section-head__meta">${years[0]} – ${years[years.length - 1]}</span>
      </div>
      ${renderYearChart(years, byYear, maxYear)}
    </section>

    <section aria-labelledby="events-h">
      <div class="section-head">
        <h2 id="events-h">Events</h2>
        <span class="section-head__meta">${eventCount} total</span>
      </div>
      <div class="events">
        ${events.map(renderEventCard).join('')}
      </div>
    </section>
  `;
}

function renderYearChart(years, byYear, maxVal) {
  const W = 600, H = 160, padX = 40, padBottom = 28, padTop = 14;
  const innerW = W - padX * 2;
  const innerH = H - padBottom - padTop;
  const barW = Math.min(64, (innerW / years.length) * 0.62);
  const slot = innerW / years.length;

  const bars = years.map((y, i) => {
    const v = byYear[y];
    const h = (v / maxVal) * innerH;
    const x = padX + slot * i + (slot - barW) / 2;
    const yPos = padTop + innerH - h;
    return `
      <g>
        <rect class="year-chart__bar" x="${x}" y="${yPos}" width="${barW}" height="${h}" rx="2"></rect>
        <text class="year-chart__value" x="${x + barW / 2}" y="${yPos - 6}" text-anchor="middle">${FMT_GBP_WHOLE.format(v)}</text>
        <text class="year-chart__label" x="${x + barW / 2}" y="${padTop + innerH + 18}" text-anchor="middle">${y}</text>
      </g>`;
  }).join('');

  return `
    <div class="year-chart">
      <div class="year-chart__head">
        <p class="year-chart__title">Raised per calendar year</p>
      </div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Bar chart of amounts raised per year">
        <line class="year-chart__baseline" x1="${padX}" x2="${W - padX}" y1="${padTop + innerH + 0.5}" y2="${padTop + innerH + 0.5}"></line>
        ${bars}
      </svg>
    </div>`;
}

function renderEventCard(e) {
  const channelsHtml = e.channels.map((c) => `<li class="tag">${escapeHtml(c)}</li>`).join('');
  const href = `${CFG.links.eventBase}${encodeURIComponent(e.slug)}/`;
  return `
    <a class="event-card" href="${href}">
      <div class="event-card__top">
        <h3 class="event-card__name">${escapeHtml(e.name)}</h3>
        <span class="event-card__total">${FMT_GBP.format(e.total)}</span>
      </div>
      <div class="event-card__meta">
        <time class="event-card__date" datetime="${e.date}">${formatDate(e.date)}</time>
        <span class="event-card__sep">·</span>
        <span class="event-card__charity">${escapeHtml(e.charity)}</span>
      </div>
      <ul class="tags" style="margin-top:0.6rem;">${channelsHtml}</ul>
    </a>`;
}

/* ───── Event detail ───── */
function renderEvent(data, slug) {
  const e = data.events.find((x) => x.slug === slug);
  if (!e) return `<div class="empty">Event not found. <a href="${CFG.links.home}">← back home</a></div>`;

  const channelsHtml = e.channels.map((c) => `<li class="tag">${escapeHtml(c)}</li>`).join('');
  const breakdownHtml = e.breakdown.map((r) => `
    <div class="breakdown__row">
      <span class="breakdown__label">${escapeHtml(r.label)}</span>
      <span class="breakdown__amount">${FMT_GBP.format(r.amount)}</span>
    </div>`).join('');

  const charityLine = e.charityUrl
    ? `for <a href="${escapeHtml(e.charityUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(e.charity)}</a>`
    : `for ${escapeHtml(e.charity)}`;

  const externalLink = e.eventUrl
    ? `<a class="external-link" href="${escapeHtml(e.eventUrl)}" rel="noopener noreferrer" target="_blank">View original event page</a>`
    : '';

  document.title = `${e.name} · charity`;

  return `
    <a class="back-link" href="${CFG.links.home}">Back to all events</a>
    <article>
      <header class="event-head">
        <p class="event-head__date"><time datetime="${e.date}">${formatDate(e.date)}</time></p>
        <h1 class="event-head__name">${escapeHtml(e.name)}</h1>
        <p class="event-head__charity">${charityLine}</p>
        <ul class="tags event-head__channels">${channelsHtml}</ul>
      </header>

      <section aria-label="Breakdown">
        <div class="section-head">
          <h2>Breakdown</h2>
          <span class="section-head__meta">${e.breakdown.length} line items</span>
        </div>
        <div class="breakdown">
          ${breakdownHtml}
          <div class="breakdown__total">
            <span class="breakdown__total-label">Total raised</span>
            <span class="breakdown__total-amount">${FMT_GBP.format(e.total)}</span>
          </div>
        </div>
      </section>

      ${externalLink}
    </article>`;
}

/* ───── boot ───── */
async function render() {
  const root = document.getElementById('app');
  root.innerHTML = '<div class="loading">Loading…</div>';
  try {
    const data = await loadData();
    if (CFG.page === 'event') {
      root.innerHTML = renderEvent(data, CFG.slug);
    } else {
      root.innerHTML = renderHome(data);
      document.title = 'charity · records';
    }
  } catch (err) {
    root.innerHTML = `<div class="empty">Failed to load data: ${escapeHtml(err.message)}</div>`;
  }
}

// expose for future re-renders if needed
window.__rerender = render;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', render);
} else {
  render();
}
