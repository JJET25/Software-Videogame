# Sprint_Plan.md — Dimension Deck Sprint 1 Roadmap

> Sprint: 1 | Start: 2026-05-12 | Backlog filter: GitHub label `sprint 1` | Total issues: 47

---

## Sprint Backlog — Priority Classification

### HIGH PRIORITY
*Technical foundation. Everything else is blocked until these are in place.*

| # | Issue | Type | Est. | Dependency |
|---|---|---|---|---|
| #80 | Player Movement in 4 Directions | functional | 5h ✅ | — |
| #81 | Arrow Key Alternative Movement | functional | 2h ✅ | — |
| #82 | Collision System (player-enemy, projectile, boundary) | non-functional | 8h | #80 done |
| #83 | Player Damage | functional | 5h | #82 |
| #9  | Mouse Aiming System | functional | — | #80 |
| #5  | Dash Player System | functional | — | #80, #82 |
| #12 | Player Health Display | functional | — | #83 |
| #14 | Player Damage Visual Feedback | functional | — | #83 |
| #79 | E-Key Interaction System | functional | 3h | #80 |
| #23 | Enemy AI | functional | — | #82 |
| #39 | Enemy Life System | functional | — | #23 |
| #4  | Enemies Damage | functional | — | #23, #82 |
| #11 | Enemy Attack Telegraphing | functional | — | #23 |
| #29 | Swarm Enemy | non-functional | — | #23 |
| #31 | Tank Enemy | non-functional | — | #23 |
| #34 | Ranged Enemy | non-functional | — | #23 |
| #42 | Enemy Credit Drop on Death | functional | — | #39 |
| #18 | Card Select with Number Key | functional | — | #9 |
| #24 | Use a Card with Left Click | functional | — | #9, #18 |
| #25 | Cooldown Card System | non-functional | — | #18 |
| #27 | Cooldown Visual Indicator | non-functional | — | #25 |
| #35 | Card Rarity System | non-functional | — | Card base class |
| #68 | Procedural Room Generation | functional | 10h | #23, US-2 done |
| #75 | Card Reward Chest Interaction | functional | 5h | #68, #79 |
| #74 | Dimension Transition | functional | 5h | #68 |
| #59 | User Account – Login | functional | 10h | — |
| #61 | Main Menu Navigation | functional | 2h | #59 |
| #72 | Permanent Death and Deck Loss | functional | 5h | #83, card system |

### MEDIUM PRIORITY
*Completes the full-run experience; needed for a shippable vertical slice.*

| # | Issue | Type | Est. | Dependency |
|---|---|---|---|---|
| #15 | Enemy Damage Visual Feedback | non-functional | — | #39 |
| #40 | Dimension-Specific Enemy Visual | non-functional | — | #47, #48 |
| #38 | Max-Level Card Duplicate → Credits | functional | — | #35, #19 |
| #19 | Dimensional Credits Economy | functional | — | #42 |
| #20 | Post-Level Store | functional | — | #19, #68 |
| #6  | Deck Management Screen | functional | — | #18, #25 |
| #13 | Card Tooltip in Deck UI | non-functional | — | #6 |
| #47 | Dark Ages Dimension Theme | functional | — | #68 |
| #48 | Old West Dimension Theme | functional | — | #68 |
| #65 | Dimension Map Display | functional | 8h | #68 |
| #66 | Mini-Map Toggle | functional | 4h | #65 |
| #67 | Room Node Persistence on Map | non-functional | 3h | #65 |
| #60 | Log Out Account | functional | 3h | #59 |
| #64 | Pause Menu | functional | 3h | #61 |
| #70 | Auto-Save After Each Room | non-functional | 3h | #68 |
| #71 | Run Summary on Death | functional | 2h | #72 |

### LOW PRIORITY
*Polish and audio — additive, non-blocking.*

| # | Issue | Type | Est. | Dependency |
|---|---|---|---|---|
| #55 | Dimension-Specific Music Tracks | non-functional | — | #47, #48 |
| #56 | UI State Music | non-functional | — | #61 |
| #57 | Combat and Interaction Sound Effects | non-functional | 4h | #23, #79 |

---

## Execution Strategy: Technical User Stories

### US-1 · Player Combat Foundation
> "As a player, I can move, dodge, aim with the mouse, take damage, and see my health so I can participate in the core combat loop."

**Issues:** #80, #81, #82, #83, #9, #5, #12, #14, #79

**Build order:**
1. Audit and finalize `Player.update()` for WASD + arrows — fix any edge cases (#80, #81).
2. Extend `Collision.js` to handle player-enemy AABB, projectile-entity, and screen-boundary detection (#82).
3. Add `takeDamage(amount)` method to `Entity.js`; implement player death state in `Player.js` (#83).
4. Create `SRC/Core/Mouse.js` — tracks canvas-relative cursor position on `mousemove` (#9).
5. Implement `Player.dash()` — spacebar → brief high-velocity burst, short cooldown (#5).
6. Create `SRC/UI/HUD.js` — renders health bar and credit counter overlaid on canvas (#12).
7. Red screen flash + entity color-to-red tint on damage receipt (#14).
8. Add `E` key to `Input.js`; create `SRC/Systems/InteractionManager.js` — dispatches proximity events to interactive objects (#79).

**Files modified:** `Entity.js`, `Player.js`, `Collision.js`, `Input.js`
**Files created:** `SRC/Core/Mouse.js`, `SRC/UI/HUD.js`, `SRC/Systems/InteractionManager.js`

---

### US-2 · Enemy Combat System
> "As a player, I face distinct enemy archetypes that move, telegraph attacks, and drop credits when killed."

**Issues:** #23, #39, #4, #11, #15, #29, #31, #34, #40, #42

**Build order:**
1. Create `SRC/Entities/Enemy.js` — extends `Entity`; abstract `move(player)` and `attack()`; `cardResistance` property; `dropTable[]` (#23).
2. Implement `SwarmEnemy.js` — seek-and-close vector toward player, contact damage (#29).
3. Implement `TankEnemy.js` — slow movement, high HP, knockback resistance flag, high contact damage (#31).
4. Implement `RangedEnemy.js` — maintain-distance logic, spawns `Projectile` object toward player on cooldown (#34).
5. Enemy health bars rendered per-enemy in `Enemy.draw()` or `HUD.js` (#39).
6. Enemy contact/projectile damage applied to `Player.takeDamage()` via collision in `Room.update()` (#4).
7. Wind-up timer + floor indicator drawn before attack resolves — telegraph visual (#11).
8. Enemy color-flash on hit; trigger death animation and entity removal at zero HP (#15).
9. Add `dimensionTheme` property to `Enemy` — skin swap on biome change (#40).
10. `CreditPickup` object spawns at death position; player auto-collects on overlap (#42).

**Files modified:** `Room.js`, `Collision.js`, `HUD.js`
**Files created:** `SRC/Entities/Enemy.js`, `SRC/Entities/SwarmEnemy.js`, `SRC/Entities/TankEnemy.js`, `SRC/Entities/RangedEnemy.js`, `SRC/Objects/Projectile.js`, `SRC/Objects/CreditPickup.js`

---

### US-3 · Card System & Hand Management
> "As a player, I can select and execute active cards using number keys or mouse click, with visible cooldowns and rarity-aware deck management."

**Issues:** #18, #24, #25, #27, #35, #38, #6, #13

**Build order:**
1. Create `SRC/Cards/Card.js` — base: `name`, `rarity`, `type` (active/auto), `effect(combatState)`, `cooldown` (seconds).
2. Create `SRC/Cards/CardManager.js` — owns active hand array (3–5 slots); handles `playCard(slotIndex)` dispatch.
3. Wire number keys 1–5 → `CardManager.playCard(index)` in `Input.js` (#18).
4. LMB at cursor position → execute the selected card via `Mouse.js` (#24).
5. `CooldownSystem` — per-slot timer that decrements in `update()`; slot is locked while `cooldown > 0` (#25).
6. HUD cooldown indicator — dim card face + circular wipe animation over slot (#27).
7. `Card.rarity` enum: `common` / `rare` / `epic` / `legendary`; rarity-weighted draw pools (#35).
8. Duplicate max-level card logic in `CardManager`: detect max level → skip merge → convert to credits by rarity (#38).
9. Create `SRC/UI/DeckScreen.js` — Tab key toggles overlay; grid of all cards with name, rarity, type (#6, #13).

**Files modified:** `Player.js`, `Input.js`, `HUD.js`
**Files created:** `SRC/Cards/Card.js`, `SRC/Cards/CardManager.js`, `SRC/Cards/ActiveCard.js`, `SRC/Cards/AutomaticCard.js`, `SRC/Systems/CooldownSystem.js`, `SRC/UI/DeckScreen.js`

---

### US-4 · Economy System
> "As a player, I earn dimensional credits by killing enemies and spend them at the post-level store."

**Issues:** #19, #20, #38 (credits side)

**Build order:**
1. `Player.credits` property — incremented by `CreditPickup` overlap; displayed in `HUD.js` (#19).
2. Create `SRC/Economy/Shop.js` — rotating 4-card inventory per visit; `purchase(card)` deducts credits and adds card to deck (#20).
3. Create `SRC/World/ShopRoom.js` — extends `Room`; spawns merchant and `Shop` object; free exit (#20).
4. Credit conversion for max-level duplicates handled inside `CardManager` (calls `Player.addCredits(amount)`) (#38).

**Files modified:** `Player.js`, `HUD.js`, `Room.js`
**Files created:** `SRC/Economy/Shop.js`, `SRC/World/ShopRoom.js`

---

### US-5 · Procedural World Generation
> "As a player, each run generates a unique branching map of 8–12 rooms before a Boss node, with biome-specific visuals and enemies."

**Issues:** #68, #47, #48, #74, #75

**Build order:**
1. Create `SRC/World/DimensionGenerator.js` — builds adjacency graph: random 8–12 nodes, branching paths converge at Boss; weighted room type rolls (Combat 60%, Chest 15%, Shop 10%, Shrine 10%, Glitch 5%) (#68).
2. Implement `CombatRoom`, `ChestRoom`, `ShrineRoom` as `Room` subclasses; each overrides `spawnEntities()` and `getExitCondition()` (#68).
3. Create `SRC/World/Biome.js` — groups: enemy pool, tileset ID, music track ID, boss reference, resistance multiplier (#47, #48).
4. Card Reward Chest: spawns in `CombatRoom` after all enemies cleared; E-key opens `CardSelectOverlay` with 3 rarity-weighted cards (#75).
5. Boss defeat → `DimensionManager.loadNextDimension()` spawns portal, transitions to next `Biome`, preserves deck + credits, removes previous dimension objects (#74).

**Files modified:** `Game.js`, `Room.js`
**Files created:** `SRC/World/DimensionGenerator.js`, `SRC/World/Biome.js`, `SRC/World/DimensionManager.js`, `SRC/World/CombatRoom.js`, `SRC/World/ChestRoom.js`, `SRC/World/ShrineRoom.js`, `SRC/UI/CardSelectOverlay.js`

---

### US-6 · UI Screens & Authentication
> "As a player, I can log in, navigate menus, pause the game at any time, and view my dimension map."

**Issues:** #59, #60, #61, #64, #65, #66, #67

**Build order:**
1. Create `SRC/Core/SceneManager.js` — state machine: `Login → MainMenu → Game → Pause → GameOver`; each scene owns its own `update()` and `draw()` (#59, #61, #64).
2. Create `SRC/Core/AuthManager.js` — validates username/password against a `localStorage` user store (MVP); exposes `login()`, `logout()`, `currentUser` (#59, #60).
3. `SRC/UI/MainMenu.js` — scene with four buttons: New Game, Continue, Settings, Exit (#61).
4. `SRC/UI/PauseMenu.js` — overlay triggered by Escape; Resume / Settings / Return to Main Menu (#64).
5. `SRC/UI/DimensionMap.js` — full-screen branching graph; hold M renders all nodes with type icons and path lines; current room highlighted (#65).
6. `SRC/UI/MiniMap.js` — corner overlay; tap M toggles; shows adjacent nodes and current position (#66).
7. `MapPersistence` — flag each room node as `revealed` when player enters its detection collider; persist flag in `RunManager` state (#67).

**Files modified:** `Game.js`, `Input.js`
**Files created:** `SRC/Core/SceneManager.js`, `SRC/Core/AuthManager.js`, `SRC/UI/MainMenu.js`, `SRC/UI/PauseMenu.js`, `SRC/UI/DimensionMap.js`, `SRC/UI/MiniMap.js`

---

### US-7 · Roguelite Progression Loop
> "As a player, death clears my deck and shows a run summary; progress auto-saves after each room."

**Issues:** #72, #71, #70

**Build order:**
1. Create `SRC/Core/RunManager.js` — owns current run state: room index, deck snapshot, credit total, stats counters (#72).
2. On `player.health <= 0`: `RunManager.endRun()` clears deck, retains credits, fires `SceneManager.goto('GameOver')` (#72).
3. Create `SRC/UI/GameOverScreen.js` — displays rooms cleared, total damage dealt, cards used; Back to Menu button (#71).
4. Create `SRC/Core/SaveSystem.js` — `serialize(runState)` → `localStorage`; called at end of each room clear (#70).

**Files modified:** `Player.js`, `Game.js`
**Files created:** `SRC/Core/RunManager.js`, `SRC/Core/SaveSystem.js`, `SRC/UI/GameOverScreen.js`

---

### US-8 · Audio
> "As a player, dimension-specific music and combat sound effects play contextually throughout the game."

**Issues:** #55, #56, #57

**Build order:**
1. Create `SRC/Core/AudioManager.js` — singleton wrapping Web Audio API; `playMusic(trackId)`, `stopMusic()`, `playSFX(sfxId)` (#55, #56, #57).
2. Hook into `SceneManager` transitions for menu/defeat/victory tracks (#56).
3. Hook into `Room` events (enemy hit, enemy death, card use, chest open) for SFX (#57).
4. Hook into `Biome` load for dimension-specific exploration tracks (#55).

**Files created:** `SRC/Core/AudioManager.js`

---

## Impact Analysis

| File | User Stories | Risk |
|---|---|---|
| `SRC/Entities/Entity.js` | US-1, US-2 | **High** — base class for all moving objects; changes propagate everywhere |
| `SRC/Entities/Player.js` | US-1, US-3, US-4, US-7 | **High** — most-modified file in the sprint |
| `SRC/Physics/Collision.js` | US-1, US-2 | **Medium** — extend detection modes, not a rewrite |
| `SRC/World/Room.js` | US-2, US-4, US-5 | **High** — must become a base class; new subtypes extend it |
| `SRC/Core/Game.js` | US-5, US-6, US-7 | **Medium** — refactor to delegate to `SceneManager` |
| `SRC/Core/Input.js` | US-1, US-3, US-6 | **Medium** — add mouse tracking + new key bindings |
| `SRC/Core/Renderer.js` | US-1 (HUD layer) | **Low** — additive: new draw methods only |
| `SRC/Utils/Constants.js` | US-5 | **Low** — possible new room type constants |

---

## Technical Dependency Graph

```
US-1 (Player Foundation)
  └── US-2 (Enemy System)
        └── US-5 (World Gen)
              ├── US-6 (UI / Map)
              └── US-7 (Roguelite Loop)

US-1 (Player Foundation)
  └── US-3 (Card System)
        └── US-4 (Economy)

US-6 (UI / Auth)         — parallel with US-2/3 (no shared files at start)
US-8 (Audio)             — fully parallel; hooks in last
```

> Build US-1 first. US-2 and US-3 can proceed in parallel once US-1 is complete. US-5 opens after US-2 is stable. US-6 and US-8 are largely independent and can be worked on in parallel by a second developer.
