const BASE = 'http://localhost:3001';
const RING_C = 251.33; // circumference of r=40 circle

// ── Milestone definitions (checked client-side against summary data) ─────────
const MILESTONES = [
  {
    id: 'first_win',
    label: 'First Victory',
    desc: 'Win your first run',
    icon: '✓',
    check: s => s.victories >= 1,
  },
  {
    id: 'veteran',
    label: 'Veteran',
    desc: 'Complete 10 runs',
    icon: 'X',
    check: s => s.total_runs >= 10,
  },
  {
    id: 'slayer',
    label: 'Enemy Slayer',
    desc: 'Kill 100 enemies total',
    icon: '100',
    check: s => s.total_enemies_killed >= 100,
  },
  {
    id: 'crawler',
    label: 'Dungeon Crawler',
    desc: 'Clear 50 rooms total',
    icon: '50',
    check: s => s.total_rooms_cleared >= 50,
  },
  {
    id: 'scorer',
    label: 'High Scorer',
    desc: 'Reach a score of 5,000',
    icon: '★',
    check: s => s.best_score >= 5000,
  },
  {
    id: 'dealer',
    label: 'Damage Dealer',
    desc: 'Deal 10,000 total damage',
    icon: '!',
    check: s => s.total_damage_dealt >= 10000,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || n === '' || n === undefined) return '–';
  return Number(n).toLocaleString();
}

function pct(n) {
  if (n == null) return '–';
  return `${parseFloat(n).toFixed(1)}%`;
}

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

// ── Auth header (shared with other pages) ────────────────────────────────────
async function initHeader() {
  const token = localStorage.getItem('token');
  const signupEl = document.getElementById('signupUser');
  const userEl   = document.getElementById('user');

  if (!token) return;

  try {
    const data = await apiFetch('/users/me', true);
    document.getElementById('usernameDisplay').textContent = data.username;
    document.getElementById('usernameInitial').textContent = data.username.charAt(0).toUpperCase();
    if (signupEl) signupEl.style.display = 'none';
    if (userEl)   userEl.style.display   = 'flex';
    return data.username;
  } catch {
    localStorage.removeItem('token');
    return null;
  }
}

// ── Ring chart ────────────────────────────────────────────────────────────────
function setRing(winRatePct) {
  const ring = document.getElementById('winRateRing');
  if (!ring) return;
  const offset = RING_C * (1 - (winRatePct / 100));
  // Small delay so the CSS transition plays on page load
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 120);
}

// ── Animated bar width ────────────────────────────────────────────────────────
function setBar(id, widthPct) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => { el.style.width = `${Math.max(0, Math.min(100, widthPct))}%`; }, 120);
}

// ── Populate personal summary ─────────────────────────────────────────────────
function populateSummary(s, username) {
  // Player card
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  document.getElementById('pcAvatar').textContent     = initial;
  document.getElementById('pcName').textContent       = username ?? '–';
  document.getElementById('pcMeta').textContent       = `${fmt(s.total_runs)} runs completed`;
  document.getElementById('pcBestScore').textContent  = fmt(s.best_score);
  document.getElementById('pcWinRate').textContent    = pct(s.win_rate_pct);

  // Ring
  const rate = parseFloat(s.win_rate_pct) || 0;
  document.getElementById('ringPct').textContent = pct(s.win_rate_pct);
  document.getElementById('ringW').textContent   = `${fmt(s.victories)} W`;
  document.getElementById('ringL').textContent   = `${fmt(s.defeats)} L`;
  setRing(rate);

  // W/L bar
  const total = (s.victories || 0) + (s.defeats || 0);
  document.getElementById('wlTotal').textContent  = fmt(s.total_runs);
  document.getElementById('wlWins').textContent   = `${fmt(s.victories)} W`;
  document.getElementById('wlLosses').textContent = `${fmt(s.defeats)} L`;
  if (total > 0) {
    setBar('wlBarWin',  (s.victories / total) * 100);
    setBar('wlBarLoss', (s.defeats   / total) * 100);
  }

  // Scores
  document.getElementById('bestScore').textContent = fmt(s.best_score);
  document.getElementById('avgScore').textContent  = fmt(s.avg_score);

  // Kills & rooms
  document.getElementById('totalKills').textContent = fmt(s.total_enemies_killed);
  document.getElementById('avgKills').textContent   = `${parseFloat(s.avg_enemies_per_run || 0).toFixed(1)} avg / run`;
  document.getElementById('totalRooms').textContent = fmt(s.total_rooms_cleared);
  document.getElementById('avgRooms').textContent   = `${parseFloat(s.avg_rooms_per_run || 0).toFixed(1)} avg / run`;

  // Damage bars (each relative to the larger value for visual contrast)
  const dealt = s.total_damage_dealt || 0;
  const taken = s.total_damage_taken || 0;
  const maxDmg = Math.max(dealt, taken, 1);

  document.getElementById('dmgDealt').textContent = fmt(dealt);
  document.getElementById('dmgTaken').textContent = fmt(taken);
  setBar('dmgBarDealt', (dealt / maxDmg) * 100);
  setBar('dmgBarTaken', (taken / maxDmg) * 100);

  const ratio = dealt > 0 && taken > 0
    ? `${(dealt / taken).toFixed(2)}:1 dealt/taken ratio`
    : '';
  document.getElementById('dmgRatio').textContent = ratio;

  // Milestones
  buildMilestones(s);
}

// ── Milestones ────────────────────────────────────────────────────────────────
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

// ── Favorite cards ────────────────────────────────────────────────────────────
function populateCards(cards) {
  const strip = document.getElementById('favStrip');
  if (!strip) return;
  strip.innerHTML = '';

  if (!cards?.length) {
    strip.innerHTML = '<p style="color:var(--secondary-text);font-size:0.9rem;">No card data yet — play some runs first.</p>';
    return;
  }

  const top = cards.slice(0, 8);
  for (const c of top) {
    const chip = document.createElement('div');
    chip.className = `fav-chip rarity--${c.rarity ?? 'common'}`;
    chip.innerHTML = `
      <span class="fav-chip__name">${c.card_name}</span>
      <span class="fav-chip__sub">${cap(c.rarity)} · ${cap(c.subtype)}</span>
      <span class="fav-chip__count">×${c.times_collected}</span>
    `;
    strip.appendChild(chip);
  }
}

// ── Global stats ──────────────────────────────────────────────────────────────
function populateGlobal({ overview, top_cards }) {
  if (!overview) return;
  document.getElementById('gPlayers').textContent   = fmt(overview.total_players);
  document.getElementById('gRuns').textContent      = fmt(overview.total_runs);
  document.getElementById('gVictories').textContent = fmt(overview.total_victories);
  document.getElementById('gWinRate').textContent   = pct(overview.global_win_rate_pct);
  document.getElementById('gRecord').textContent    = fmt(overview.record_score);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function populateLeaderboard(rows, currentUsername) {
  const tbody = document.getElementById('lbBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!rows?.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--secondary-text);padding:2rem;">No runs yet.</td></tr>';
    return;
  }

  const rankClass = { 1: 'lb-row--top1', 2: 'lb-row--top2', 3: 'lb-row--top3' };

  rows.forEach((row, i) => {
    const rank     = i + 1;
    const isMe     = currentUsername && row.username === currentUsername;
    const rankMark = rank === 1 ? '1' : rank === 2 ? '2' : rank === 3 ? '3' : rank;

    const tr = document.createElement('tr');
    tr.className = [
      'lb-row',
      rankClass[rank] ?? '',
      isMe ? 'lb-row--me' : '',
    ].filter(Boolean).join(' ');

    tr.innerHTML = `
      <td>${rankMark}</td>
      <td>${row.username}${isMe ? ' <span style="font-size:0.6rem;color:var(--acent);letter-spacing:1px;">(YOU)</span>' : ''}</td>
      <td class="lb-score">${fmt(row.best_score)}</td>
      <td class="lb-victories">${fmt(row.victories)}</td>
      <td>${fmt(row.total_runs)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function cap(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Main init ─────────────────────────────────────────────────────────────────
async function init() {
  // Header scroll
  window.addEventListener('scroll', () => {
    document.querySelector('header')?.classList.toggle('scrolled', window.scrollY > 60);
  });

  // Dropdown
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
    document.getElementById('user').style.display   = 'none';
    document.getElementById('signupUser').style.display = 'flex';
    document.getElementById('noAuthOverlay')?.classList.add('visible');
  });

  // Auth
  const username = await initHeader();
  const hasAuth = !!localStorage.getItem('token');

  if (!hasAuth) {
    document.getElementById('noAuthOverlay')?.classList.add('visible');
  }

  // Fetch all four endpoints in parallel — each failure is isolated
  const [summaryResult, cardsResult, globalResult, lbResult] = await Promise.allSettled([
    hasAuth ? apiFetch('/stats/me/summary', true) : Promise.reject('no-auth'),
    hasAuth ? apiFetch('/stats/me/cards',   true) : Promise.reject('no-auth'),
    apiFetch('/stats/global',   false),
    apiFetch('/leaderboard',    false),
  ]);

  if (summaryResult.status === 'fulfilled') {
    populateSummary(summaryResult.value, username);
  }

  if (cardsResult.status === 'fulfilled') {
    populateCards(cardsResult.value);
  } else {
    // Clear skeleton if no cards
    const strip = document.getElementById('favStrip');
    if (strip) strip.innerHTML = '<p style="color:var(--secondary-text);font-size:0.9rem;padding:0.5rem 0;">Play some runs to see your favorite cards.</p>';
  }

  if (globalResult.status === 'fulfilled') {
    populateGlobal(globalResult.value);
  }

  if (lbResult.status === 'fulfilled') {
    populateLeaderboard(lbResult.value, username);
  } else {
    const tbody = document.getElementById('lbBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--secondary-text);padding:2rem;">Could not load leaderboard.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', init);
