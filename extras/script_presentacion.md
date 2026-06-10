# Dimension Deck — Presentation Script (8 Minutes)

> **Recommended pace:** ~130 words/minute
> **Approximate total:** 1,040 words
> **Structure:** 6 sections with cumulative timestamps

---

## SECTION 0 — ELEVATOR PITCH
**⏱ Duration: ~30 seconds | ⏱ Timestamp: 0:00 – 0:30**

---

*[Show: game logo / title screen]*

Imagine you're a hero trapped between two broken timelines. In one, a medieval dungeon ruled by the undead. In the other, a scorching desert controlled by outlaws. Your only weapon? A deck of magical cards you build as you go.

**Dimension Deck** is a browser-based roguelite where every run is different, every card choice matters, and the only way home is to fight through both worlds and take down their kings.

It's fast, it's strategic, and it's built entirely from scratch — no game engine, just code.

---

## SECTION 1 — GAME INTRODUCTION
**⏱ Duration: ~30 seconds | ⏱ Timestamp: 0:30 – 1:00**

---

*[Show: landing page]*

Good afternoon. Our project is **Dimension Deck** — a real-time roguelite card battler played entirely in the browser.

The player travels across **two dimensions** — Dark Ages and the Old West — exploring procedurally generated dungeons, fighting unique enemies, building a card deck on the fly, and ultimately facing each dimension's final boss to win the run.

The full game is built with **Vanilla JavaScript and Canvas 2D** on the frontend, and **Node.js + Express + MySQL** on the backend. No game framework was used — every system, from the physics engine to the room generator, was written from scratch.

---

## SECTION 2 — WEB EXPERIENCE (Pages & User System)
**⏱ Duration: ~90 seconds | ⏱ Timestamp: 1:00 – 2:30**

---

*[Show: index.html — landing page]*

### Landing Page
The first thing a user sees is the **landing page**. It has a hero section with a "PLAY NOW" button that leads to login, a three-pillar description of the game (Roguelite, Deck Building, Real-Time Combat), a dimensions showcase, and card previews.

---

*[Show: login.html]*

### Authentication — Login & Sign Up
The **auth system** lets users register a new account or log in with a username and password. The form uses toggle tabs to switch between modes. The backend authenticates with **JWT tokens** and passwords are stored as hashes. Invalid credentials surface a clear error message on screen.

---

*[Show: cards.html]*

### Card Catalog
The **cards page** lets players browse the full card roster before even starting a run. Cards can be filtered by type — Active or Automatic — and by rarity: Common, Rare, Epic, or Legendary. Each card shows its artwork, name, description, and rarity tag. All data is fetched dynamically from the backend API.

---

*[Show: tutorial.html]*

### Tutorial
The **tutorial page** is a full eight-section interactive guide covering: game objective, controls, the HUD, room types, the card system, a per-dimension enemy guide, boss strategies, and advanced tips.

---

*[Show: stats.html]*

### Player Statistics Dashboard
The **stats page** is a full analytics dashboard. It shows win rate, best score, a score history line chart, a performance radar, a card rarity doughnut chart, top cards used, milestone tracking, and a **global leaderboard** ranking the top players by score, victories, and total runs.

---

## SECTION 3 — GAME MECHANICS (Player, Enemies, Bosses & Cards)
**⏱ Duration: ~150 seconds | ⏱ Timestamp: 2:30 – 5:00**

---

### The Player
*[Show: gameplay footage — player moving and dashing]*

The player starts with **100 HP** and moves with WASD or arrow keys. Aiming is fully free with the mouse. The core survival tool is the **dash**: 300 px/s burst speed, 0.2 seconds of movement, 0.45 seconds of invincibility frames, and a 0.8-second cooldown. Mastering the dash is everything — it's how you dodge bullets and punish enemies.

The player's appearance also changes with the dimension: a **Knight** in the Dark Ages, a **Cowboy** in the Old West.

---

### Enemies
*[Show: a combat room with multiple enemy types]*

Each dimension has its own enemies, all built around **three archetypes**:

- **Swarm:** Fast, fragile (16 HP). They orbit the player and dive in to deal contact damage. Dangerous in large groups. Dark Ages: *Dungeon Rat*. Old West: *Desert Rat*.

- **Tank:** Slow but durable (90 HP). They charge at 3× speed when close. Requires well-timed dodges. Dark Ages: *Skeleton*, *Slime*. Old West: *Cactus Thug*. Upgraded variants like the *Minotaur* add stomp attacks.

- **Ranged:** Keeps distance and fires projectiles while strafing laterally to avoid the player. Dark Ages: *Spirit*. Old West: *Bandit*, which has a full animation state machine for its shooting cycle.

---

### Bosses
*[Show: boss room — phase transition animation]*

Each dimension has a **mini-boss** and a **final boss**, both with aggressive three-phase escalation:

- **Mini-Boss (1,000 HP):** Dark Ages — *Fallen Knight*. Old West — *Dead-Eye*. As HP drops, attacks shift from burst fire to radial rings, and the final phase adds minion summons and near-constant aggression.

- **Final Boss (2,000 HP):** Dark Ages — **Skeleton King**. Old West — **The Iron Marshal** — who enters an enraged state at 30% HP. These bosses orbit the player and rotate between three attack patterns: a multi-bullet burst, a radial bullet ring, and a spiral attack. Phase 3 doubles their speed and halves their attack intervals.

---

### The Card System
*[Show: HUD card slots / deck management screen]*

The card system is the strategic core of the game. There are **two categories**:

**Active Cards** — triggered manually with keys 1–5. Each has its own cooldown. Four types:
- *Melee:* Close-range AoE damage. Range: Quick Strike (25 dmg, Common) → Shadow Blade (250 dmg, Legendary)
- *Heal:* Restore HP. Range: Heal Pulse (+25 HP) → Phoenix Elixir (full restore, Legendary)
- *Defense:* Generate a damage shield. Range: Wood Shield (20 pts) → Diamond Fortress (100 pts, Legendary)
- *Drain:* Deal damage and convert it to HP. Example: Blood Siphon (45 dmg → +20 HP)

**Automatic Cards** — triggered by game events, no input required. Four trigger types:
- *On Kill:* Fires when an enemy dies. Example: Lifetap (+20 HP per kill)
- *On Hit:* Fires when the player lands a hit. Example: Iron Skin (+8 shield per hit)
- *On Damage:* Fires when the player takes damage. Example: Last Stand (2s invincibility below 30% HP)
- *On Dash:* Fires on every dash. Example: Berserker Rush (20 dmg AoE around player)

The starter deck is **Quick Strike, Heal Pulse, and Wood Shield**. Players can expand to **5 active slots** and **4 automatic slots** by spending credits at the shop. Cards also level up, reducing their cooldown down to 49% of the base value.

---

## SECTION 4 — GAMEPLAY LOOP (World, Dimensions, Rooms & Win Condition)
**⏱ Duration: ~120 seconds | ⏱ Timestamp: 5:00 – 7:00**

---

### Procedural Room Generation
*[Show: minimap on HUD during a live run]*

Every run generates a **unique map**. The generator builds a connected node graph with these rules:
- **20 to 30 rooms** per dimension
- **30% connection chance** between adjacent nodes
- Room types are distributed by weight: **57% Combat, 20% Chest, 10% Shop, 10% Glitch, 2% Shrine, 1% Mr. Bombastic**

The minimap in the HUD renders this graph in real time with color-coded room types and visited/unvisited states.

---

### Room Types
*[Show: examples of each room type]*

| Room | Function |
|------|----------|
| **Combat** | Enemies spawn based on preset encounter templates. Doors lock until all enemies are dead. |
| **Chest** | Opens to reveal a card selection — pick one to add to your deck. |
| **Shop** | The Merchant sells cards and slot upgrades using credits earned from combat. |
| **Glitch** | A challenge room with Glitch Pillars as environmental hazards. |
| **Shrine** | Contains the portal to the next dimension. |
| **Boss** | The dimension's boss waits here — clearing it is required to progress. |

Combat rooms use six handcrafted encounter templates: *THE_SWARM* (pure swarm pressure), *SNIPER_NEST* (ranged-heavy), *THE_BRUTE* (two tanks), *THE_SIEGE* (mixed), *CROSSFIRE* (one tank, three ranged), and *ELITE_GUARD* (balanced).

---

### The Two Dimensions
*[Show: dimension transition screen / Dark Ages and Old West tile sets]*

The game spans **two fully distinct dimensions**, each with its own aesthetic, enemies, and bosses:

**Dark Ages:** A medieval stone dungeon with cracked floors and bloodstains. Enemies include Dungeon Rats, Skeletons, Slimes, Spirits, and the mini-boss Two-Headed Giant. The final boss is the **Skeleton King**.

**Old West:** An arid desert with sand tiles and cactus clusters. Enemies include Desert Rats, Bandits, Cactus Thugs, Minotaurs, and the mini-boss Dead-Eye. The final boss is **The Iron Marshal**, who enrages at 30% HP.

A cinematic transition screen plays when the player crosses between worlds.

---

### Victory & Defeat
*[Show: Victory Screen or Defeat Screen]*

**To win:** Defeat the final boss of **both dimensions** — the Skeleton King and the Iron Marshal. The victory screen appears and the run is saved to the backend with a final score.

**Defeat:** If HP reaches 0 at any point, the run ends at the defeat screen. The run is still recorded for the player's stats and leaderboard history.

Every run tracks: rooms cleared, enemies killed, damage dealt and received, credits earned, and final score.

---

## SECTION 5 — CLOSING
**⏱ Duration: ~60 seconds | ⏱ Timestamp: 7:00 – 8:00**

---

*[Show: title screen / logo]*

### Tech Stack
Dimension Deck is built entirely on standard web technologies:

- **Frontend:** Vanilla JavaScript, Canvas 2D, HTML/CSS — zero game frameworks
- **Backend:** Node.js + Express with 10 REST endpoints
- **Database:** MySQL with JWT authentication
- **Custom engine:** Game loop, renderer, input manager, AABB physics, procedural generation, sprite sheet animations — all written from scratch

### What We Built
In this project we implemented a procedural dungeon generator, a real-time combat engine, a full dual-category card system, two handcrafted dimensions with unique enemies and final bosses, a complete backend with global stats and leaderboard, and a full web experience covering authentication, a card catalog, an interactive tutorial, and an analytics dashboard.

Thank you. We're happy to take any questions.

---

## QUICK TIMING REFERENCE

| Section | Content | Time |
|---------|---------|------|
| 0 | Elevator Pitch | 0:00 – 0:30 |
| 1 | Game Introduction | 0:30 – 1:00 |
| 2 | Web Experience (auth, cards, tutorial, stats) | 1:00 – 2:30 |
| 3 | Mechanics (player, enemies, bosses, cards) | 2:30 – 5:00 |
| 4 | Gameplay (generation, dimensions, rooms, victory) | 5:00 – 7:00 |
| 5 | Closing & tech stack | 7:00 – 8:00 |

---

## PRESENTER NOTES

- **Screen cues:** Each subsection opens with `[Show: ...]` — use these as your cue for what to switch to on screen.
- **Running ahead:** Expand enemy examples or card descriptions — both sections have natural room to breathe.
- **Running behind:** Cut the encounter template list in Section 4 (THE_SWARM, THE_SIEGE, etc.) — the room types table alone is enough.
- **Live demo:** If demoing live, the best window is Section 4 — run one combat room, one chest room, and one shop interaction to show the loop naturally.
- **Three non-negotiable points:** (1) Every run is procedurally unique, (2) active + automatic cards create completely different playstyles, (3) two dimensions with distinct aesthetics, enemies, and final bosses.
