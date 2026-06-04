// Card data — stats from backend/schema.sql
// Set image path once the art is ready; null shows a placeholder.
const CARDS = [
  // ── ACTIVE · MELEE ─────────────────────────────────────────────────────────
  {
    name: "Quick Strike",
    type: "active", rarity: "common",
    description: "Deal damage to enemies within 80 px in a forward cone.",
    stats: ["20 DMG", "80 px", "3 s CD"],
    starter: true,
    image: "../../Assets/Sprites/action cards/action-card.png",
  },
  {
    name: "Iron Fist",
    type: "active", rarity: "rare",
    description: "A powerful close-range blow dealing 55 damage within 28 px.",
    stats: ["55 DMG", "28 px", "5 s CD"],
    starter: false,
    image: null,
  },
  {
    name: "Nova Burst",
    type: "active", rarity: "epic",
    description: "Full-circle explosion dealing 110 damage to all enemies within 72 px.",
    stats: ["110 DMG", "360°", "9 s CD"],
    starter: false,
    image: null,
  },
  {
    name: "Shadow Blade",
    type: "active", rarity: "legendary",
    description: "A devastating strike dealing 180 damage to enemies within 48 px.",
    stats: ["180 DMG", "48 px", "15 s CD"],
    starter: false,
    image: null,
  },
  // ── ACTIVE · HEAL ──────────────────────────────────────────────────────────
  {
    name: "Heal Pulse",
    type: "active", rarity: "common",
    description: "Instantly restore 25 HP.",
    stats: ["25 HP", "10 s CD"],
    starter: true,
    image: "../../Assets/Sprites/action cards/heal-card.png",
  },
  {
    name: "Mending Wave",
    type: "active", rarity: "epic",
    description: "Release a healing wave that restores 70 HP.",
    stats: ["70 HP", "15 s CD"],
    starter: false,
    image: null,
  },
  {
    name: "Phoenix Elixir",
    type: "active", rarity: "legendary",
    description: "Consume a legendary elixir to fully restore all HP.",
    stats: ["FULL HP", "30 s CD"],
    starter: false,
    image: null,
  },
  // ── ACTIVE · DRAIN ─────────────────────────────────────────────────────────
  {
    name: "Blood Siphon",
    type: "active", rarity: "rare",
    description: "Drain the nearest enemy for 40 damage and restore 20 HP.",
    stats: ["40 DMG", "+20 HP", "12 s CD"],
    starter: false,
    image: null,
  },
  // ── ACTIVE · DEFENSE ───────────────────────────────────────────────────────
  {
    name: "Wood Shield",
    type: "active", rarity: "common",
    description: "Absorb the next 20 damage with a temporary shield.",
    stats: ["20 SHIELD", "8 s CD"],
    starter: true,
    image: "../../Assets/Sprites/action cards/wood-shield.png",
  },
  {
    name: "Stone Wall",
    type: "active", rarity: "rare",
    description: "Erect a wall of stone that absorbs the next 50 damage.",
    stats: ["50 SHIELD", "12 s CD"],
    starter: false,
    image: null,
  },
  {
    name: "Mirror Guard",
    type: "active", rarity: "epic",
    description: "Gain 35 shield and 1.5 s of invincibility.",
    stats: ["35 SHIELD", "1.5 s INVINC", "14 s CD"],
    starter: false,
    image: null,
  },
  {
    name: "Diamond Fortress",
    type: "active", rarity: "legendary",
    description: "Crystallize your body, absorbing the next 100 damage.",
    stats: ["100 SHIELD", "18 s CD"],
    starter: false,
    image: null,
  },
  // ── AUTOMATIC ──────────────────────────────────────────────────────────────
  {
    name: "Lifetap",
    type: "automatic", rarity: "common",
    description: "Restore 20 HP each time you kill an enemy.",
    stats: ["20 HP", "On Kill"],
    starter: false,
    image: null,
  },
  {
    name: "Iron Skin",
    type: "automatic", rarity: "common",
    description: "Gain 8 shield each time your card hits an enemy.",
    stats: ["+8 SHIELD", "On Hit"],
    starter: false,
    image: null,
  },
  {
    name: "Rebound",
    type: "automatic", rarity: "rare",
    description: "When hit, deal 15 damage to enemies within 48 px.",
    stats: ["15 DMG", "On Damage"],
    starter: false,
    image: null,
  },
  {
    name: "Berserker Rush",
    type: "automatic", rarity: "rare",
    description: "Dashing deals 20 damage to enemies within 32 px.",
    stats: ["20 DMG", "On Dash"],
    starter: false,
    image: null,
  },
  {
    name: "Last Stand",
    type: "automatic", rarity: "epic",
    description: "When hit below 30% HP, gain 2 s of invincibility.",
    stats: ["2 s INVINC", "< 30% HP", "On Damage"],
    starter: false,
    image: null,
  },
  {
    name: "Chain Kill",
    type: "automatic", rarity: "epic",
    description: "Killing an enemy deals 25 AoE damage to all others within 64 px.",
    stats: ["25 DMG", "64 px", "On Kill"],
    starter: false,
    image: null,
  },
];

// ── Render ────────────────────────────────────────────────────────────────────
function buildCard(card) {
  const art = card.image
    ? `<img src="${card.image}" alt="${card.name}" loading="lazy">`
    : `<div class="card-img-placeholder">${card.name.toUpperCase()}</div>`;

  const ribbon = card.starter ? `<span class="card-starter">STARTER</span>` : "";

  const pills = card.stats.map(s => `<span class="stat-pill">${s}</span>`).join("");

  return `
<li class="card-item" data-type="${card.type}" data-rarity="${card.rarity}">
  <div class="card-img-wrap">
    ${art}
    ${ribbon}
  </div>
  <div class="card-info">
    <p class="card-rarity">${card.rarity.toUpperCase()} · ${card.type.toUpperCase()}</p>
    <h3 class="card-name">${card.name}</h3>
    <p class="card-desc">${card.description}</p>
    <div class="card-stats">${pills}</div>
  </div>
</li>`.trim();
}

// ── Filter ────────────────────────────────────────────────────────────────────
let activeType   = "all";
let activeRarity = "all";

function applyFilters() {
  document.querySelectorAll(".card-item").forEach(item => {
    const matchType   = activeType   === "all" || item.dataset.type   === activeType;
    const matchRarity = activeRarity === "all" || item.dataset.rarity === activeRarity;
    item.classList.toggle("hidden", !(matchType && matchRarity));
  });
}

function setupFilters() {
  document.querySelectorAll("[data-filter-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter-type]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeType = btn.dataset.filterType;
      applyFilters();
    });
  });

  document.querySelectorAll("[data-filter-rarity]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter-rarity]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeRarity = btn.dataset.filterRarity;
      applyFilters();
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("cardsGrid").innerHTML = CARDS.map(buildCard).join("");

  setupFilters();

  // Auth
  const user = JSON.parse(sessionStorage.getItem("user") ?? "null");
  if (user) {
    document.getElementById("signupUser").style.display = "none";
    document.getElementById("user").style.display = "flex";
    document.getElementById("usernameInitial").textContent = user.username[0].toUpperCase();
    document.getElementById("usernameDisplay").textContent = user.username;
  }

  document.getElementById("userAvatar")?.addEventListener("click", () => {
    document.getElementById("userDropdown").classList.toggle("open");
  });

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    window.location.reload();
  });

  window.addEventListener("scroll", () => {
    document.querySelector("header").classList.toggle("scrolled", window.scrollY > 20);
  }, { passive: true });
});
