![](Img/Logo_TEC.png)

**Campus Santa Fe**

**Dimension Deck — Game Design Document**

**Course:**
Software Construction and Decision Making

**Students:**
Jesús José Espinoza Torruco
Vladimir Piñera Reyes
Gonzalo Zamarrón Orrantia

**Student IDs:**
A01781963
A01786772
A01782739

**Delivery Date:**
June 2026

---

# Index

1. [Game Design](#1-game-design)
   - 1.1 [Summary](#11-summary)
   - 1.2 [Gameplay](#12-gameplay)
   - 1.3 [Mindset](#13-mindset)
2. [Technical](#2-technical)
   - 2.1 [Screens](#21-screens)
   - 2.2 [Controls](#22-controls)
   - 2.3 [Cards](#23-cards)
   - 2.4 [Combat](#24-combat)
   - 2.5 [Roguelite Progression and Telemetry](#25-roguelite-progression-and-telemetry)
3. [Level Design](#3-level-design)
   - 3.1 [Themes](#31-themes)
   - 3.2 [Game Flow](#32-game-flow)
4. [Development](#4-development)
   - 4.1 [Derived Classes](#41-derived-classes)
5. [Graphics](#5-graphics)
   - 5.1 [Style Attributes](#51-style-attributes)
   - 5.2 [Sprites](#52-sprites)
6. [Web Platform](#6-web-platform)
7. [Sounds / Music](#7-sounds--music)
8. [Schedule](#8-schedule)

---

# 1. Game Design

## 1.1 Summary

Dimension Deck is a retro-styled top-down action roguelite where every room of the map hides a surprise: a new card to collect, a hidden reward, or an unexpected boss fight. The player builds their deck as they explore two distinct dimensions — the Dark Ages and the Old West — finding attack, defense, and support cards scattered across the world, creating a unique and evolving strategy with every run. Combat is entirely card-based, meaning the hand the player has built determines whether they survive what lies behind the next door.

With a world that shifts themes and challenges as the player progresses and a randomized structure that ensures no two runs ever feel the same, Dimension Deck delivers the tension of a roguelite wrapped in the charm of classic pixel-art adventure.

Dimension Deck sits at the intersection of two genres without belonging fully to either. Unlike *Slay the Spire*, where combat is turn-based and purely strategic, and unlike *Neon White*, where cards are disposable movement tools, Dimension Deck makes cards and real-time movement equally necessary at all times. The player cannot win by standing still and thinking, and cannot win by running without a plan. The closest comparison is: *The Binding of Isaac* meets *Slay the Spire*, but where the deck actively fights back through automated synergies without the player pressing a button.

## 1.2 Gameplay

Dimension Deck is a dynamic game that combines a fast-paced action roguelite with the freedom of a deck builder using a 2D top-down design. It borrows movement and perspective from *The Binding of Isaac* while incorporating the strategic deck management of *Slay the Spire*.

Players use their deck of cards to materialize attacks, defenses, and effects in real time. The combat system uses two categories of cards: **Active Cards**, which the player triggers manually to attack, heal, or defend; and **Automatic Cards**, which activate when certain in-game conditions are met, functioning as passive synergies.

Players navigate randomized rooms to find loot, shops, or enemies, advancing toward the goal of clearing each room and defeating the boss of every dimension to progress.

### Generation Rulebook

Each dimension is built from a sequence of rooms generated at the start of every run. A dimension always contains a minimum of 8 and a maximum of 12 rooms before a Boss node is placed at the end. The exact count is chosen randomly within that range each time, so the player never knows how close they are to the boss until they reach it.

Rooms are not placed in a straight line. The generator builds a small branching map where the player may have two or three possible paths to take at certain points, but all paths eventually converge at the Boss node.

**Room Type Weighting**

| Room Type   | Base Chance | Notes                                   |
|:------------|:-----------:|:----------------------------------------|
| Combat Room | 60%         | Always available                        |
| Chest Room  | 15%         | Drops one card on clear                 |
| Shop Room   | 10%         | Increases over time (see below)         |
| Shrine Room | 10%         | Offers one card upgrade trade           |
| Glitch Room | 5%          | Contains a Glitch Pillar                |

**Shop Room Scaling:** The chance of a Shop Room appearing increases by 10% for every 3 consecutive combat rooms cleared without visiting a shop. This bonus stacks and resets to 0% the moment a Shop Room is entered, preventing the player from going deep into a dimension without access to cards or upgrades.

## 1.3 Mindset

The goal is for the player to feel overwhelmed by the number of enemies on screen, but empowered by the automated synergies their deck produces. The tension comes from managing movement and card rotation at the same time. A good run should feel like controlled chaos, where the player is always one smart card play away from turning a losing fight around.

The emotional target is: *"I was about to die, but my deck saved me."*

---

# 2. Technical

## 2.1 Screens

Dimension Deck uses several core screens organized into three categories: **Navigation & Progression**, **Gameplay & Customization**, and **Economy & Results**.

### Navigation and Progression Screens

**Start Game Screen**

- Purpose: Entry point to the game; the player selects their character and starts a run.
- Elements: Character selector (Knight or Cowboy), Start button, and back navigation.

![Start Game](Img/HUD/HUD_StartGame.png)

**Dimension Map**

- Purpose: A full view of the current dimension, allowing the player to choose their path through rooms.
- Elements:
  - Nodes representing room types (Combat, Chest, Shop, Shrine, Boss).
  - Lines showing valid movement between nodes.
  - Mini-map toggle via the **M** key.

![Dimension Map](Img/HUD/HUD_Map.png)

### Gameplay and Customization Screens

**Room Screen (Gameplay)**

- Purpose: The screen where combat takes place in real time.
- Elements:
  - Player and enemy health bars.
  - Active card hand displayed at the bottom center.
  - Shield and credit counters.

![Gameplay HUD](Img/HUD/HUD_Gameplay.png)

**Combat in Action**

![Combat](Img/HUD/Combat.png)

**Dark Ages Dimension**

![Dark Ages](Img/HUD/Dimension_Dungeon.png)

**Old West Dimension**

![Old West](Img/HUD/Dimension_OldWest.png)

**Deck Management Screen**

- Purpose: Allows the player to review and manage their full deck at any time.
- Elements:
  - Grid view of all cards currently in the player's deck.
  - Filter and sort options by rarity and type.
  - Slot counts for active and automatic card pools.

![Manage Deck](Img/HUD/HUD_ManageDeck.png)

**Pause Menu**

- Purpose: Pauses the run and provides options to resume or quit.

![Paused](Img/HUD/Paused.png)

### Economy and Result Screens

**Shop Screens**

- Purpose: The player spends earned dimensional credits to buy cards, sell cards, or upgrade card slots.

| Buy | Sell | Upgrade Slots |
|:---:|:----:|:-------------:|
| ![Store Buy](Img/HUD/Store_Buy.png) | ![Store Sell](Img/HUD/Store_Sell.png) | ![Store Upgrade](Img/HUD/Store_Upgrade.png) |

## 2.2 Controls

### Movement and Navigation

| Key | Action |
|:----|:-------|
| W / Arrow Up | Move up |
| A / Arrow Left | Move left |
| S / Arrow Down | Move down |
| D / Arrow Right | Move right |
| Mouse Cursor | Aim at enemies or target card destinations |
| M (tap) | Toggle mini-map overlay |
| M (hold) | Open full-screen dimension map |

### Card Actions

| Key | Action |
|:----|:-------|
| 1 | Execute first active card (leftmost slot) |
| 2 | Execute second active card |
| 3 | Execute third active card |
| 4 | Execute fourth active card (requires slot expansion) |
| 5 | Execute fifth active card (requires slot expansion) |
| Left Click | Confirm and execute the selected card at cursor position |

### Combat and Utility

| Key | Action |
|:----|:-------|
| Spacebar | Dodge or dash in the current movement direction |
| E | Interact with chests, Glitch Pillars, and the shop |
| Tab | Toggle deck management overlay |
| Escape | Pause the game or close any open menu |

### Technical UX Notes

- **Smart Mapping:** When a card is played, keys shift left to eliminate dead slots in the middle of the hand.
- **Map Persistence:** Room types are permanently revealed once the player enters each room, even on backtrack.
- **UI Tooltips:** In the deck management screen, hovering over a card displays its full stats.

## 2.3 Cards

### 2.3.1 Card System

Cards are the foundation of combat and progression in Dimension Deck. Every offensive and defensive action is executed through the player's deck, which is divided into two categories.

**Active Cards (Manual Execution)**

Active cards are weapons the player triggers manually to deal damage, heal, or generate shields.

- Capacity: Starts at 3 slots, expandable to a maximum of 5.
- Rotation: Once played, the card enters a cooldown period before returning to the hand. This prevents spamming a single card and forces thoughtful timing.

**Automatic Cards (Trigger-Based)**

Automatic cards sit in a secondary pool and activate when specific combat conditions are met, functioning as passive synergies.

- Capacity: Supports between 4 and 8 slots.
- Function: These cards reward synergistic deck-building without requiring player input.

**Card Rarities**

| Rarity | Color | Description |
|:-------|:-----:|:------------|
| Common | Gray | Base-level cards found frequently. Starting deck is composed of these. |
| Uncommon | Green | Slightly enhanced cards with improved values. |
| Rare | Blue | Improved cards with higher damage, healing, or utility. |
| Epic | Purple | Powerful mechanics that serve as the cornerstone of a specific build strategy. |
| Legendary | Gold | Game-changing cards that fundamentally alter how the player approaches every run. |

### 2.3.2 Card Resistance System

Expanding the player's deck increases their power, but also activates the Card Resistance system. As more card slots are unlocked, enemies gain resistance to card damage, forcing the player to keep evolving their strategy throughout the run.

**Resistance Scaling Formula:**

> Resistance % = (Active Card Slots − 3) × 5%

| Active Card Slots | Resistance Applied |
|:-----------------:|:------------------:|
| 3 (base)          | 0%                 |
| 4                 | 5%                 |
| 5 (max)           | 10%                |

The automatic card pool adds its own separate resistance layer:

> For every 2 automatic slots above the base 4, enemies gain an additional 3%.

| Automatic Card Slots | Additional Resistance |
|:--------------------:|:---------------------:|
| 4 (base)             | +0%                   |
| 6                    | +3%                   |
| 8 (max)              | +6%                   |

Both values stack. A player with 5 active slots and 8 automatic slots faces a total of **16% damage reduction** on all enemies.

### 2.3.3 Card Acquisition

**Field Rewards**

- **Combat:** Defeating the final boss of each dimension grants a choice of 3 cards from a randomized selection.
- **Treasure Chests:** Hidden throughout procedural floors; contain a randomized card.

**The Dimension Store (Shop)**

- Earned dimensional credits can be spent on a rotating stock of 5 cards per visit.
- Players can also sell unwanted cards and purchase slot upgrades.
- Prices range from 65 to 380 credits depending on rarity.

**Glitch Pillars**

Hidden objects scattered across rooms that do not appear on every run. When the player touches a Glitch Pillar, it rewards them with a single card pulled randomly from any rarity tier. The card goes directly into the deck — no selection screen.

### 2.3.4 Card Upgrades

Every card has three levels: **Base**, **Upgraded**, and **Max**.

- Acquiring a second copy of the same card merges them automatically, advancing to Upgraded.
- Acquiring a third copy advances to Max.
- Additional copies of a Max-level card convert into dimensional credits based on rarity:

| Rarity | Credits Returned |
|:------:|:----------------:|
| Common | 10               |
| Rare   | 25               |
| Epic   | 50               |
| Legendary | 100           |

**Active Cards**
- *Upgraded:* Cooldown reduced by 30%.
- *Max:* Base effect value increased by 40%; unlocks a secondary effect.

**Automatic Cards**
- *Upgraded:* Trigger condition widens, activating in more situations.
- *Max:* Potency of the effect increases (larger damage bonus, longer duration, or stronger status).

### 2.3.5 Combat: Card Rules

**Active Card Execution**

- **Instant Activation:** Pressing the corresponding number key triggers the card's effect immediately. There is no cast time or mana cost.
- **Cooldown State:** After activation, the slot dims and displays a recharge animation. The player cannot use that slot until the timer finishes.
- **Variable Recovery:** Common cards have short cooldowns (2–6 s); Legendary cards have long cooldowns (10–18 s).

**Damage and Collision**

- Active melee cards deal damage to all enemies whose hitbox falls within a cone-shaped arc in the aim direction.
- Drain cards find and damage the nearest living enemy.
- Defensive cards apply a flat shield or invincibility frames instantly with no directional requirement.

**Hand Cycling**

Since there is no mana limit, the primary skill gap is rotation management. Players must cycle through their 1–5 keys to ensure an offensive or defensive option is always available.

### 2.3.6 Type of Cards

**Active Cards**

| # | Name | Rarity | Cooldown | Effect |
|:-:|:-----|:------:|:--------:|:-------|
| 1 | Quick Strike | Common | 2 s | Deal 25 damage to enemies within 80 px in a forward cone |
| 2 | Heal Pulse | Common | 5 s | Restore 25 HP |
| 3 | Wood Shield | Common | 6 s | Absorb the next 20 damage |
| 4 | Iron Fist | Rare | 5 s | Deal 55 damage to enemies within 48 px |
| 5 | Blood Siphon | Rare | 10 s | Drain the nearest enemy for 45 damage and restore 20 HP |
| 6 | Stone Wall | Rare | 10 s | Absorb the next 50 damage |
| 7 | Remedy Vial | Rare | 8 s | Drink a swift remedy restoring 42 HP |
| 8 | Nova Burst | Epic | 9 s | Deal 110 damage to all enemies within 72 px |
| 9 | Mending Wave | Epic | 12 s | Restore 85 HP |
| 10 | Mirror Guard | Epic | 14 s | Gain 58 shield and 1.5 s of invincibility |
| 11 | Shadow Blade | Legendary | 10 s | Deal 250 damage to enemies within 48 px |
| 12 | Phoenix Elixir | Legendary | 18 s | Fully restore all HP |
| 13 | Diamond Fortress | Legendary | 15 s | Absorb the next 100 damage |

**Automatic Cards**

| # | Name | Rarity | Trigger | Effect |
|:-:|:-----|:------:|:-------:|:-------|
| 1 | Lifetap | Common | On Kill | Restore 20 HP each time you kill an enemy |
| 2 | Iron Skin | Common | On Attack | Gain 8 shield each time you hit an enemy |
| 3 | Quick Recovery | Common | On Hit Received | Instantly recover 8 HP when struck |
| 4 | Wound Echo | Common | On Hit | Deal 10 bonus damage to the struck enemy |
| 5 | Rebound | Rare | On Hit Received | Deal 15 damage to enemies within 48 px |
| 6 | Berserker Rush | Rare | On Dash | Dashing deals 20 damage to enemies within 32 px |
| 7 | Soul Siphon | Rare | On Kill | Killing an enemy restores 18 HP and grants 10 shield |
| 8 | Last Stand | Epic | On Hit below 30% HP | Gain 2 s of invincibility |
| 9 | Chain Kill | Epic | On Kill | Killing an enemy deals 25 damage to all others within 64 px |

### 2.3.7 Card Design

The art of each card conveys its function at a glance. Defense cards use cold, metallic tones; damage cards use warm, aggressive colors; heal cards use warm greens and golds.

**Action Cards — Sample Artwork**

| Blood Siphon | Diamond Fortress | Healing Potion |
|:---:|:---:|:---:|
| ![Blood Siphon](Img/Cards/Action_Cards/blood-siphon.png) | ![Diamond Fortress](Img/Cards/Action_Cards/diamond-fortress.jpeg) | ![Healing Potion](Img/Cards/Action_Cards/healing-potion.png) |

| Iron Fist | Mending Wave | Mirror Guard |
|:---:|:---:|:---:|
| ![Iron Fist](Img/Cards/Action_Cards/iron-fist.png) | ![Mending Wave](Img/Cards/Action_Cards/mending-wave.png) | ![Mirror Guard](Img/Cards/Action_Cards/mirror-guard.png) |

| Nova Burst | Phoenix Elixir | Quick Strike |
|:---:|:---:|:---:|
| ![Nova Burst](Img/Cards/Action_Cards/nova-burst.png) | ![Phoenix Elixir](Img/Cards/Action_Cards/phoenix-elixir.png) | ![Quick Strike](Img/Cards/Action_Cards/quick-strike.png) |

| Remedy Vial | Shadow Knife | Stone Wall | Wood Shield |
|:---:|:---:|:---:|:---:|
| ![Remedy Vial](Img/Cards/Action_Cards/remedy-vial.png) | ![Shadow Knife](Img/Cards/Action_Cards/shadow-knife.png) | ![Stone Wall](Img/Cards/Action_Cards/stone-wall.png) | ![Wood Shield](Img/Cards/Action_Cards/wood-shield.png) |

**Automatic Cards — Sample Artwork**

| Aftershock | Berserker Rush | Chain Kill | Decimator |
|:---:|:---:|:---:|:---:|
| ![Aftershock](Img/Cards/Automatic_Cards/aftershock.png) | ![Berserker Rush](Img/Cards/Automatic_Cards/berserker-rush.png) | ![Chain Kill](Img/Cards/Automatic_Cards/chain-kill.png) | ![Decimator](Img/Cards/Automatic_Cards/decimator.png) |

| Iron Skin | Last Stand | Life Tap | Phantom Step |
|:---:|:---:|:---:|:---:|
| ![Iron Skin](Img/Cards/Automatic_Cards/iron-skin.png) | ![Last Stand](Img/Cards/Automatic_Cards/last-stand.png) | ![Life Tap](Img/Cards/Automatic_Cards/life-tap.png) | ![Phantom Step](Img/Cards/Automatic_Cards/phantom-step.png) |

| Quick Recovery | Rebound | Soul Siphon | Wound Echo |
|:---:|:---:|:---:|:---:|
| ![Quick Recovery](Img/Cards/Automatic_Cards/quick-recovery.png) | ![Rebound](Img/Cards/Automatic_Cards/rebound.png) | ![Soul Siphon](Img/Cards/Automatic_Cards/soul-siphon.png) | ![Wound Echo](Img/Cards/Automatic_Cards/wound-echo.png) |

## 2.4 Combat

### 2.4.1 Combat Overview

Combat in Dimension Deck is a real-time, continuous experience where enemies spawn and attack immediately upon the player entering a room. The system requires simultaneous attention to spatial awareness and card-based decision-making.

- **Movement and Defense:** Players use WASD or arrow keys for top-down directional control to physically dodge projectiles and melee strikes.
- **The Dodge Mechanic:** The spacebar triggers a dash, providing a brief burst of movement to escape being surrounded.
- **Card Execution:** Players aim with the mouse and execute active cards using number keys 1–5.
- **Telegraphed Danger:** Enemy attacks are telegraphed via wind-up animations or visible paths projected on the floor, giving the player seconds to react.

### 2.4.2 Enemy Behavioral Archetypes

All enemies are built upon three foundational archetypes that dictate their AI and physical presence.

**Swarm Archetype**
- Small enemies (16 × 16 px) that use a seek-and-close movement pattern.
- They pressure the player by crowding the playable space, forcing constant movement to avoid contact damage.

**Tank Archetype**
- Large, high-health sprites that move slowly and are highly resistant to knockback.
- They act as obstacles that deal massive contact damage, requiring the player to maintain distance.

**Ranged Archetype**
- Mid-sized enemies that maintain a safe distance from the player.
- They fire projectiles on a cooldown, forcing the player to dodge across the room.

### 2.4.3 Dimension-Specific Bestiary

**The Dark Ages**

| Enemy | Archetype | Stats | Behavior |
|:------|:---------:|:-----:|:---------|
| Dungeon Rat | Swarm | 16 HP / 82 spd / 6 dmg | Fast-moving; relies on numbers to corner the player |
| Skeleton | Tank | 90 HP / 38 spd / 18 dmg | High HP; uses slow but heavy telegraphed melee swings |
| Spirit | Ranged | Medium HP | Fires energy projectiles; phases through obstacles |
| Two-Headed Giant | Boss | Very high HP | Multi-phase boss with charge and stomp attacks |
| Skeleton King | Final Boss | 900 HP / 32 spd | Phase-based boss; fires skull projectiles at 1.5 shots/s |

![Skeleton](Img/Enemy_Sprites/skeleton-head-Sheet.png)

![Spirit](Img/Enemy_Sprites/spirit-Sheet.png)

![Skeleton King](Img/Enemy_Sprites/SkeletonKing-Spritesheet.png)

![Two-Headed Giant](Img/Enemy_Sprites/Two_headed_giant_Sprite-Sheet.png)

**Old West**

| Enemy | Archetype | Stats | Behavior |
|:------|:---------:|:-----:|:---------|
| Desert Rat | Swarm | 16 HP / 82 spd / 6 dmg | Aggressive small pests; attack in waves |
| Bandit | Ranged | 30 HP / 52 spd / 8 dmg | Strafes while firing pistol shots at 1.5 shots/s from ~180 px |
| Minotaur | Tank | High HP | Charges at the player, dealing massive contact damage |
| Iron Marshal | Final Boss | Very high HP | Phase-based boss; multi-attack pattern combining ranged and melee |

![Bandit](Img/Enemy_Sprites/bandit.png)

![Minotaur](Img/Enemy_Sprites/minotaur.png)

![Brown Rat](Img/Enemy_Sprites/BrownRat_SpriteSheet.png)

![Grey Rat](Img/Enemy_Sprites/GreyRat_SpriteSheet.png)

![Iron Marshal](Img/Enemy_Sprites/IronMarshal-SpriteSheet.png)

### 2.4.4 Strategic Progression: Card Resistance

To ensure the game remains challenging, the Card Resistance system scales with the player's power. As the player expands their card slots, enemies gain resistance to specific card types, preventing a single strategy from dominating the entire run. See Section 2.3.2 for the full resistance formula.

## 2.5 Roguelite Progression and Telemetry

Runs are independent, and permanent death resets the player back to the start with their current deck lost. Dimensional credits earned during a run carry over and can be spent on permanent upgrades that expand stats and maximum card capacity across future runs.

**Key Performance Indicators tracked:**

1. **Time per dimension:** Average minutes spent in Old West vs. Dark Ages per run. Identifies pacing issues and difficulty spikes.
2. **Most discarded card:** Which active card is removed most often at the shop. A frequently discarded card signals it underperforms relative to its cost.
3. **Run length at death:** The room number where most Game Over screens occur. Pinpoints difficulty spikes in the procedural layout.

The game also tracks: win/loss ratio, card usage frequency, credit earnings and spending patterns, and average enemies killed per run. All data is stored per-user in the backend database and is visible to administrators through the Admin Panel.

---

# 3. Level Design

## 3.1 Themes

### 3.1.1 Ambience

Dimension Deck uses a 16-bit pixel-art visual style, referencing classics such as *The Legend of Zelda: A Link to the Past* and early SNES RPGs. The game features two distinct dimensions, each with its own look and feel.

**The Old West**

A dusty frontier dimension with sandy deserts and abandoned outpost towns. The wide-open spaces create a sense of freedom and lawlessness that contrasts sharply with the next world.

![Old West Room](Img/Rooms/roomOldWest.png)

![Old West Doors](Img/Rooms/doors-oldwest.png)

![Old West Store](Img/Rooms/store-oldwest.png)

![Old West Tiles](Img/Rooms/Tiles/tilesOldWest.png)

**The Dark Ages**

A fantasy dungeon dimension set inside a castle and caverns. Inspired by *Dungeons & Dragons*, the enclosed stone walls and dim lighting create a feeling of constant threat and confinement.

![Dungeon Room](Img/Rooms/roomDungeon.png)

![Dungeon Doors](Img/Rooms/doors-dungeon.png)

![Dungeon Store](Img/Rooms/store-dungeon.png)

![Dungeon Tiles](Img/Rooms/Tiles/tilesDungeon.png)

### 3.1.2 Objects

#### 3.1.2.1 Ambient

- **Player Character:** 32 × 32 px sprite. Larger size makes the hero stand out against the background and enemies.
- **Theme Elements:** Decorative items (desert plants, stone pillars, torches) ground the player in each dimension.

#### 3.1.2.2 Interactive

| Object | Interaction | Effect |
|:-------|:------------|:-------|
| Card Reward Chest | Press E after room clear | Draws 1 card; disappears if skipped |
| Dimension Store | Automatic on enter | Rotating stock of 5 cards for sale; also allows selling and slot upgrades |
| Glitch Pillar | Walk into it | Instantly grants 1 random card (no selection screen) |
| Portal | Walk into it | Transitions to the next dimension after the boss is defeated |

![Glitch Pillar](Img/Animations/glitch_pilar.png)

![Portal](Img/Animations/portal-Sheet.png)

![Coin](Img/Animations/coin-Sheet.png)

### 3.1.3 Challenges

- **Real-Time Combat:** Enemies move and attack the moment the player enters the room. The player must constantly dodge or block incoming projectiles and melee hits while playing cards to deal damage.
- **Attack Visualization:** Most enemies telegraph attacks through animations or visible floor markers, giving the player seconds to react.
- **Card Resistance:** As the deck grows, enemies develop resistances, forcing the player to change strategy throughout the run.
- **Boss Battles:** Each dimension ends with a boss fight. The boss changes behavior between phases, testing both deck quality and mechanical skill.
- **Procedural Rooms:** Every room is randomized — the player never knows if the next room contains dangerous enemies, traps, loot, or the level boss.
- **Permanent Death:** Losing all health ends the run and the current deck is lost, requiring a fresh start.

## 3.2 Game Flow

1. **Start of Run:** A run begins in one of the two dimensions. The player enters the first room with a starter deck (Quick Strike, Heal Pulse, Wood Shield), full directional control, and 100 HP.
2. **Clearing Rooms:** To move forward, the player must eliminate all enemies in a combat room or complete the room's objective. Cleared rooms drop dimensional credits or cards.
3. **Dimension Map:** Between rooms the player sees the branching map and selects their next path.
4. **Shop:** Shop rooms appear periodically, allowing the player to buy cards, sell cards, or upgrade card slots.
5. **Final Boss Encounter:** At the end of the dimension's node path, the player fights the Final Boss. Defeating it opens a portal to the next dimension.
6. **Dimension Transition:** The portal transports the player into the new dimension with different enemies, visuals, and card drop pools. Credits and deck contents carry over.
7. **Victory / Defeat:** Defeating both dimension bosses completes the run and triggers the Victory screen. Losing all HP at any point triggers the Defeat screen.

---

# 4. Development

The codebase is organized around a set of abstract base classes that define shared behavior, keeping individual systems extensible and the overall architecture clean.

- **Entity:** Root class for anything that exists in the game world. Holds position, velocity, health, and a basic update/render cycle.
- **Card:** Defines the structure every card must follow: name, rarity, cooldown, effect function, and card type flag (active or automatic).
- **Enemy:** Extends Entity. Adds abstract methods for movement behavior, attack patterns, a Card Resistance value, and a drop table reference.
- **Room:** Container for a playable space — fixed 480 × 352 px across a 15 × 11 tile grid — with spawn points, exit conditions, and lists of enemies and objects.
- **Dimension:** Groups a set of room types, an enemy pool, a visual theme, and a boss reference into a single traversable dimension.

## 4.1 Derived Classes

**Player (extends Entity)**
- Rendered at 32 × 32 px.
- Manages the active card slot system (3 slots, expandable to 5), the automatic card pool (4–8 slots), and dimensional credit tracking.
- Handles wall collision, mouse-based aim direction, and fires automatic card triggers on combat events (dealing damage, killing an enemy, taking damage, or dashing).

**ActiveMeleeCard, ActiveHealCard, ActiveDefenseCard, ActiveDrainCard (extend ActiveCard)**
- *ActiveMeleeCard:* Cone-shaped area damage to all enemies within a configurable range and spread angle.
- *ActiveHealCard:* Restores a fixed HP amount; `null` heal amount triggers a full restore.
- *ActiveDefenseCard:* Grants flat shield and optional invincibility frames.
- *ActiveDrainCard:* Finds the nearest living enemy, damages it, and returns a portion as healing.

**AutomaticCard (extends Card)**
- Sits in the automatic pool and fires its effect when a trigger condition is met, without player input.
- Supported triggers: `on_attack`, `on_kill`, `on_hit_received`, `on_dash`.
- All automatic cards are defined as object instances in `CardCatalog.js` rather than individual subclasses.

**SwarmEnemy, TankEnemy, RangedEnemy (extend Enemy)**
- *SwarmEnemy:* Seek-and-close movement; deals contact damage.
- *TankEnemy:* Slow movement; very high HP and contact damage.
- *RangedEnemy:* Maintains distance; fires projectiles at a set rate and preferred distance.

**Dimension-specific enemies (extend archetypes)**
- Dark Ages: `DungeonRat (Swarm)`, `FallenKnight (Tank)`, `Spirit (Ranged)`, `SkeletonKing (Boss)`
- Old West: `DesertRat (Swarm)`, `Minotaur (Tank)`, `Bandit (Ranged)`, `TheIronMarshal (Boss)`

**BossEnemy (extends Enemy)**
- Adds a phase list and a phase transition trigger.
- Boss sprites are larger than standard enemies (80 × 80 px for SkeletonKing).
- Each dimension has its own Final Boss.

**CombatRoom, ShopRoom, ChestRoom, BossRoom, GlitchRoom, ShrineRoom (extend Room)**
- Each overrides spawn logic and exit conditions within the fixed 480 × 352 px, 15 × 11 tile grid.
- *CombatRoom:* Spawns enemies from the dimension pool; unlocks exits on full clear.
- *ShopRoom:* Spawns the merchant NPC; pre-clears itself; provides the interactive store overlay.
- *ChestRoom:* Spawns one chest; exits after interaction.
- *BossRoom:* Spawns the dimension Final Boss; fires the dimension-advance callback on defeat.
- *GlitchRoom:* Contains a Glitch Pillar that grants a random card on contact.
- *ShrineRoom:* Offers a single card upgrade trade.

---

# 5. Graphics

## 5.1 Style Attributes

The game uses a **16-bit pixel-art aesthetic**, drawing from Super Nintendo titles such as *The Legend of Zelda: A Link to the Past*, *The Escapists*, and the *Mario & Luigi* saga. Each dimension has a unique visual identity that provides clear spatial feedback.

- **Resolution:** 16 × 16 px per tile.
- **Room Size:** 480 × 352 px (15 × 11 tile grid).
- **Style:** Pixel art in 2D top-down perspective.

**HUD Layout**
- **Cards (bottom center):** The active card hand displayed in the lower central area. Selected cards are highlighted.
- **Player HP (bottom right):** Current health and shield values.
- **Deck Menu (bottom left):** Opens the full deck for slot management and card review.

**Visual Feedback**
- When the player takes damage, the screen flashes red briefly.
- Enemies briefly turn red when hit.
- Card acquisition displays the card image prominently to draw the player's attention.

## 5.2 Sprites

**Player Characters**

| Knight | Cowboy |
|:------:|:------:|
| ![Knight Spritesheet](Img/Player_Sprites/Knight-Spritesheet.png) | ![Cowboy Sheet](Img/Player_Sprites/cowboy-Sheet.png) |

Both player characters are rendered at 32 × 32 px and include:
- Idle animations in 4 directions (left, right, up, down)
- Walking animations in 4 directions
- Take-damage animation
- Death animation

**Enemy Sprites (Dark Ages)**

| Skeleton | Spirit | Skeleton King | Two-Headed Giant |
|:--------:|:------:|:-------------:|:----------------:|
| ![Skeleton](Img/Enemy_Sprites/skeleton-head-Sheet.png) | ![Spirit](Img/Enemy_Sprites/spirit-Sheet.png) | ![Skeleton King](Img/Enemy_Sprites/SkeletonKing-Spritesheet.png) | ![Two-Headed Giant](Img/Enemy_Sprites/Two_headed_giant_Sprite-Sheet.png) |

**Enemy Sprites (Old West)**

| Bandit | Minotaur | Brown Rat | Grey Rat | Iron Marshal |
|:------:|:--------:|:---------:|:--------:|:------------:|
| ![Bandit](Img/Enemy_Sprites/bandit.png) | ![Minotaur](Img/Enemy_Sprites/minotaur.png) | ![Brown Rat](Img/Enemy_Sprites/BrownRat_SpriteSheet.png) | ![Grey Rat](Img/Enemy_Sprites/GreyRat_SpriteSheet.png) | ![Iron Marshal](Img/Enemy_Sprites/IronMarshal-SpriteSheet.png) |

**Tiles and Rooms**

| Dark Ages Tiles | Old West Tiles |
|:---------------:|:--------------:|
| ![Dungeon Tiles](Img/Rooms/Tiles/tilesDungeon.png) | ![Old West Tiles](Img/Rooms/Tiles/tilesOldWest.png) |

---

# 6. Web Platform

Dimension Deck includes a full web platform that serves as the player's hub for account management, statistics, and game access. The platform is built with Vanilla JavaScript and a Node.js/Express backend connected to a MySQL database.

## 6.1 Pages

**Main Menu**

The landing page where players can access the game, view their profile, and navigate the site.

![Main Menu](Img/WebPage/Menu.png)

**Login / Sign Up**

Players create accounts or log in to track their runs and scores.

![Login & Signup](Img/WebPage/Login_Signup.png)

**Cards Page**

A browseable catalog of all available cards in the game, including stats, rarity, and type.

![Cards](Img/WebPage/Cards.png)

**Stats Page**

Personal statistics dashboard for logged-in players: win rate, best score, damage dealt, rooms cleared, card history, and leaderboard.

![Stats](Img/WebPage/Stats.png)

**Tutorial Page**

An interactive guide explaining game mechanics, controls, and card types.

![Tutorial](Img/WebPage/Tutorial.png)

**Admin Panel**

Restricted to admin accounts. Displays aggregate statistics across all players: total runs, global win rate, record score, per-player leaderboard, and performance charts.

![Admin Panel](Img/WebPage/AdminPanel.png)

## 6.2 Logo

![Dimension Deck Logo](Img/Icons/DimensionDeck_Logo.png)

---

# 7. Sounds / Music

## 7.1 Style Attributes

The soundtrack is a core component of the game experience, built around a 16-bit aesthetic using synthesized sound and short looping compositions that reinforce the repetitive nature of a roguelite. The primary goal of the soundtrack is to generate constant tension, communicating that the player is in a dangerous environment where enemies can appear at any moment.

Each dimension has its own distinct soundtrack:

- **Old West:** Inspired by classic western desert styles. Slow tempos; conveys isolation, vastness, and latent danger.
  - Reference: https://www.youtube.com/watch?v=KhChHmk1o8c

- **Dark Ages:** Inspired by dark fantasy dungeon settings and classic games such as *The Legend of Zelda*. Conveys confinement and constant threat.
  - Reference: https://www.youtube.com/watch?v=Nxx3Ti83TYk

## 7.2 Sounds Needed

All sound effects follow a 16-bit retro aesthetic.

**UI Sounds**
- Card reveal
- Card played
- Menu selection — https://www.freesound.org/people/ZeltBolt/sounds/833055/

**Interaction Sounds**
- Chest opened
- Glitch Pillar activated
- Shop purchase / sell
- Card upgrade merge

**Combat Sounds**
- Player takes damage
- Enemy takes damage / dies
- Dash / dodge
- Projectile fired / impact

**Ambient Sounds**
- Desert wind — https://www.freesound.org/people/felix.blume/sounds/156414/
- Whispering distant voices (Dark Ages)

## 7.3 Music Needed

| Context | Track Reference |
|:--------|:----------------|
| Dungeon exploration | https://www.newgrounds.com/audio/listen/625484 |
| Combat | https://www.newgrounds.com/audio/listen/76637 |
| Final boss battle | https://www.newgrounds.com/audio/listen/436762 |
| Main menu | https://www.playonloop.com/2020-music-loops/misty-dungeon/ |
| Defeat screen | https://www.newgrounds.com/audio/listen/368887 |
| Victory screen | https://www.newgrounds.com/audio/listen/1323003 |
| Credits screen | https://www.newgrounds.com/audio/listen/11684 |

---

# 8. Schedule

| Week | Milestone | Tasks |
|:----:|:----------|:------|
| 1 | Core System | Entity and player base classes; basic movement and collision; canvas rendering pipeline |
| 2 | Gameplay & Card System | Active and automatic card classes; cooldown system; CardCatalog; starter deck |
| 3 | Procedural Map Design | Room generator; branching dimension map; room type weighting; Glitch Pillar and Chest logic |
| 4 | Enemies & Combat | Swarm, Tank, and Ranged archetypes; dimension-specific enemies; boss phase system; Card Resistance scaling |
| 5 | UI / UX | HUD (health, shield, card slots, minimap); Deck Management screen; Pause menu; Shop UI |
| 6 | Web Platform | Node.js/Express backend; MySQL schema; authentication (JWT); player stats API; leaderboard |
| 7 | Integration & Polish | Frontend–backend integration; admin panel; telemetry endpoints; sprite polish; audio integration |
| 8 | Testing & Delivery | Full playtest; balance pass; bug fixes; documentation (GDD, SRS, UML); final submission |
