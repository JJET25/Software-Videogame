const BASE_URL = 'http://localhost:3001';

function getToken() {
    return localStorage.getItem('token');
}

// ── Cards ────────────────────────────────────────────────────────────────────

export async function fetchCards() {
    const res = await fetch(`${BASE_URL}/cards`);
    if (!res.ok) throw new Error(`fetchCards failed: ${res.status}`);
    return res.json();
}

export async function fetchStarterCards() {
    const res = await fetch(`${BASE_URL}/cards/starter`);
    if (!res.ok) throw new Error(`fetchStarterCards failed: ${res.status}`);
    return res.json();
}

// ── Runs ─────────────────────────────────────────────────────────────────────

// Creates a new run for the logged-in player and returns { runId }
export async function createRun() {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/runs`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
}

// Finalises a run with the given status and stats, returns { score }
export async function endRun(runId, data) {
    const token = getToken();
    if (!token || !runId) return null;
    const res = await fetch(`${BASE_URL}/runs/${runId}/end`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
}
