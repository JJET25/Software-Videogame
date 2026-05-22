const BASE_URL = 'http://localhost:3001';

export async function fetchCards() {
    const res = await fetch(`${BASE_URL}/cards`);
    if (!res.ok) throw new Error(`fetchCards failed: ${res.status}`);
    return res.json();
}
