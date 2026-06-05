const BASE   = 'http://localhost:3001';
const RING_C = 251.33;

// ── Site palette (mirrors index.css variables) ────────────────────────────────
const C = {
  orange:     '#ff8f33',   // --highlight-text
  teal:       '#00ffb9',   // --acent
  red:        '#e81132',   // --error
  textMuted:  '#866ea7',   // --secondary-text
  grid:       'rgba(134,110,167,0.15)',   // purple-tinted grid lines
  tick:       '#7a5f95',                  // darker muted purple for axis labels
  tooltip_bg: 'rgba(22,5,44,0.96)',       // near-black purple
};

// Rarity colours tuned to feel native in the purple UI
const RARITY_COLORS = {
  common:    '#866ea7',   // same as --secondary-text  → blends in
  uncommon:  '#55aa88',
  rare:      '#55aaff',   // blue accent
  epic:      '#cc44ff',   // vivid purple → feels like an upgrade of the bg
  legendary: '#ff8f33',   // orange = --highlight-text → the most precious
};

// Shared tooltip config applied to every Chart.js chart
const TT = {
  backgroundColor: C.tooltip_bg,
  borderColor:     'rgba(255,255,255,0.09)',
  borderWidth:     1,
  padding:         14,
  titleColor:      '#e0d0ff',
  bodyColor:       C.textMuted,
  titleFont:       { size: 12, weight: '700' },
  bodyFont:        { size: 11 },
};

const MILESTONES = [
  { id: 'first_win', label: 'First Victory',  desc: 'Win your first run',       icon: '✓', check: s => s.victories >= 1 },
  { id: 'veteran',   label: 'Veteran',         desc: 'Complete 10 runs',         icon: '✕', check: s => s.total_runs >= 10 },
  { id: 'slayer',    label: 'Enemy Slayer',    desc: 'Kill 100 enemies total',   icon: '☠', check: s => s.total_enemies_killed >= 100 },
  { id: 'crawler',   label: 'Dungeon Crawler', desc: 'Clear 50 rooms total',     icon: '⛩', check: s => s.total_rooms_cleared >= 50 },
  { id: 'scorer',    label: 'High Scorer',     desc: 'Reach a score of 5,000',   icon: '★', check: s => s.best_score >= 5000 },
  { id: 'dealer',    label: 'Damage Dealer',   desc: 'Deal 10,000 total damage', icon: '⚡', check: s => s.total_damage_dealt >= 10000 },
];

let scoreHistoryChart = null;
let radarChart        = null;
let rarityChart       = null;
let cardsChart        = null;
let lbChart           = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = n => (n == null || n === '') ? '–' : Number(n).toLocaleString();
const pct = n => n == null ? '–' : `${parseFloat(n).toFixed(1)}%`;
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

async function apiFetch(path, auth = false) {
  const headers = {};
  if (auth) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('no-token');
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ── Auth header ───────────────────────────────────────────────────────────────
async function initHeader() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const data = await apiFetch('/users/me', true);
    document.getElementById('usernameDisplay').textContent = data.username;
    document.getElementById('usernameInitial').textContent = data.username.charAt(0).toUpperCase();
    document.getElementById('signupUser').style.display = 'none';
    document.getElementById('user').style.display       = 'flex';
    return data.username;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

// ── Chart.js global defaults ──────────────────────────────────────────────────
function initChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Nunito', sans-serif";
  Chart.defaults.font.size   = 11;
  Chart.defaults.color       = C.textMuted;
  Chart.defaults.borderColor = C.grid;
}

// ── SVG ring + CSS bars ───────────────────────────────────────────────────────
function setRing(pct) {
  const el = document.getElementById('winRateRing');
  if (el) setTimeout(() => { el.style.strokeDashoffset = RING_C * (1 - pct / 100); }, 120);
}
function setBar(id, w) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => { el.style.width = `${Math.max(0, Math.min(100, w))}%`; }, 120);
}

// ── CHART 1 — Score History (line + gradient fill) ───────────────────────────
function createScoreHistoryChart(runs) {
  const canvas = document.getElementById('scoreHistoryChart');
  const empty  = document.getElementById('scoreHistoryEmpty');
  if (!canvas || !window.Chart) return;

  if (!runs?.length) {
    canvas.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  canvas.style.display = 'block';
  if (empty) empty.style.display = 'none';
  if (scoreHistoryChart) scoreHistoryChart.destroy();

  const ctx  = canvas.getContext('2d');
  // Gradient: orange fades into the panel's dark purple
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.closest('.chart-wrap').clientHeight || 220);
  grad.addColorStop(0,   'rgba(255,143,51,0.28)');
  grad.addColorStop(0.6, 'rgba(76,40,117,0.08)');
  grad.addColorStop(1,   'rgba(54,20,92,0)');

  const ptColors = runs.map(r => r.status === 'victory' ? C.teal : C.red);

  scoreHistoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: runs.map((_, i) => `#${i + 1}`),
      datasets: [{
        data:                 runs.map(r => r.score ?? 0),
        borderColor:          C.orange,
        backgroundColor:      grad,
        fill:                 true,
        tension:              0.42,
        pointBackgroundColor: ptColors,
        pointBorderColor:     ptColors,
        pointBorderWidth:     2,
        pointRadius:          5,
        pointHoverRadius:     8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            title:      ctx => `Run ${ctx[0].dataIndex + 1}`,
            label:      ctx => ` Score: ${ctx.parsed.y.toLocaleString()}`,
            afterLabel: ctx => {
              const r = runs[ctx.dataIndex];
              return [
                ` ${r.status === 'victory' ? '✓ VICTORY' : '✗ DEFEAT'}`,
                ` Rooms ${r.rooms_cleared ?? '–'}  ·  Kills ${r.enemies_killed ?? '–'}`,
              ];
            },
          },
        },
      },
      scales: {
        x: {
          grid:  { color: C.grid },
          ticks: { color: C.tick, maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          grid:  { color: C.grid },
          ticks: {
            color:    C.tick,
            callback: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
          },
        },
      },
    },
  });
}

// ── CHART 2 — Performance Radar ───────────────────────────────────────────────
function createRadarChart(s, username) {
  const canvas = document.getElementById('radarChart');
  if (!canvas || !window.Chart || !s) return;
  if (radarChart) radarChart.destroy();

  // Normalise each axis to 0-100
  const winRate  = parseFloat(s.win_rate_pct)          || 0;
  const kills    = Math.min((parseFloat(s.avg_enemies_per_run) || 0) / 30  * 100, 100);
  const rooms    = Math.min((parseFloat(s.avg_rooms_per_run)   || 0) / 20  * 100, 100);
  const scoreAvg = Math.min((parseFloat(s.avg_score)           || 0) / 4000 * 100, 100);
  const dmgEff   = Math.min(((s.total_damage_dealt || 0) / Math.max(s.total_damage_taken || 1, 1)) / 3 * 100, 100);

  const ctx = canvas.getContext('2d');
  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['WIN RATE', 'KILLS / RUN', 'EXPLORATION', 'AVG SCORE', 'DMG RATIO'],
      datasets: [{
        label:                username ?? 'You',
        data:                 [winRate, kills, rooms, scoreAvg, dmgEff],
        backgroundColor:      'rgba(0,255,185,0.1)',
        borderColor:          C.teal,
        borderWidth:          2,
        pointBackgroundColor: C.teal,
        pointBorderColor:     'rgba(0,255,185,0.4)',
        pointRadius:          4,
        pointHoverRadius:     6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode:      'nearest',
        intersect: false,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            title:  ctx => ctx[0]?.label ?? '',
            label:  ctx => ` ${ctx.parsed.r.toFixed(1)} / 100`,
          },
        },
      },
      scales: {
        r: {
          min:         0,
          max:         100,
          grid:        { color: 'rgba(134,110,167,0.2)' },
          angleLines:  { color: 'rgba(134,110,167,0.2)' },
          ticks:       { display: false, stepSize: 25 },
          pointLabels: { color: C.textMuted, font: { size: 10, weight: '700' } },
        },
      },
    },
  });
}

// ── CHART 3 — Card Rarity Doughnut ───────────────────────────────────────────
function createRarityDonutChart(cards) {
  const canvas = document.getElementById('rarityChart');
  if (!canvas || !window.Chart) return;

  if (!cards?.length) {
    const wrap = canvas.closest('.chart-wrap');
    if (wrap) wrap.innerHTML = '<p style="color:var(--secondary-text);font-size:0.85rem;padding:1.4rem;text-align:center;">Play some runs to see card data.</p>';
    return;
  }
  if (rarityChart) rarityChart.destroy();

  // Aggregate times_collected per rarity
  const map = {};
  for (const c of cards) map[c.rarity] = (map[c.rarity] || 0) + c.times_collected;

  const order  = ['legendary', 'epic', 'rare', 'common', 'uncommon'];
  const active = order.filter(r => map[r]);
  const labels = active.map(cap);
  const data   = active.map(r => map[r]);
  const colors = active.map(r => RARITY_COLORS[r] ?? '#888888');
  const total  = data.reduce((a, b) => a + b, 0);

  const ctx = canvas.getContext('2d');
  rarityChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map(c => `${c}99`),
        borderColor:     colors,
        borderWidth:     2,
        hoverOffset:     12,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            label: ctx => {
              const p = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${ctx.parsed} cards (${p}%)`;
            },
          },
        },
      },
    },
  });
}

// ── CHART 4 — Top Cards (horizontal bar) ─────────────────────────────────────
function createCardsChart(cards) {
  const canvas = document.getElementById('cardsChart');
  if (!canvas || !window.Chart) return;

  if (!cards?.length) {
    const wrap = canvas.closest('.chart-wrap');
    if (wrap) wrap.innerHTML = '<p style="color:var(--secondary-text);font-size:0.9rem;padding:1.2rem;">Play some runs to see your top cards.</p>';
    return;
  }

  const top  = cards.slice(0, 8);
  const wrap = canvas.closest('.chart-wrap');
  if (wrap) wrap.style.height = `${Math.max(200, top.length * 44 + 50)}px`;
  if (cardsChart) cardsChart.destroy();

  const ctx = canvas.getContext('2d');
  cardsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(c => c.card_name),
      datasets: [{
        data:            top.map(c => c.times_collected),
        backgroundColor: top.map(c => `${RARITY_COLORS[c.rarity] ?? C.textMuted}88`),
        borderColor:     top.map(c =>  RARITY_COLORS[c.rarity] ?? C.textMuted),
        borderWidth:     1.5,
        borderRadius:    5,
        borderSkipped:   false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            label:      ctx => ` Collected ×${ctx.parsed.x}`,
            afterLabel: ctx => {
              const c = top[ctx.dataIndex];
              return ` ${cap(c.rarity)} · ${cap(c.subtype ?? c.card_type)}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid:  { color: C.grid },
          ticks: { color: C.tick, stepSize: 1 },
        },
        y: {
          grid:  { display: false },
          ticks: { color: '#c8b8e8', font: { size: 12 } },
        },
      },
    },
  });
}

// ── CHART 5 — Leaderboard (horizontal bar) ────────────────────────────────────
function createLeaderboardChart(rows, currentUsername) {
  const canvas = document.getElementById('lbChart');
  if (!canvas || !window.Chart || !rows?.length) return;

  const wrap = canvas.closest('.chart-wrap');
  if (wrap) wrap.style.height = `${Math.max(200, rows.length * 36 + 50)}px`;
  if (lbChart) lbChart.destroy();

  // Colour scale: orange (1st) → muted purples → subtle for the rest
  // Current user always gets teal regardless of position
  const bg = rows.map((r, i) => {
    if (currentUsername && r.username === currentUsername) return 'rgba(0,255,185,0.2)';
    if (i === 0) return 'rgba(255,143,51,0.45)';
    if (i === 1) return 'rgba(134,110,167,0.35)';
    if (i === 2) return 'rgba(76,40,117,0.55)';
    return 'rgba(54,20,92,0.7)';
  });
  const border = rows.map((r, i) => {
    if (currentUsername && r.username === currentUsername) return C.teal;
    if (i === 0) return C.orange;
    if (i === 1) return C.textMuted;
    if (i === 2) return '#6a4f85';
    return 'rgba(134,110,167,0.25)';
  });

  const ctx = canvas.getContext('2d');
  lbChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rows.map(r => r.username),
      datasets: [{
        data:            rows.map(r => r.best_score ?? 0),
        backgroundColor: bg,
        borderColor:     border,
        borderWidth:     1.5,
        borderRadius:    5,
        borderSkipped:   false,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...TT,
          callbacks: {
            label:      ctx => ` Best Score: ${ctx.parsed.x.toLocaleString()}`,
            afterLabel: ctx => {
              const r = rows[ctx.dataIndex];
              return [` Victories: ${r.victories ?? 0}`, ` Runs: ${r.total_runs ?? 0}`];
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid:  { color: C.grid },
          ticks: {
            color:    C.tick,
            callback: v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v,
          },
        },
        y: {
          grid:  { display: false },
          ticks: {
            color: ctx => (currentUsername && rows[ctx.index]?.username === currentUsername)
              ? C.teal : C.textMuted,
            font: { size: 12 },
          },
        },
      },
    },
  });
}

// ── Personal summary (bento cells) ───────────────────────────────────────────
function populateSummary(s, username) {
  document.getElementById('pcAvatar').textContent    = username ? username.charAt(0).toUpperCase() : '?';
  document.getElementById('pcName').textContent      = username ?? '–';
  document.getElementById('pcMeta').textContent      = `${fmt(s.total_runs)} runs completed`;
  document.getElementById('pcBestScore').textContent = fmt(s.best_score);
  document.getElementById('pcWinRate').textContent   = pct(s.win_rate_pct);

  const rate = parseFloat(s.win_rate_pct) || 0;
  document.getElementById('ringPct').textContent = pct(s.win_rate_pct);
  document.getElementById('ringW').textContent   = `${fmt(s.victories)} W`;
  document.getElementById('ringL').textContent   = `${fmt(s.defeats)} L`;
  setRing(rate);

  const total = (s.victories || 0) + (s.defeats || 0);
  document.getElementById('wlTotal').textContent  = fmt(s.total_runs);
  document.getElementById('wlWins').textContent   = `${fmt(s.victories)} W`;
  document.getElementById('wlLosses').textContent = `${fmt(s.defeats)} L`;
  if (total > 0) {
    setBar('wlBarWin',  (s.victories / total) * 100);
    setBar('wlBarLoss', (s.defeats   / total) * 100);
  }

  document.getElementById('bestScore').textContent = fmt(s.best_score);
  document.getElementById('avgScore').textContent  = fmt(s.avg_score);
  document.getElementById('totalKills').textContent = fmt(s.total_enemies_killed);
  document.getElementById('avgKills').textContent   = `${parseFloat(s.avg_enemies_per_run || 0).toFixed(1)} avg / run`;
  document.getElementById('totalRooms').textContent = fmt(s.total_rooms_cleared);
  document.getElementById('avgRooms').textContent   = `${parseFloat(s.avg_rooms_per_run || 0).toFixed(1)} avg / run`;

  const dealt  = s.total_damage_dealt || 0;
  const taken  = s.total_damage_taken || 0;
  const maxDmg = Math.max(dealt, taken, 1);
  document.getElementById('dmgDealt').textContent = fmt(dealt);
  document.getElementById('dmgTaken').textContent = fmt(taken);
  setBar('dmgBarDealt', (dealt / maxDmg) * 100);
  setBar('dmgBarTaken', (taken / maxDmg) * 100);
  document.getElementById('dmgRatio').textContent =
    dealt > 0 && taken > 0 ? `${(dealt / taken).toFixed(2)}:1 dealt/taken ratio` : '';

  buildMilestones(s);
}

function buildMilestones(summary) {
  const grid = document.getElementById('milestonesGrid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const m of MILESTONES) {
    const unlocked = m.check(summary);
    const el = document.createElement('div');
    el.className = `milestone${unlocked ? ' unlocked' : ''}`;
    el.innerHTML = `
      <div class="milestone__icon">${m.icon}</div>
      <div class="milestone__text">
        <span class="milestone__label">${m.label}</span>
        <span class="milestone__desc">${m.desc}</span>
      </div>
      <span class="milestone__badge">${unlocked ? 'DONE' : 'LOCKED'}</span>
    `;
    grid.appendChild(el);
  }
}

function populateGlobal({ overview }) {
  if (!overview) return;
  document.getElementById('gPlayers').textContent   = fmt(overview.total_players);
  document.getElementById('gRuns').textContent      = fmt(overview.total_runs);
  document.getElementById('gVictories').textContent = fmt(overview.total_victories);
  document.getElementById('gWinRate').textContent   = pct(overview.global_win_rate_pct);
  document.getElementById('gRecord').textContent    = fmt(overview.record_score);
}

function populateLeaderboard(rows, currentUsername) {
  createLeaderboardChart(rows, currentUsername);

  const tbody = document.getElementById('lbBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!rows?.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--secondary-text);padding:2rem;">No runs yet.</td></tr>';
    return;
  }

  const rankClass = { 1: 'lb-row--top1', 2: 'lb-row--top2', 3: 'lb-row--top3' };
  rows.forEach((row, i) => {
    const rank = i + 1;
    const isMe = currentUsername && row.username === currentUsername;
    const tr   = document.createElement('tr');
    tr.className = ['lb-row', rankClass[rank] ?? '', isMe ? 'lb-row--me' : ''].filter(Boolean).join(' ');
    tr.innerHTML = `
      <td>${rank}</td>
      <td>${row.username}${isMe ? ' <span style="font-size:0.6rem;color:var(--acent);letter-spacing:1px;">(YOU)</span>' : ''}</td>
      <td class="lb-score">${fmt(row.best_score)}</td>
      <td class="lb-victories">${fmt(row.victories)}</td>
      <td>${fmt(row.total_runs)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Main init ─────────────────────────────────────────────────────────────────
async function init() {
  initChartDefaults();

  window.addEventListener('scroll', () => {
    document.querySelector('header')?.classList.toggle('scrolled', window.scrollY > 60);
  });
  document.getElementById('userAvatar')?.addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.remove('open');
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    document.getElementById('user').style.display       = 'none';
    document.getElementById('signupUser').style.display = 'flex';
    document.getElementById('noAuthOverlay')?.classList.add('visible');
  });

  const username = await initHeader();
  const hasAuth  = !!localStorage.getItem('token');
  if (!hasAuth) document.getElementById('noAuthOverlay')?.classList.add('visible');

  const [summaryRes, cardsRes, globalRes, lbRes, runsRes] = await Promise.allSettled([
    hasAuth ? apiFetch('/stats/me/summary', true) : Promise.reject('no-auth'),
    hasAuth ? apiFetch('/stats/me/cards',   true) : Promise.reject('no-auth'),
    apiFetch('/stats/global', false),
    apiFetch('/leaderboard',  false),
    hasAuth ? apiFetch('/stats/me/runs',    true) : Promise.reject('no-auth'),
  ]);

  const summary = summaryRes.status === 'fulfilled' ? summaryRes.value : null;
  const cards   = cardsRes.status   === 'fulfilled' ? cardsRes.value   : [];
  const runs    = runsRes.status    === 'fulfilled' ? runsRes.value    : [];

  if (summary) populateSummary(summary, username);

  // Small delay so canvas elements have their final painted size before Chart.js reads them
  setTimeout(() => {
    createScoreHistoryChart(runs);
    createRadarChart(summary, username);
    createRarityDonutChart(cards);
    createCardsChart(cards);
  }, 80);

  if (globalRes.status === 'fulfilled') populateGlobal(globalRes.value);

  if (lbRes.status === 'fulfilled') {
    populateLeaderboard(lbRes.value, username);
  } else {
    const tbody = document.getElementById('lbBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--secondary-text);padding:2rem;">Could not load leaderboard.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', init);
