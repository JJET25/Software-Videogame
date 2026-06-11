// Api.js — HTTP client functions for communicating with the Dimension Deck backend API.
const BASE_URL = "http://localhost:3001";

// Retrieves the stored auth token from local storage.
function getToken() {
  return localStorage.getItem("token");
}

// Fetches all available cards from the server.
export async function fetchCards() {
  const res = await fetch(`${BASE_URL}/cards`);
  if (!res.ok) throw new Error(`fetchCards failed: ${res.status}`);
  return res.json();
}

// Fetches only the starter cards intended for new players.
export async function fetchStarterCards() {
  const res = await fetch(`${BASE_URL}/cards/starter`);
  if (!res.ok) throw new Error(`fetchStarterCards failed: ${res.status}`);
  return res.json();
}

// Creates a new run for the authenticated player and returns the run ID.
export async function createRun() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${BASE_URL}/runs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

// Finalizes a run with outcome data and returns the computed score.
export async function endRun(runId, data) {
  const token = getToken();
  if (!token || !runId) return null;
  try {
    const res = await fetch(`${BASE_URL}/runs/${runId}/end`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[endRun] HTTP ${res.status}:`, err);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[endRun] Network error:", err.message);
    return null;
  }
}

// Fetches the full card list; returns null on any error instead of throwing.
export async function fetchAllCards() {
  try {
    const res = await fetch(`${BASE_URL}/cards`);
    if (!res.ok) throw new Error("cards fetch failed");
    return await res.json();
  } catch (err) {
    console.warn("fetchAllCards failed:", err);
    return null;
  }
}
