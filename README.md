# Dimension Deck

> A browser-based roguelite card battler with procedurally generated dungeons and real-time card combat.

You fight through rooms across two distinct dimensions — **Dark Ages** and **Old West** — collecting and activating cards in real time. Each run generates a new layout, new enemy encounters, and a different set of cards to discover. Death is permanent; reaching the final boss of each dimension is the goal.

---

## Table of Contents

- [Gameplay](#gameplay)
- [Card System](#card-system)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Backend API](#backend-api)

---

## Gameplay

| Action | Control |
|--------|---------|
| Move | `W A S D` |
| Aim | Mouse |
| Activate card | Left Click |
| Switch card slot | `1` – `5` |
| Dash | `Space` |
| Pause | `Escape` |

You start each run with three cards: **Quick Strike**, **Heal Pulse**, and **Wood Shield**. New cards are found in chests, bought in shops, or awarded at shrines as you clear rooms.

### Dimensions & Enemies

| Dimension | Enemies | Final Boss |
|-----------|---------|------------|
| Dark Ages | Dungeon Rat, Skeleton, Slime | Skeleton King |
| Old West | Desert Rat, Bandit, Cactus Thug | *(Final Boss)* |

Each dimension has its own tile set, enemy behavior, and procedurally generated room graph. Rooms connect via doors that only unlock once all enemies in the room are defeated.

### Room Types

| Room | Description |
|------|-------------|
| Combat | Standard enemy encounter |
| Boss | Mini-boss fight before the final boss |
| Shop | Buy cards and items from a Merchant |
| Chest | Free card reward |
| Shrine | Portal to the next dimension |
| Glitch | Special challenge room |

---

## Card System

Cards come in two categories and four rarities.

### Categories

**Active cards** are manually triggered on click and enter a cooldown after use.

| Card type | Effect |
|-----------|--------|
| `ActiveMeleeCard` | Close-range physical strike |
| `ActiveDefenseCard` | Temporary shield (Wood Shield) |
| `ActiveHealCard` | Restore health (Heal Pulse) |
| `ActiveDrainCard` | Drain enemy health into your own |

**Automatic cards** fire on their own when a specific trigger event fires — landing a hit, killing an enemy, taking damage, or dashing.

### Rarities

| Rarity | Color | Effect |
|--------|-------|--------|
| Common | Grey | Baseline stats |
| Rare | Blue | Improved effect |
| Epic | Purple | Strong effect, longer cooldown |
| Legendary | Gold | Maximum effect, longest cooldown |

Cards are defined in `Src/cards/CardCatalog.js` and instantiated via `CardFactory.js`. `CardManager.js` handles the active deck (up to 5 slots), cooldowns, and trigger routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Game engine | Vanilla JavaScript, Canvas API, ES Modules |
| Web pages | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express 5 |
| Database | MySQL 2 |
| Auth | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) |
| Dev server | `npx serve` (frontend), `node --watch` (backend) |
| Sprite authoring | Aseprite |
| Testing | Vitest |

---

## Project Structure

```
Dimension Deck/
│
├── index.html                  # Landing page (game entry point)
├── package.json                # Frontend scripts and dev dependencies
│
├── Src/                        # Game engine — all game logic as ES modules
│   ├── Main.js                 # Bootstrap: creates canvas and starts Game
│   │
│   ├── Core/                   # Engine core
│   │   ├── Game.js             # Root object: owns renderer, input, screen manager, drives the loop
│   │   ├── Renderer.js         # Canvas 2D wrapper (clear, draw, resize)
│   │   ├── InputManager.js     # Keyboard state tracker
│   │   └── MouseManager.js     # Mouse position and click state
│   │
│   ├── Animation/              # Sprite playback
│   │   ├── Animation.js        # Frame timer and looping logic
│   │   └── SpriteSheet.js      # Slices a PNG sheet into frames by cell size
│   │
│   ├── Scenes/                 # Screen states (one active at a time)
│   │   ├── Screen.js           # Base class: update(dt) + draw(renderer)
│   │   ├── StartScreen.js      # Title screen
│   │   ├── GameplayScreen.js   # Main play loop — delegates to RoomManager
│   │   ├── LevelScreen.js      # Between-room transition
│   │   ├── DimensionTransitionScreen.js  # Cutscene when crossing dimensions
│   │   ├── VictoryScreen.js    # Shown on run completion
│   │   └── DefeatScreen.js     # Shown on death
│   │
│   ├── Systems/                # Stateful managers that coordinate multiple objects
│   │   ├── ScreenManager.js    # Owns the active screen and handles transitions
│   │   ├── RoomManager.js      # Loads and ticks the current room
│   │   ├── DimensionManager.js # Tracks which dimension is active, drives generation
│   │   ├── UIManager.JS        # Coordinates all HUD and overlay rendering
│   │   ├── InteractionManager.js  # Proximity checks between player and objects
│   │   └── CooldownSystem.js   # Shared cooldown timer for cards
│   │
│   ├── Entities/               # Game objects with position, health, and behavior
│   │   ├── Entity.js           # Base class: position, velocity, hitbox, HP
│   │   ├── Player.js           # Player: movement, dash, card use, collision
│   │   ├── Enemy.js            # Base enemy: pathfinding, aggro, death
│   │   ├── EnemyBullet.js      # Projectile fired by ranged enemies
│   │   ├── pickups/
│   │   │   └── Credit.js       # Coin pickup dropped on enemy death
│   │   └── Enemies/
│   │       ├── archetypes/     # Shared enemy behavior templates
│   │       │   ├── TankEnemy.js       # High HP, slow, melee
│   │       │   ├── SwarmEnemy.js      # Low HP, fast, rushes in groups
│   │       │   ├── RangedEnemy.js     # Shoots projectiles, keeps distance
│   │       │   ├── BossEnemy.js       # Mini-boss with phase transitions
│   │       │   └── FinalBossEnemy.js  # Dimension-ending boss
│   │       ├── DarkAgesEnemies/
│   │       │   ├── DungeonRat.js      # Swarm type
│   │       │   ├── Skeleton.js        # Ranged type
│   │       │   ├── Slime.js           # Tank type
│   │       │   └── SkeletonKing.js    # Final boss of Dark Ages
│   │       └── OldWestEnemies/
│   │           ├── DesertRat.js       # Swarm type
│   │           ├── Bandit.js          # Ranged type
│   │           └── CactusThug.js      # Tank type
│   │
│   ├── Generation/             # Procedural dungeon layout
│   │   ├── GraphBuilder.js         # Builds a randomized directed acyclic graph of rooms
│   │   ├── RoomTypeAssigner.js     # Labels each graph node (combat, shop, boss, etc.)
│   │   ├── DimensionGenerator.js   # Combines builder + assigner; exposes generateGraphMiniBoss / generateGraphFinalBoss
│   │   └── EncounterTemplates.js   # Defines enemy group presets per room
│   │
│   ├── Physics/
│   │   └── Collision.js        # AABB overlap tests and resolution helpers
│   │
│   ├── World/
│   │   ├── Dimensions/         # Dimension definitions (tile set, enemy pool, room weights)
│   │   │   ├── Dimension.js            # Base class
│   │   │   ├── DarkAgesDimension.js    # Dungeon theme
│   │   │   └── OldWestDimension.js     # Desert theme
│   │   ├── Graph/              # Runtime room graph traversal
│   │   │   ├── RoomGraph.js    # Adjacency list + current-node pointer
│   │   │   └── RoomNode.js     # Single node: room type, connections, cleared flag
│   │   ├── Rooms/              # Room implementations
│   │   │   ├── Room.js         # Base: tile map, entity lists, update/draw
│   │   │   ├── RoomFactory.js  # Picks the right subclass from a RoomNode type
│   │   │   ├── CombatRoom.js   # Spawns enemies; locks doors until all are dead
│   │   │   ├── BossRoom.js     # Spawns a mini-boss
│   │   │   ├── ChestRoom.js    # Presents a card reward
│   │   │   ├── ShopRoom.js     # Spawns a Merchant NPC
│   │   │   ├── ShrineRoom.js   # Contains the dimension portal
│   │   │   └── GlitchRoom.js   # Special challenge room
│   │   └── Objects/            # Interactive / collidable world objects
│   │       ├── GameObject.js   # Base: position, sprite, hitbox
│   │       ├── Wall.js         # Solid boundary tile
│   │       ├── Door.js         # Connects rooms; locks/unlocks on events
│   │       ├── DoorBlocker.js  # Invisible barrier placed in front of locked doors
│   │       ├── Chest.js        # Opens to reveal a card
│   │       ├── Box.js          # Destructible crate
│   │       ├── Rock.js         # Indestructible obstacle
│   │       ├── Spike.js        # Floor hazard — damages the player on contact
│   │       ├── Merchant.js     # NPC that opens the shop UI on interaction
│   │       ├── ShrinePortal.js # Triggers dimension transition on interaction
│   │       ├── GlitchPillar.js # Hazard unique to Glitch rooms
│   │       └── LootTable.js    # Weighted random item selector
│   │
│   ├── cards/                  # Card system
│   │   ├── Card.js             # Abstract base: name, rarity, cooldown, trigger
│   │   ├── ActiveCard.js       # Click-activated card base
│   │   ├── AutomaticCard.js    # Event-triggered card base
│   │   ├── ActiveMeleeCard.js  # Melee strike implementation
│   │   ├── ActiveDefenseCard.js# Shield implementation
│   │   ├── ActiveHealCard.js   # Heal implementation
│   │   ├── ActiveDrainCard.js  # Drain implementation
│   │   ├── CardCatalog.js      # Full list of all cards in the game
│   │   ├── CardFactory.js      # Creates card instances by ID or rarity
│   │   └── CardManager.js      # Manages the player's 5-slot deck and cooldowns
│   │
│   ├── Data/
│   │   └── ShopItems.js        # Static list of items available in the shop
│   │
│   └── Utils/
│       ├── Constants.js        # Global tuning values (speeds, sizes, generation params)
│       ├── Random.js           # randInt, randFloat, weighted random pick
│       ├── Vector.js           # 2D vector math (add, scale, normalize, distance)
│       └── Api.js              # Fetch wrappers for backend calls
│
├── frontend/                   # Web pages outside the game canvas
│   ├── HTML/
│   │   ├── game.html           # Hosts the canvas and loads Main.js
│   │   ├── login.html          # Login / register form
│   │   ├── cards.html          # Card collection browser
│   │   ├── stats.html          # Player statistics dashboard
│   │   └── tutorial.html       # How-to-play guide
│   ├── CSS/
│   │   ├── index.css           # Landing page styles
│   │   ├── game.css            # Game canvas page styles
│   │   ├── login.css           # Auth pages styles
│   │   ├── cards.css           # Card browser styles
│   │   ├── stats.css           # Stats page styles
│   │   └── tutorial.css        # Tutorial page styles
│   └── JavaScript/
│       ├── index.js            # Landing page interactions
│       ├── login.js            # Auth form logic (calls /auth API)
│       ├── cards.js            # Fetches and renders card collection
│       ├── stats.js            # Fetches and renders player stats
│       └── tutorial.js         # Tutorial page interactions
│
├── backend/                    # REST API
│   ├── app.js                  # Express server entry point (port 3001)
│   ├── database.js             # MySQL2 connection pool
│   ├── schema.sql              # Database schema (run once to initialise)
│   └── src/
│       ├── middleware/
│       │   └── auth.js         # JWT verification middleware
│       └── routes/
│           ├── auth.js         # POST /auth/register, POST /auth/login
│           ├── users.js        # GET/PATCH /users/:id
│           ├── cards.js        # GET /cards — card catalog
│           ├── runs.js         # POST /runs — save a completed run
│           ├── leaderboard.js  # GET /leaderboard
│           ├── shop.js         # GET /shop, POST /shop/buy
│           └── stats.js        # GET /stats/:userId
│
├── Assets/                     # Compiled sprites used at runtime (PNG)
│   └── Sprites/
│       ├── action cards/       # Card artwork (action-card, heal-card, wood-shield)
│       ├── drops/              # Coin sprite sheet
│       ├── enemies/            # Enemy sheets (rat, skeleton, spirit)
│       ├── objects/            # Object sprites (glitch pillar, etc.)
│       ├── player/             # Player knight sheet
│       ├── room/               # Room background tiles
│       ├── tiles/              # Tile sets (Dungeon, Old West)
│       └── Website/            # Logo and icons used on web pages
│
└── Assets_Aesprite/            # Source art files (.aseprite / .ase) — edit these in Aseprite
    └── Sprites/                # Same folder structure as Assets/Sprites
```

---

## Setup

### Prerequisites

- **Node.js 18+** — install via [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
. "$HOME/.nvm/nvm.sh"
nvm install 24
node -v   # v24.x.x
npm -v    # 11.x.x
```

- **MySQL 8+** — must be running locally before starting the backend.

### Install dependencies

```bash
# Frontend (game + serve tool)
npm install

# Backend
cd backend
npm install
```

### Configure the backend environment

Create `backend/.env` (a template is already present):

```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dimension_deck
```

### Initialise the database

```bash
mysql -u root -p dimension_deck < backend/schema.sql
```

---

## Running the Project

The game requires both servers to be running at the same time.

**Terminal 1 — Frontend (game engine + static files):**

```bash
npm start          # serves the project at http://localhost:3000
```

**Terminal 2 — Backend API:**

```bash
cd backend
npm start          # Express API at http://localhost:3001
```

Then open `http://localhost:3000` in your browser and click **Play** from the landing page.

For backend development with auto-restart on file change:

```bash
cd backend
npm run dev        # uses node --watch
```

---

## Backend API

Base URL: `http://localhost:3001`

| Method | Route | Auth required | Description |
|--------|-------|:---:|-------------|
| `POST` | `/auth/register` | — | Create a new account |
| `POST` | `/auth/login` | — | Log in, returns JWT |
| `GET` | `/users/:id` | ✓ | Get user profile |
| `PATCH` | `/users/:id` | ✓ | Update user profile |
| `GET` | `/cards` | — | Full card catalog |
| `POST` | `/runs` | ✓ | Save a completed run |
| `GET` | `/leaderboard` | — | Top players by score |
| `GET` | `/shop` | ✓ | Available shop items |
| `POST` | `/shop/buy` | ✓ | Purchase an item |
| `GET` | `/stats/:userId` | ✓ | Player statistics |

Protected routes expect an `Authorization: Bearer <token>` header using the JWT returned by `/auth/login`.
