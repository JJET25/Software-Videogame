const BASE_URL = 'http://localhost:3001';

// Fetches the full card catalog from the backend API
export async function fetchCards() {
    const res = await fetch(`${BASE_URL}/cards`);
    if (!res.ok) throw new Error(`fetchCards failed: ${res.status}`);
    return res.json();
}
