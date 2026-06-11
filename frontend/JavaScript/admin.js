const BASE = 'http://localhost:3001';

const C = {
  orange:    '#ff8f33',
  teal:      '#00ffb9',
  red:       '#e81132',
  textMuted: '#866ea7',
  grid:      'rgba(134,110,167,0.15)',
  tick:      '#7a5f95',
  tooltip_bg:'rgba(22,5,44,0.96)',
};

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

const fmt  = n  => (n == null || n === '') ? '–' : Number(n).toLocaleString();
const fmtF = n  => n == null ? '–' : parseFloat(n).toFixed(1);
const pct  = n  => n == null ? '–' : `${parseFloat(n).toFixed(1)}%`;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '–';

let winRateChart = null;
let scoresChart  = null;

// ── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(path) {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${BASE}${path}`, { headers });
  if (res.status === 401) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  if (res.status === 403) throw Object.assign(new Error('Forbidden'),    { status: 403 });
  if (!res.ok)            throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Access denied overlay ─────────────────────────────────────────────────────
function showDenied(msg) {
  const el = document.getElementById('accessDenied');
  if (msg) document.getElementById('accessDeniedMsg').textContent = msg;
  el?.classList.add('visible');
}

// ── Header ────────────────────────────────────────────────────────────────────
function initHeader() {
  const token    = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (!token) return;

  const display = username ?? 'Admin';
  document.getElementById('usernameDisplay').textContent = display;
  document.getElementById('usernameInitial').textContent = display.charAt(0).toUpperCase();
  document.getElementById('user').style.display = 'flex';

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
    window.location.href = '/frontend/HTML/login.html';
  });

  window.addEventListener('scroll', () => {
    document.querySelector('header')?.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── Global overview ───────────────────────────────────────────────────────────
function populateGlobal(data) {
  const ov = data?.overview;
  if (!ov) return;
  document.getElementById('gPlayers').textContent   = fmt(ov.total_players);
  document.getElementById('gRuns').textContent      = fmt(ov.total_runs);
  document.getElementById('gVictories').textContent = fmt(ov.total_victories);
  document.getElementById('gWinRate').textContent   = pct(ov.global_win_rate_pct);
  document.getElementById('gRecord').textContent    = fmt(ov.record_score);
}

// ── Averages section ──────────────────────────────────────────────────────────
function populateAverages(a) {
  if (!a) return;
  document.getElementById('avgRuns').textContent      = fmtF(a.avg_runs_per_player);
  document.getElementById('avgWinRate').textContent   = pct(a.avg_win_rate);
  document.getElementById('avgBestScore').textContent = fmt(Math.round(a.avg_best_score ?? 0));
  document.getElementById('avgScoreRun').textContent  = fmt(Math.round(a.avg_score_overall ?? 0));
  document.getElementById('avgKills').textContent     = fmtF(a.avg_kills_per_run);
  document.getElementById('avgRooms').textContent     = fmtF(a.avg_rooms_per_run);

  const dealt  = a.avg_damage_dealt ?? 0;
  const taken  = a.avg_damage_taken ?? 0;
  const maxDmg = Math.max(dealt, taken, 1);
  document.getElementById('avgDmgDealt').textContent = fmt(Math.round(dealt));
  document.getElementById('avgDmgTaken').textContent = fmt(Math.round(taken));

  setTimeout(() => {
    const setBar = (id, w) => {
      const el = document.getElementById(id);
      if (el) el.style.width = `${Math.max(0, Math.min(100, w))}%`;
    };
    setBar('avgDmgBarDealt', (dealt / maxDmg) * 100);
    setBar('avgDmgBarTaken', (taken / maxDmg) * 100);
  }, 120);
}

// ── CHART: Win Rate per player ────────────────────────────────────────────────
function createWinRateChart(players) {
  const canvas = document.getElementById('winRateChart');
  if (!canvas || !window.Chart || !players?.length) return;

  const top  = players.slice(0, 10);
  const wrap = canvas.closest('.chart-wrap');
  if (wrap) wrap.style.height = `${Math.max(220, top.length * 36 + 60)}px`;
  if (winRateChart) winRateChart.destroy();

  const colors = top.map(p => {
    const r = parseFloat(p.win_rate_pct) || 0;
    if (r >= 60) return 'rgba(0,255,185,0.55)';
    if (r >= 40) return 'rgba(255,143,51,0.55)';
    return 'rgba(232,17,50,0.45)';
  });
  const borders = top.map(p => {
    const r = parseFloat(p.win_rate_pct) || 0;
    if (r >= 60) return C.teal;
    if (r >= 40) return C.orange;
    return C.red;
  });

  const ctx = canvas.getContext('2d');
  winRateChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(p => p.username),
      datasets: [{
        data:            top.map(p => parseFloat(p.win_rate_pct) || 0),
        backgroundColor: colors,
        borderColor:     borders,
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
            label:      ctx => ` Win Rate: ${ctx.parsed.x.toFixed(1)}%`,
            afterLabel: ctx => {
              const p = top[ctx.dataIndex];
              return ` ${p.victories} W  /  ${p.defeats} L  (${p.total_runs} runs)`;
            },
          },
        },
      },
      scales: {
        x: {
          min: 0, max: 100,
          grid:  { color: C.grid },
          ticks: { color: C.tick, callback: v => `${v}%` },
        },
        y: {
          grid:  { display: false },
          ticks: { color: '#c8b8e8', font: { size: 12 } },
        },
      },
    },
  });
}

// ── CHART: Best Score per player ──────────────────────────────────────────────
function createScoresChart(players) {
  const canvas = document.getElementById('scoresChart');
  if (!canvas || !window.Chart || !players?.length) return;

  const top  = players.slice(0, 10);
  const wrap = canvas.closest('.chart-wrap');
  if (wrap) wrap.style.height = `${Math.max(220, top.length * 36 + 60)}px`;
  if (scoresChart) scoresChart.destroy();

  const bg = top.map((_, i) => {
    if (i === 0) return 'rgba(255,143,51,0.45)';
    if (i === 1) return 'rgba(134,110,167,0.35)';
    if (i === 2) return 'rgba(76,40,117,0.55)';
    return 'rgba(54,20,92,0.7)';
  });
  const border = top.map((_, i) => {
    if (i === 0) return C.orange;
    if (i === 1) return C.textMuted;
    if (i === 2) return '#6a4f85';
    return 'rgba(134,110,167,0.25)';
  });

  const ctx = canvas.getContext('2d');
  scoresChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(p => p.username),
      datasets: [{
        data:            top.map(p => p.best_score ?? 0),
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
              const p = top[ctx.dataIndex];
              return [` Avg Score: ${fmt(Math.round(p.avg_score))}`, ` Runs: ${p.total_runs}`];
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid:  { color: C.grid },
          ticks: { color: C.tick, callback: v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v },
        },
        y: {
          grid:  { display: false },
          ticks: { color: '#c8b8e8', font: { size: 12 } },
        },
      },
    },
  });
}

// ── Players table ─────────────────────────────────────────────────────────────
function populatePlayers(players) {
  const tbody = document.getElementById('playersBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!players?.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--secondary-text);">No players found.</td></tr>';
    return;
  }

  const rankClass = { 1: 'pt-rank--1', 2: 'pt-rank--2', 3: 'pt-rank--3' };

  players.forEach((p, i) => {
    const rank = i + 1;
    const noRuns = p.total_runs === 0;
    const tr = document.createElement('tr');
    tr.className = rankClass[rank] ?? '';
    tr.innerHTML = `
      <td>${rank}</td>
      <td class="pt-username">${p.username}</td>
      <td>${noRuns ? '<span class="pt-novice">no runs</span>' : fmt(p.total_runs)}</td>
      <td>
        <span style="color:var(--acent)">${fmt(p.victories)}</span>
        <span style="color:var(--secondary-text)"> / </span>
        <span style="color:var(--error)">${fmt(p.defeats)}</span>
      </td>
      <td class="pt-winrate">${noRuns ? '–' : pct(p.win_rate_pct)}</td>
      <td class="pt-score">${noRuns ? '–' : fmt(p.best_score)}</td>
      <td>${noRuns ? '–' : fmt(Math.round(p.avg_score))}</td>
      <td>${noRuns ? '–' : fmtF(p.avg_enemies_per_run)}</td>
      <td>${noRuns ? '–' : fmtF(p.avg_rooms_per_run)}</td>
      <td style="color:var(--secondary-text);font-size:0.8rem;">${fmtDate(p.created_at)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Chart.js defaults ─────────────────────────────────────────────────────────
function initChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.font.family = "'Nunito', sans-serif";
  Chart.defaults.font.size   = 11;
  Chart.defaults.color       = C.textMuted;
  Chart.defaults.borderColor = C.grid;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function init() {
  initChartDefaults();
  initHeader();

  if (!localStorage.getItem('token')) {
    showDenied('You need to be logged in as an admin to view this page.');
    return;
  }

  try {
    const [players, averages, globalData] = await Promise.all([
      apiFetch('/admin/players'),
      apiFetch('/admin/averages'),
      apiFetch('/stats/global'),
    ]);

    populateGlobal(globalData);
    populateAverages(averages);
    populatePlayers(players);

    setTimeout(() => {
      createWinRateChart(players);
      createScoresChart(players);
    }, 80);

  } catch (err) {
    if (err.status === 401) {
      showDenied('You need to be logged in as an admin to view this page.');
    } else if (err.status === 403) {
      showDenied('Your account does not have admin privileges.');
    } else {
      showDenied('Could not load admin data. Make sure the server is running.');
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
