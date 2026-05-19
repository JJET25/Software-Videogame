# CLAUDE.md — Dimension Deck Technical Source of Truth

> Last updated: 2026-05-12. This file is the authoritative reference for engine state, architecture, and conventions. Update it whenever a system transitions from "Missing" to "Done."

---

## 1. Project Overview

Dimension Deck is a 2D top-down roguelite deck-builder built with **Vanilla JavaScript and the HTML5 Canvas 2D API**. No frameworks, no build tools, no bundlers. The game loop runs on `requestAnimationFrame` at a fixed internal resolution of **480×352 px** (15 cols × 11 rows of 32px tiles), scaled to the nearest integer multiple for pixel-perfect rendering.

**Genre target:** The Binding of Isaac × Slay the Spire — real-time movement + card-based combat with automated synergies.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Browser (Vanilla JS ES Modules) |
| Rendering | HTML5 Canvas 2D API |
| Module System | ES Modules (`import` / `export default`) |
| Entry HTML | `Dimension Deck/HTML/game.html` |
| Bootstrap | `SRC/Main.js` → `new Game(canvas)` |
| Build Tool | None — serve `HTML/game.html` directly |
| Assets | Aseprite source files (not yet loaded in-engine) |

---

## 3. Directory Structure

```
Dimension Deck/
├── HTML/
│   └── game.html              # Mounts #gameCanvas, loads SRC/Main.js as module
├── CSS/
│   └── game.css               # Full-screen canvas centering, overflow hidden, bg #111
├── SRC/
│   ├── Main.js                # Bootstraps: const game = new Game(canvas)
│   ├── Core/
│   │   ├── Game.js            # requestAnimationFrame loop; owns Player + Room instances
│   │   ├── Input.js           # Keyboard state: keydown/keyup → this.keys[KEY]; isKeyDown()
│   │   └── Renderer.js        # Canvas wrapper: clear(), drawRect(), integer-scale resize()
│   ├── Entities/
│   │   ├── Entity.js          # Base: position, velocity, health, hitbox config, getBounds(), draw(), update()
│   │   └── Player.js          # Extends Entity: WASD+Arrow → velocity; state "idle"/"moving"
│   ├── Objects/
│   │   ├── GameObject.js      # Static world objects: position, getBounds(), draw()
│   │   └── Wall.js            # Extends GameObject: 32×32, color "blue", type "wall"
│   ├── Physics/
│   │   └── Collision.js       # Static helpers: rectCollision(), getOverlap(), resolve(A,B)
│   ├── World/
│   │   └── Room.js            # 15×11 tile grid, buildGrid(), buildWalls(), walls[], enemies[], objects[]
│   └── Utils/
│       ├── Vector.js          # Immutable 2D math: plus, minus, times, normalize, magnitude, squareLength
│       └── Constants.js       # TILE_SIZE=32, ROOM_COLS=15, ROOM_ROWS=11, ROOM_WIDTH=480, ROOM_HEIGHT=352
└── Assets/
    └── Sprites/               # .aseprite source files — not yet loaded in-engine
        ├── player/knight/     # Directional walk cycles for the knight
        ├── enemies/           # rat, skeleton, spirit
        ├── action cards/      # action-card, heal-card, secondary card, wood-shield
        ├── drops/             # coin
        ├── room/              # room, roomDungeon, roomOldWest
        └── tiles/             # tilesDungeon, tilesOldWest
```

---

## 4. Entity Architecture

```
Entity (SRC/Entities/Entity.js)
│  position: Vector         — world-space CENTER of the entity
│  velocity: Vector         — pixels/second
│  width / height           — sprite draw dimensions
│  hitboxWidth / hitboxHeight / hitboxOffset: Vector   — independent of sprite
│  health / maxHealth       — default 100/100
│  getBounds()              → {left, right, top, bottom} of the HITBOX (not sprite)
│  draw(renderer)           — centered drawRect at position
│  update(deltaTime)        — position += velocity * dt
│
├── Player (SRC/Entities/Player.js)
│   │  Sprite: 32×64 px  |  Hitbox: 32×32 px (hitboxOffset = Vector(0,16) — bottom half)
│   │  speed: 300 px/s
│   │  state: "idle" | "moving"
│   │  update() — reads InputManager → normalizes direction → velocity → super.update()
│   └── [PLANNED] input bindings for mouse, dash, card slots, E-key
│
└── Enemy [PLANNED] (SRC/Entities/Enemy.js — extends Entity)
    │  cardResistance: number    — scales with player deck size
    │  dropTable: []             — credits / card drops on death
    │  move(player): abstract
    │  attack(): abstract
    ├── SwarmEnemy  — 16×16 px; seek-and-close AI; contact damage
    ├── TankEnemy   — large; slow; high HP; knockback resistant; high contact damage
    └── RangedEnemy — mid-size; maintain distance; fires Projectile on cooldown

GameObject (SRC/Objects/GameObject.js)
│  position, velocity, width, height, color, type
│  getBounds()   — center-based rect (no hitbox offset)
│  draw(renderer)
└── Wall (SRC/Objects/Wall.js) — 32×32, color "blue", type "wall", update() is no-op
```

**Planned class hierarchy (Sprint 1 targets):**

```
Card (SRC/Cards/Card.js)
├── ActiveCard   — manual execution, cooldown timer, number key binding
└── AutomaticCard — trigger-based, watches combat event bus

Room (SRC/World/Room.js)
├── CombatRoom   — enemy pool spawn; unlocks exit on clear; chest spawns
├── ChestRoom    — single chest, rarity roll
├── ShopRoom     — merchant object, free exit
└── ShrineRoom   — one trade offer
```

---

## 5. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files / Classes | PascalCase | `CardManager.js`, `class SwarmEnemy` |
| Methods / Properties | camelCase | `getBounds()`, `this.hitboxOffset` |
| Constants | UPPER_SNAKE_CASE | `TILE_SIZE`, `ROOM_COLS` |
| CSS / HTML IDs | kebab-case | `#gameCanvas`, `.card-slot` |
| Boolean properties | `is` / `has` prefix | `isCleared`, `hasKey` |
| Abstract / base classes | No `Abstract` prefix — document in CLAUDE.md | `Enemy`, `Card`, `Room` |
| Singleton systems | Suffix `Manager` or `System` | `InputManager`, `CooldownSystem` |

---

## 6. Coordinate System

- **Origin**: top-left of the canvas (0, 0).
- **Entity `position`**: stores the **center** of the entity; draw functions subtract `width/2` and `height/2`.
- **Hitbox `getBounds()`**: offsets applied to the center before expanding by half-hitbox dimensions.
- All physics (velocity, collision resolution) operate in **world-space pixels**.
- Canvas internal resolution: **480×352 px** (constants in `Utils/Constants.js`).

---

## 7. Game Loop

```
requestAnimationFrame
  └── Game.gameLoop(timestamp)
        ├── deltaTime = (timestamp - lastTime) / 1000   // seconds
        ├── UPDATE
        │     player.update(deltaTime)
        │     room.update(deltaTime, player)             // handles wall collisions
        ├── CLEAR
        │     renderer.clear()                          // fills black
        └── DRAW
              room.draw(renderer)                        // walls
              player.draw(renderer)                      // player rect
```

---

## 8. Collision System

`Collision.resolve(objectA, objectB)` — AABB push-out:
1. `rectCollision()` — early exit if no overlap.
2. `getOverlap()` — compute X and Y penetration depth.
3. Push `objectA` out along the **smaller** axis; zero the corresponding velocity component.

Currently used only for Player vs. Walls. Must be extended for Player vs. Enemy, Projectile vs. Entity, and boundary detection (#82).

---

## 9. Current Engine State (Sprint 1 Kickoff — 2026-05-12)

| System | Status | File(s) |
|---|---|---|
| Game loop (RAF, delta-time) | **Done** | `Core/Game.js` |
| Pixel-scale renderer | **Done** | `Core/Renderer.js` |
| Keyboard input | **Done** | `Core/Input.js` |
| Player movement (WASD + Arrows) | **Done** | `Entities/Player.js` |
| Configurable hitbox | **Done** | `Entities/Entity.js` |
| Wall AABB collision resolution | **Done** | `Physics/Collision.js` |
| Room tile grid + perimeter walls | **Done** | `World/Room.js` |
| Player health value + damage | **Done** | `Entity.js` — `takeDamage()`, invincibility frames, `isDead`, `grantInvincibility()` |
| Mouse aiming | **Done** | `Core/Mouse.js` — canvas-scaled cursor position |
| Dash mechanic | **Done** | `Entities/Player.js` — SPACE, 700 px/s burst, 0.8s cooldown, invincibility during dash |
| Player health display | **Done** | `UI/HUD.js` — health bar + HP label |
| Damage visual feedback | **Done** | `Entity.draw()` white flash; `HUD._drawScreenFlash()` red overlay |
| E-key interaction | **Done** | `Systems/InteractionManager.js` — edge-triggered, 48px range, dispatches to `obj.interact(player)` |
| Enemy class hierarchy | **Missing** | — |
| Card system | **Missing** | — |
| Economy (credits, shop) | **Missing** | — |
| Procedural world generation | **Missing** | — |
| UI screens (Menu, Pause, GameOver) | **Missing** | — |
| Authentication (Login/Logout) | **Missing** | — |
| Dimension map / mini-map | **Missing** | — |
| Audio manager | **Missing** | — |
| Save system | **Missing** | — |

---

## 10. Known Technical Debt

| ID | Location | Issue | Fix |
|---|---|---|---|
| ~~TD-1~~ | ~~`Core/Game.js:31`~~ | ~~`setupResizeListener()` called every frame~~ | **Fixed** — `Renderer` now guards with `_resizeListenerAttached` flag |
| TD-2 | `GameObject.js` vs `Entity.js` | Near-duplicate `getBounds()` and `draw()` — two parallel hierarchies with identical methods | Unify under a shared `Renderable` mixin or make `GameObject` extend `Entity` before new classes are added |
| TD-3 | `World/Room.js` | `this.width = ROOM_WIDTH` pulls from Constants but is redundant alongside `ROOM_COLS * TILE_SIZE` — two sources of truth for the same value | Remove the direct assignment; compute from constants only |

---

## 11. Game Design Quick Reference

| Mechanic | Key Numbers |
|---|---|
| Room grid | 15 cols × 11 rows × 32px tiles = 480×352 px |
| Active card slots | 3 base, expandable to 5 |
| Automatic card slots | 4 base, expandable to 8 |
| Card resistance formula | (Active slots − 3) × 5% + floor((Auto slots − 4) / 2) × 3% |
| Rooms per dimension | 8–12 (random), then Boss node |
| Room type weights | Combat 60%, Chest 15%, Shop 10%, Shrine 10%, Glitch 5% |
| Synergy window | 4 seconds between trigger and catalyst card on same target |
| Card levels | Base → Upgraded (×0.7 cooldown) → Max (+40% power + secondary effect) |
| Dimensions | Dark Ages (dungeon/castle), Old West (desert/frontier town) |
| Enemy archetypes | Swarm (16×16 seek-close), Tank (large, slow, high HP), Ranged (maintains distance, fires projectile) |
