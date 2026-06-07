// Card data — stats from backend/schema.sql
// Set image path once the art is ready; null shows a placeholder.
const ACT = "../../Assets/Sprites/cards/action cards/";
const AUT = "../../Assets/Sprites/cards/automatic cards/";

const CARDS = [
  // ── ACTIVE · MELEE ─────────────────────────────────────────────────────────
  {
    name: "Quick Strike",
    type: "active", rarity: "common",
    description: "Deal damage to enemies within 80 px in a forward cone.",
    stats: ["25 DMG", "80 px", "2 s CD"],
    starter: true,
    image: ACT + "quick-strike.jpeg",
  },
  {
    name: "Iron Fist",
    type: "active", rarity: "rare",
    description: "A brutal close-range blow dealing 65 damage within 28 px.",
    stats: ["65 DMG", "28 px", "2.5 s CD"],
    starter: false,
    image: ACT + "iron-fist.jpeg",
  },
  {
    name: "Nova Burst",
    type: "active", rarity: "epic",
    description: "Full-circle explosion dealing 120 damage to all enemies within 72 px.",
    stats: ["120 DMG", "180°", "7 s CD"],
    starter: false,
    image: ACT + "nova-burst.jpeg",
  },
  {
    name: "Shadow Blade",
    type: "active", rarity: "legendary",
    description: "A devastating strike dealing 250 damage to enemies within 48 px.",
    stats: ["250 DMG", "48 px", "10 s CD"],
    starter: false,
    image: ACT + "shadow-knife.png",
  },
  // ── ACTIVE · HEAL ──────────────────────────────────────────────────────────
  {
    name: "Heal Pulse",
    type: "active", rarity: "common",
    description: "Instantly restore 25 HP.",
    stats: ["25 HP", "5 s CD"],
    starter: true,
    image: ACT + "healing-potion.png",
  },
  {
    name: "Mending Wave",
    type: "active", rarity: "epic",
    description: "Release a healing wave that restores 85 HP.",
    stats: ["85 HP", "12 s CD"],
    starter: false,
    image: ACT + "mending-wave.jpeg",
  },
  {
    name: "Phoenix Elixir",
    type: "active", rarity: "legendary",
    description: "Consume a legendary elixir to fully restore all HP.",
    stats: ["FULL HP", "25 s CD"],
    starter: false,
    image: ACT + "phoenix-elixir.jpeg",
  },
  // ── ACTIVE · DRAIN ─────────────────────────────────────────────────────────
  {
    name: "Blood Siphon",
    type: "active", rarity: "rare",
    description: "Drain the nearest enemy for 45 damage and restore 20 HP.",
    stats: ["45 DMG", "+20 HP", "10 s CD"],
    starter: false,
    image: ACT + "blood-siphon.jpeg",
  },
  // ── ACTIVE · DEFENSE ───────────────────────────────────────────────────────
  {
    name: "Wood Shield",
    type: "active", rarity: "common",
    description: "Absorb the next 20 damage with a temporary shield.",
    stats: ["20 SHIELD", "6 s CD"],
    starter: true,
    image: ACT + "wood-shield.png",
  },
  {
    name: "Stone Wall",
    type: "active", rarity: "rare",
    description: "Erect a wall of stone that absorbs the next 50 damage.",
    stats: ["50 SHIELD", "10 s CD"],
    starter: false,
    image: ACT + "stone-wall.jpeg",
  },
  {
    name: "Mirror Guard",
    type: "active", rarity: "epic",
    description: "Gain 35 shield and 1.5 s of invincibility.",
    stats: ["35 SHIELD", "1.5 s INVINC", "14 s CD"],
    starter: false,
    image: ACT + "mirror-guard.jpeg",
  },
  {
    name: "Diamond Fortress",
    type: "active", rarity: "legendary",
    description: "Crystallize your body, absorbing the next 100 damage.",
    stats: ["100 SHIELD", "15 s CD"],
    starter: false,
    image: ACT + "diamond-fortress.jpeg",
  },
  // ── AUTOMATIC · COMMON ────────────────────────────────────────────────────
  {
    name: "Lifetap",
    type: "automatic", rarity: "common",
    description: "Restore 20 HP each time you kill an enemy.",
    stats: ["+20 HP", "On Kill"],
    starter: false,
    image: AUT + "life-tap.jpeg",
  },
  {
    name: "Iron Skin",
    type: "automatic", rarity: "common",
    description: "Gain 8 shield each time your card hits an enemy.",
    stats: ["+8 SHIELD", "On Hit"],
    starter: false,
    image: AUT + "iron-skin.jpeg",
  },
  {
    name: "Wound Echo",
    type: "automatic", rarity: "common",
    description: "Each hit deals 10 bonus damage to the struck enemy.",
    stats: ["+10 DMG", "On Hit"],
    starter: false,
    image: AUT + "wound-echo.jpeg",
  },
  {
    name: "Quick Recovery",
    type: "automatic", rarity: "common",
    description: "Taking damage instantly restores 8 HP.",
    stats: ["+8 HP", "On Damage"],
    starter: false,
    image: AUT + "quick-recovery.jpeg",
  },
  // ── AUTOMATIC · RARE ───────────────────────────────────────────────────────
  {
    name: "Rebound",
    type: "automatic", rarity: "rare",
    description: "When hit, deal 15 damage to enemies within 48 px.",
    stats: ["15 DMG", "48 px", "On Damage"],
    starter: false,
    image: AUT + "rebound.jpeg",
  },
  {
    name: "Berserker Rush",
    type: "automatic", rarity: "rare",
    description: "Dashing deals 20 damage to enemies within 32 px.",
    stats: ["20 DMG", "32 px", "On Dash"],
    starter: false,
    image: AUT + "berserket-rush.jpeg",
  },
  {
    name: "Phantom Step",
    type: "automatic", rarity: "rare",
    description: "Dashing grants 22 shield.",
    stats: ["+22 SHIELD", "On Dash"],
    starter: false,
    image: AUT + "phantom-step.jpeg",
  },
  {
    name: "Soul Siphon",
    type: "automatic", rarity: "rare",
    description: "Killing an enemy restores 18 HP and grants 10 shield.",
    stats: ["+18 HP", "+10 SHIELD", "On Kill"],
    starter: false,
    image: AUT + "sould-siphon.jpeg",
  },
  // ── AUTOMATIC · EPIC ───────────────────────────────────────────────────────
  {
    name: "Last Stand",
    type: "automatic", rarity: "epic",
    description: "When hit below 30% HP, gain 2 s of invincibility.",
    stats: ["2 s INVINC", "< 30% HP", "On Damage"],
    starter: false,
    image: AUT + "last-stand.jpeg",
  },
  {
    name: "Chain Kill",
    type: "automatic", rarity: "epic",
    description: "Killing an enemy deals 25 AoE damage to all others within 64 px.",
    stats: ["25 DMG", "64 px", "On Kill"],
    starter: false,
    image: AUT + "chain-kill.jpeg",
  },
  {
    name: "Aftershock",
    type: "automatic", rarity: "epic",
    description: "Dashing releases a shockwave dealing 40 damage to enemies within 180 px.",
    stats: ["40 DMG", "180 px", "On Dash"],
    starter: false,
    image: AUT + "after-shock.jpeg",
  },
  // ── AUTOMATIC · LEGENDARY ─────────────────────────────────────────────────
  {
    name: "Decimator",
    type: "automatic", rarity: "legendary",
    description: "Killing an enemy triggers a massive explosion dealing 70 damage within 280 px.",
    stats: ["70 DMG", "280 px", "On Kill"],
    starter: false,
    image: AUT + "decimator.jpeg",
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
