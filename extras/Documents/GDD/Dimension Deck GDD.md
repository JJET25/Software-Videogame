Campus Santa Fe

Dimension Deck  
Game Design Document

Course: Software Construction and Decision Making

Students:  
Jesús José Espinoza Torruco  
Vladimir Piñera Reyes  
Gonzalo Zamarrón Orrantia

Matriculate:  
A01781963  
A01786772  
A01782739

Delivery Date:  
June 2026

# Index

1\. Game Design	2

1.1 Summary	2

1.2 Gameplay	2

Generation Rulebook	3

1.3 Mindset	4

2\. Technical	5

2.1 Screens	5

2.2 Controls	9

2.3 Cards	11

2.3.1 Card System	11

2.3.2 Synergy System	13

2.3.3 Card Acquisition	14

2.3.4 Card Upgrades	15

2.3.5 Combat: Card Rules	17

2.3.6 Type of Cards	18

2.3.7 Card Design	19

2.4 Combat	20

2.4.1 Combat Overview: Real-Time Tactical Movement	20

2.4.2 Enemy Behavioral Archetypes	20

2.4.3 Dimension-Specific Bestiary	21

2.4.4 Strategic Progression: Card Resistance	22

2.5 Roguelite Progression and Telemetry	22

3\. Level Design	23

3.1 Themes	23

3.1.1 Ambience	23

3.1.2 Objects	24

3.1.2.1 Ambient	24

3.1.2.2 Interactive	24

3.1.3 Challenges	25

3.2 Game Flow	26

4\. Development	27

4.1 Derived Classes	28

5\. Graphics	31

5.1 Style Attributes	31

5.3 Sprites	33

6\. Sounds/Music	36

6.1 Style Attributes	36

6.2 Sounds Needed	36

6.3 Music Needed	37

7\. Web Platform	38

8\. Schedule	39

# **1\. Game Design** {#1.-game-design}

## **1.1 Summary** {#1.1-summary}

A retro-styled roguelite adventure game with a 16-bit pixel art aesthetic, where every room of the map hides a surprise: a new card to collect, a hidden reward, or an unexpected boss fight. The player builds their deck as they explore, finding attack, defense, and support cards scattered across the thematic dimensions, creating a unique and evolving strategy with every run. Combat is real-time and entirely card-driven, meaning the hand you built determines whether you survive what's behind the next door. 

Dimension Deck sits at the intersection of two genres without belonging fully to either. Unlike *Slay the Spire*, where combat is turn-based and purely strategic, and unlike *Neon White*, where cards are disposable movement tools, Dimension Deck makes cards and real-time movement equally necessary at all times. You cannot win by standing still and thinking, and you cannot win by running without a plan. The closest comparison is: *The Binding of Isaac* meets *Slay the Spire*, but where your deck actively fights back through automated synergies without you pressing a button. 

## **1.2 Gameplay** {#1.2-gameplay}

Dimension Deck combines a fast-paced action roguelite with the strategic freedom of a deck  
builder presented in a 2D top-down view. It borrows the movement and spatial pressure of The Binding of Isaac and layers on the card management depth of Slay the Spire.

The players use a deck of cards to materialize attacks, defenses, and effects in real time. The combat mechanics are split into two card categories: Active cards, which the player triggers manually to deal damage, heal or gain shields; and automatic cards, which fire on their own when defined trigger conditions are met, rewarding smart deck construction with passive power.

The player navigates procedurally generated rooms to find loot, shops, or enemies. The goal of each dimension is to clear enough rooms to reach and defeat the final boss, then transition into the next dimension.

**Generation Rulebook**  
Each dimension is built from a sequence of rooms generated at the start of every run. A dimension always contains a minimum of 8 rooms and a maximum of 12 rooms before a Boss node is placed at the end. The exact number is chosen randomly within that range each time, so the player never knows how close they are to the boss until they reach it.

Rooms are not placed in a straight line. The generator builds a small branching map where the player may have two or three possible paths to take at certain points, but all paths eventually converge at the Boss Node.

**Room Type Weighting**

| Room Type | Base Chance | Notes |
| :---- | :---- | :---- |
| Combat Room | High | Unlocks exits on full clear |
| Shop Room | Medium | Merchant with buy, sell and upgrade |
| Chest Room | Medium | Free random card reward or credits on interaction |
| Shrine Room | Low | Portal that transports the player to the next dimension |
| Glitch Room | Low | Contains a Glitch Pillar that grants a random card on interaction |
| Mr. Bombastic | Rare | A small Easter Egg |

**1.3 Mindset**

We want the player to feel overwhelmed by the number of enemies on screen but empowered by the automated synergies their deck produces. The tension comes from managing movement and card rotation at the same time. A good run should feel like controlled chaos, where the player is always one smart card play away from turning a losing fight around. The emotional target is: *"I was about to die, but my deck saved me."* 

# **2\. Technical** {#2.-technical}

## **2.1 Screens** {#2.1-screens}

## Dimension Deck uses different core screens, each with its own identity and utility within the core gameplay loop. Screens are divided into three categories: Navigation and progression screens, gameplay and customization screens and economy and result screens

**Navigation and progression screens**  
**Main Menu**

* Purpose: Entry screen with player authentication (login / register via JWT), settings, credits and quit  
* Elements: New Game, Continue, Settings/Options, Credits, and Quit.  
* Visuals: Game logo, version number.

![Main Menu](Img/HUD/HUD_StartGame.png)

**Dimension Map**

* Purpose: A bird's-eye view of the current dimension showing the branching graph  
* Elements: Nodes representing room types (Boss room, current room, shop room, undiscovered rooms, discovered rooms); connecting lines showing valid paths

![Dimension Map](Img/HUD/HUD_Map.png)

**Gameplay and customization screens**  
**Room Screen**

* Purpose: The main gameplay screen where all combat takes place  
* Elements: Enemy health bars, active card hand at the bottom-left, cooldown wipe animations per card slot; player health, shield indicator and coins at the top-left

![Gameplay Screen](Img/HUD/HUD_Gameplay.png)

**Deck Management Screen**

* Purpose: Allows the player to review and organize their active and automatic card collections  
* Elements: Grid view of all cards in the deck, action buttons for removing cards

![Deck Management](Img/HUD/HUD_ManageDeck.png)

**Economy and result screens**  
**Shop Screen**

* Purpose: Exchange credits for cards, sell unwanted cards and purchase slot upgrades  
* Elements: Three tabs, Buy (5 slots with rarity distribution), Sell (lists all equipped cards with sell value), Upgrade (active slot and auto slot upgrade costs). Card carousel with rarity-colored glow on the center card

![Shop – Buy Tab](Img/HUD/Store_Buy.png)

![Shop – Sell Tab](Img/HUD/Store_Sell.png)

![Shop – Upgrade Tab](Img/HUD/Store_Upgrade.png)

**Game Over / Victory Screen**

* Purpose: Summarizes the run and displays its outcome  
* Elements: "Victory" or "Defeated" header, stats table with damage dealt, credits earned, and enemies slain, Return to Hub or Main Menu

## **2.2 Controls** {#2.2-controls}

**Movement and Navigation**

| Key | Action |
| :---- | :---- |
| W / Arrow Up | Move the player upward |
| A / Arrow Left | Move the player to the left |
| S / Arrow Down | Move the player downward |
| D / Arrow Right | Move the player to the right |
| Mouse Cursor | AIM card effects toward the cursor position |

**Card Actions**

| Key | Action |
| :---- | :---- |
| Keys 1 \- 3 | Execute the corresponding active card slot (base hand) |
| Keys 4 \- 5 | Execute expanded active card slots |
| Left Click (LMB) | Confirm and execute the selected card at the cursor |

**Combat and Utility**

| Key  | Action |
| :---- | :---- |
| Spacebar | Dash in the current movement direction |
| E | Interact with chest, glitch pillars, portals and shop |
| Tab | Toggle the deck management |
| Escape | Pause the game or close any open menu |
| Shift \+ H | Toggle debug hitbox visualization: yellow sprite bounds, red hitbox bounds, cyan center point |
| Shift \+ T | Toggle god mode: invincibility and zero card cooldowns |

## **2.3 Cards** {#2.3-cards}

### **2.3.1 Card System** {#2.3.1-card-system}

Cards are the foundation of both combat and progression in Dimension Deck. Every offensive and defensive action is executed through the player's deck, which is split into two distinct categories

**Active Cards (Manual Execution):** Active cards are tools that the player triggers manually, with number keys 1 \- 5 or a left mouse click. They deal damage, restore health or provide defensive shields. Once activated, a card enters a cooldown period shown as a wipe overlay on the slot.

* Capacity: Starts at 3 slots, expandable to 5 via shop upgrades  
* Subtypes: Melee (cone damage), Heal (restore HP), Defense (shield), Drain (damage nearest enemy, return HP)

**Automatic Cards (Trigger-Based):** Automatic cards sit in a separate pool and fire on their own when a defined trigger event fires. They have no cooldown and require no player input.

* Capacity: Supports between 4 and 8 slots.  
* Supported triggers: on\_kill, on\_attack, on\_hit\_received, on\_dash

**Card Rarities**

| Rarity | Color | Description |
| :---- | :---- | :---- |
| Common | Grey | Base level cards found frequently  |
| Rare | Blue | Improved cards with higher stats |
| Epic | Purple | Powerful mechanics that often serve as build-defining choices |
| Legendary | Gold | Game-changing finds that fundamentally alter the run |

**The Card Resistance System**  
Expanding the players' deck does two things: it increases the power, but also activates the Card Resistance system. As more card slots are unlocked, enemies gain damage resistances, forcing the player to change their tactics and keep evolving through the run.

Resistance% \= (Active Card Slots \- 3\) × 5%

| Active Card Slots | Card Resistance |
| :---- | :---- |
| 3 (base) | 0% |
| 4 | 5% |
| 5 (max) | 10% |

The automatic card pool carries its own separate resistance. For every 2 automatic slots above the base 4, enemies gain an additional 3% resistance.

| Automatic Card Slots | Card Resistance |
| :---- | :---- |
| 4 (base) | 0% |
| 6 | \+3% |
| 8 (max) | \+6% |

   
Both values stack. A player with 5 active slots and 8 automatic slots faces a total of 10% \+ 6% \= 16% damage reduction on all enemies in the current room.

### **2.3.2 Card Acquisition** {#2.3.2-card-acquisition}

**Starter Deck:** Every new run begins with three cards: Quick Strike (active melee, common), Heal Pulse (active heal, common) and Wood Shield (active defense, common)

**Field Rewards:** Chest Rooms contain a random card reward. Glitch Rooms contain a Glitch Pillar that grants a random card on contact; the card goes directly into the deck with no selection screen.

**The Dimension Store (Shop):** The primary hub for deck management

* Credits: Credits (CR) dropped by enemies and chests  
* Stock: 5 slots per visit, generated via SLOT\_RARITIES with distribution: \[common/rare\], \[rare\], \[rare/epic\], \[epic/legendary\], \[any\].  
* Sell values: Common 30 CR, Rare 70 CR, Epic 130 CR, Legendary 220 CR  
* Slot upgrades: Active slot upgrades cost 150 CR (3 to 4 slots) and 280 CR (4 to 5 slots). Auto slot upgrades cost 110 / 160 / 210 / 270 CR per tier

### 

### 

### **2.3.3 Card Upgrades** {#2.3.3-card-upgrades}

### Every card has three levels: base (1), upgraded (2), and max (3). Cards start at base when obtained. Acquiring a second copy of the same card triggers an automatic merge that advances it to level 2\. A third copy advances it to level 3 (max).

### When a max-level card receives a duplicate, the extra copy converts into credits instead of merging. Credit value by rarity: Common \= 10 CR, Rare \= 25 CR, Epic \= 50 CR, Legendary \= 100 CR.

### 

### **Active Cards:**

* Level 2: Reduces the card's cooldown by 30%  
* Level 3: Increases base damage, healing or defense value by 40%

**Automatic Cards:**

* Level 2: Widens the trigger condition to activate in more situations  
* Level 3: Increases effect potency, larger damage, longer buff duration

### **2.3.5 Combat: Card Rules** {#2.3.5-combat:-card-rules}

**Active Card Execution:** Pressing the corresponding number key triggers the card's effect immediately. There is no cast time or mana cost, allowing seamless integration with movement. Once activated that slot dims and a circular animation shows remaining recharge time.

* Common cards: short cooldown (2 \- 6s) for consistent, repeatable use  
* Legendary cards: long cooldowns (10 \- 25s) saved for boss phases or being overwhelmed

**Damage Resolution:** Melee cards deal damage to all enemies whose hitbox falls within a cone-shaped arc in the player's aim direction. Drain cards target the nearest living enemy.

### **2.3.5 Card Catalog** {#2.3.5-card-catalog}

**Active Cards – Starters** 

| Name | Rarity | Cooldown | Effect |
| ----- | :---: | :---: | ----- |
| Quick Strike | Common | 2s | Deal 25 damage to enemies within 80px in a forward cone |
| Heal Pulse | Common | 5s | Restore 25 HP |
| Wood Shield | Common | 6s | Absorb the next 20 damage |

**Active Cards** 

| Name | Rarity | Cooldown | Cost | Effect |
| ----- | :---: | :---: | :---: | ----- |
| Iron Fist | Rare | 5s | 120 CR | 55 damage within 48px range |
| Blood Siphon | Rare | 10s | 140 CR | 45 damage to nearest enemy, restore 20 HP |
| Stone Wall | Rare | 10s | 125 CR | Absorb the next 50 damage |
| Remedy Vial | Rare | 8s | 130 CR | Restore 42 HP |
| Nova Burst | Epic | 9s | 210 CR | 110 damage within 72px range |
| Mending Wave | Epic | 12s | 220 CR | Restore 85 HP |
| Mirror Guard | Epic | 14s | 200 CR | Gain 58 shield and 1.5s of invincibility |
| Shadow Blade | Legendary | 10s | 360 CR | 250 damage within 48px range |
| Phoenix Elixir | Legendary | 18s | 380 CR | Full restore of all HP |
| Diamond Fortress | Legendary | 15s | 350 CR | Absorb the next 100 damage |

**Automatic Cards**

| Name | Rarity | Trigger | Cost | Effect |
| ----- | :---: | :---: | :---: | ----- |
| Lifetap | Common | On Kill | 65 CR | Restore 20 HP each time an enemy is killed |
| Iron Skin | Common | On Attack | 70 CR | Gain 8 shield each time the player hits an enemy |
| Wound Echo | Common | On Attack | 65 CR | Each hit deals 10 bonus damage to the struck enemy |
| Quick Recovery | Common | On Hit Received | 65 CR | When hit, instantly recover 8 HP |
| Rebound | Rare | On Hit Received | 120 CR | When hit, deal 15 damage to enemies within 48px |
| Berserker Rush | Rare | On Dash | 130 CR | Dashing deals 20 damage to enemies within 32px |
| Soul Siphon | Rare | On Kill | 135 CR | Killing an enemy restores 18 HP and grants 10 shield |
| Last Stand | Epic | On Hit Received | 205 CR | When hit below 30% HP, gain 2s of invincibility |
| Chain Kill | Epic | On Kill | 215 CR | Killing an enemy deals 25 damage to all others within 64px |

### 

### **2.3.7 Card Design** {#2.3.7-card-design}

**Active Cards**

| | | | |
| :---: | :---: | :---: | :---: |
| ![Quick Strike](Img/Cards/Action_Cards/quick-strike.png) | ![Wood Shield](Img/Cards/Action_Cards/wood-shield.png) | ![Healing Potion](Img/Cards/Action_Cards/healing-potion.png) | ![Iron Fist](Img/Cards/Action_Cards/iron-fist.png) |
| Quick Strike | Wood Shield | Heal Pulse | Iron Fist |
| ![Blood Siphon](Img/Cards/Action_Cards/blood-siphon.png) | ![Stone Wall](Img/Cards/Action_Cards/stone-wall.png) | ![Remedy Vial](Img/Cards/Action_Cards/remedy-vial.png) | ![Nova Burst](Img/Cards/Action_Cards/nova-burst.png) |
| Blood Siphon | Stone Wall | Remedy Vial | Nova Burst |
| ![Mending Wave](Img/Cards/Action_Cards/mending-wave.png) | ![Mirror Guard](Img/Cards/Action_Cards/mirror-guard.png) | ![Shadow Blade](Img/Cards/Action_Cards/shadow-knife.png) | ![Phoenix Elixir](Img/Cards/Action_Cards/phoenix-elixir.png) |
| Mending Wave | Mirror Guard | Shadow Blade | Phoenix Elixir |
| ![Diamond Fortress](Img/Cards/Action_Cards/diamond-fortress.jpeg) | | | |
| Diamond Fortress | | | |

**Automatic Cards**

| | | | |
| :---: | :---: | :---: | :---: |
| ![Lifetap](Img/Cards/Automatic_Cards/life-tap.png) | ![Iron Skin](Img/Cards/Automatic_Cards/iron-skin.png) | ![Wound Echo](Img/Cards/Automatic_Cards/wound-echo.png) | ![Quick Recovery](Img/Cards/Automatic_Cards/quick-recovery.png) |
| Lifetap | Iron Skin | Wound Echo | Quick Recovery |
| ![Rebound](Img/Cards/Automatic_Cards/rebound.png) | ![Berserker Rush](Img/Cards/Automatic_Cards/berserker-rush.png) | ![Soul Siphon](Img/Cards/Automatic_Cards/soul-siphon.png) | ![Last Stand](Img/Cards/Automatic_Cards/last-stand.png) |
| Rebound | Berserker Rush | Soul Siphon | Last Stand |
| ![Chain Kill](Img/Cards/Automatic_Cards/chain-kill.png) | | | |
| Chain Kill | | | |

## **2.4 Combat** {#2.4-combat}

### **2.4.1 Combat Overview: Real-Time Tactical Movement**  {#2.4.1-combat-overview:-real-time-tactical-movement}

Combat in Dimension Deck is defined as a real-time, continuous experience where enemies spawn and attack immediately upon the player entering a room. The system requires simultaneous attention to spatial awareness and card-based decision-making.  

* Movement and Defense: Players use WASD or arrow keys for top-down directional control to physically dodge projectiles and melee strikes.    
* The Dodge Mechanic: The spacebar triggers a dash, providing a reliable escape tool when the player is surrounded.    
* Card Execution: Players aim with the mouse and execute active cards using number keys 1 through 5\.    
* Telegraphed Danger: Enemy attacks are telegraphed via wind-up animations or visible paths projected on the floor, giving the player seconds to react.

![Combat](Img/HUD/Combat.png)

### **2.4.2 Enemy Behavioral Archetypes** {#2.4.2-enemy-behavioral-archetypes}

All enemies are built upon three foundational archetypes that dictate their AI and physical presence:  

* Swarm Archetype  
  * Characteristics: These are small enemies, typically rendered at 16 x 16 px.    
  * Behavior: They use a "seek-and-close" movement pattern to pursue the player.    
  * Combat Role: They pressure the player by crowding the playable space, forcing constant movement to avoid contact damage.    
* Tank Archetype  
  * Characteristics: Large, high-health sprites that communicate a high level of threat.    
  * Behavior: They move slowly but are highly resistant to knockback.    
  * Combat Role: They act as obstacles that deal massive damage on contact, requiring the player to maintain distance.    
* Ranged Archetype  
  * Characteristics: Mid-sized enemies that prioritize staying away from the player.    
  * Behavior: They maintain a safe distance and track the player to fire projectiles on a cooldown.    
  * Combat Role: They force the player to dodge across the room while trying to find an opening to counter-attack.  

### **2.4.3 Dimension-Specific Bestiary** {#2.4.3-dimension-specific-bestiary}

**The Dark Ages**

| Enemy | Archetype | Combat Stats & Behavior | Sprite |
| :---- | :---- | :---- | :----: |
| Grey Rat / Brown Rat | Swarm | Fast-moving rodents; rely on numbers to corner the player. | ![Rat](Img/Enemy_Sprites/GreyRat_SpriteSheet.png) |
| Spirit | Swarm | Ghostly enemy that phases through obstacles and homes in on the player. | ![Spirit](Img/Enemy_Sprites/spirit-Sheet.png) |
| Skeleton | Tank | High HP; uses slow but heavy, telegraphed melee swings. | ![Skeleton](Img/Enemy_Sprites/skeleton-head-Sheet.png) |
| Two-Headed Giant | Tank | Massive two-headed enemy with devastating close-range attacks. | ![Two-Headed Giant](Img/Enemy_Sprites/Two_headed_giant_Sprite-Sheet.png) |
| **Skeleton King** *(Boss)* | Boss | Phase-based boss that summons minions and changes attack patterns as HP decreases. | ![Skeleton King](Img/Enemy_Sprites/SkeletonKing-Spritesheet.png) |

**Old West**

| Enemy | Archetype | Combat Stats & Behavior | Sprite |
| :---- | :---- | :---- | :----: |
| Bandit | Ranged | Strafes across the sand while firing pistol shots at the player. | ![Bandit](Img/Enemy_Sprites/bandit.png) |
| Minotaur | Tank | High defense; charges the player with devastating horn attacks. | ![Minotaur](Img/Enemy_Sprites/minotaur.png) |
| **Iron Marshal** *(Boss)* | Boss | Phase-based gunslinger boss; transitions from ranged shooting to close-range melee in later phases. | ![Iron Marshal](Img/Enemy_Sprites/IronMarshal-SpriteSheet.png) |

### **2.4.4 Strategic Progression: Card Resistance** {#2.4.4-strategic-progression:-card-resistance}

To ensure the game remains challenging, the Card Resistance system scales with the player's power. As the player expands their card slots or builds a larger deck, enemies gain resistance to specific card types, preventing a single strategy from dominating the entire run.

## **2.5 Roguelite Progression and Telemetry** {#2.5-roguelite-progression-and-telemetry}

Runs are independent, and permanent death resets the player back to the Hub World with their current deck lost, requiring a fresh start for the next attempt. However, dimensional credits earned during a run are carried over and can be spent on permanent upgrades that expand stats and maximum card capacity across future runs. These Hub upgrades ensure long-term empowerment without trivializing individual runs.

The game collects telemetry data across four areas to support ongoing balance work. Player performance tracking monitors run duration and the highest biome reached to identify difficulty spikes. Win/loss analytics record the frequency of Game Over versus Victory screens to gauge overall accessibility. Card and trigger usage analyzes which active cards are chosen most often and which automatic triggers prove most effective in combat. Economic balancing logs dimensional credit earnings to see whether players prioritize new cards, shop items, or permanent Hub upgrades. All collected data feeds back into dynamic scaling adjustments to Card Resistance, ensuring enemies stay competitive as the player's deck capacity grows.

Three specific KPIs the game will track:

1. **Time per dimension**: Average minutes spent in Old West vs. Dark Ages per run. This identifies which biome causes players to stall or rush, pointing to pacing issues.  
2. **Most discarded card**: Which active card gets removed from the deck most often at the shop. A card discarded frequently signals it underperforms relative to its cost.  
3. **Run length at death**: The room number where most Game Over screens occur. This pinpoints difficulty spikes in the procedural layout.

# **3\. Level Design** {#3.-level-design}

## **3.1 Themes** {#3.1-themes}

### **3.1.1 Ambience** {#3.1.1-ambience}

Dimension Deck uses a 16-bit visual style. This design reminds players of classic gaming eras while providing a fluid and nostalgic experience. The game features two distinct dimensions, each with its own look.

* **The Old West:** This theme uses dusty deserts and frontier towns to create a sense of lawlessness and freedom. The wide-open space of the desert provides a feeling of freedom that stands in total contrast to the next world.  
* **The Dark Ages:** This world is inspired by fantasy games like Dungeons and Dragons and takes place inside a castle and caverns. This setting makes the player feel trapped in a heavy, enclosed environment.

Using these two themes helps prevent the player from getting bored with the visuals. It also allows for unique creative additions in each biome without breaking the player's feeling of being in the game or the core gameplay experience.

**Dark Ages – Dungeon Room**

![Dark Ages Room](Img/Rooms/roomDungeon.png)

**Old West – Desert Room**

![Old West Room](Img/Rooms/roomOldWest.png)

### **3.1.2 Objects** {#3.1.2-objects}

#### **3.1.2.1 Ambient** {#3.1.2.1-ambient}

**Player Character:** The player uses a **32 x 32 px** sprite. This larger size makes the hero stand out clearly against the background and enemies.  
**Theme Elements:** Decorative items like desert plants for the West or stone pillars for the Dark Ages help ground the player in each dimension.

#### **3.1.2.2 Interactive** {#3.1.2.2-interactive}

Each interactive object follows defined rules for how the player engages with it:

* **Card Reward Chests**: Appear after a room is fully cleared. Require no key. The player presses E to open and receives a card reward drawn from the current biome's rarity pool.  
* **The Dimension Store**: A safe zone; no enemies spawn here. The shopkeeper offers 5 card slots per visit with rarity distribution: \[common/rare\], \[rare\], \[rare/epic\], \[epic/legendary\], \[any\]. Prices scale with rarity.  
* **Glitch Pillars**: The player touches them to interact. Each pillar grants a random card that goes directly into the deck.  
* **Dimension Portals (Shrines)**: A glowing portal that transports the player to the next dimension upon interaction (press E).  
* **Mr. Bombastic (Easter Egg)**: A hidden NPC found in a rare Bombastic Room. When the player approaches and presses E to talk, Mr. Bombastic begins to dance and reveals the testing cheat code: Shift + T activates god mode (invincibility and zero cooldowns).  
* **Dimension Shift effect on objects**: When the player crosses into a new dimension, all chests and pillars from the previous dimension are removed. Credits and deck contents carry over; room objects do not.

**Store Rooms**

![Dungeon Store](Img/Rooms/store-dungeon.png)  
![Old West Store](Img/Rooms/store-oldwest.png)

**Doors**

![Dungeon Doors](Img/Rooms/doors-dungeon.png)  
![Old West Doors](Img/Rooms/doors-oldwest.png)

#### **3.1.3 Challenges** {#3.1.3-challenges}

Dimension Deck's challenges aim to evaluate players' reflexes and their capacity to devise a card strategy amidst relentless pressure. 

* Real-Time Combat: During each run the enemies move and attack the moment they see the player. With this mechanic, we make the player stay in constant alert to dodge or protect incoming projectiles and melee hits while also trying to play their cards in order to deal damage to the enemies.  
* Attack visualization: Most of the enemies will have animations or visible paths on the floor, giving the player seconds for them to react and dodge the incoming attacks.  
* Card Resistance: As the deck gets bigger and the player gets stronger, enemies will start to develop resistances to certain types of cards that the player has during that run. This mechanic stops the player from using the same strategy the whole game, forcing him to change the idea the player is focusing on for completing each level.  
* Boss Battles: At the end of each dimension, the player must fight a boss that changes its behavior and attacks the player as the fight goes on. The Dark Ages boss is the Skeleton King; the Old West boss is the Iron Marshal. These fights test how well the player has built their deck and how good their skills at the game are.  
* Procedural Rooms: Each room will be randomized, making the player never know if the next room will be full of dangerous enemies, traps, loot or the level boss to finish the level and continue the run.  
* Permanent Death: If you run out of health, the run ends and you lose your current deck, sending you back to the start to try again with a fresh strategy.

## **3.2 Game Flow** {#3.2-game-flow}

The flow of Dimension Deck focuses on moving through a series of unpredictable rooms, where the main goal of the player is to survive and find an exit to the next challenge. Here is how the game progression works:

* Start of the run: A run begins in the Dark Ages or the Old West, making each run feel unique from any other. The player enters the first room with a starting deck, full directional control and free decision-making.  
* Clearing the rooms: In order to move forward, players must clear the current level they are on, which can be done in different ways. This could be achieved either by eliminating all enemies in a combat room or finding a shrine portal that acts as a gateway to the next area. Once the level is cleared, the room could drop rewards like dimensional credits.  
* The final boss encounter: The final boss of a dimension always appears at the end of the branching map, after 8–12 rooms have been cleared. The difficulty scales dynamically using the Card Resistance system, meaning the boss becomes tougher if the player has built a larger, more powerful deck.  
* Post-Level Store: After successfully finishing a level, the player may enter the Dimension Store. This is a safe area between levels where players can spend credits on new cards, buy more slots for their deck, and manage their primary and secondary card hands.  
* Deck Management and Storage: Players are able to see and manage their deck at any time using the Tab key, but the store is the best place to reorganize it.  
* Dimension Transition: Once the final boss is defeated, a portal opens to transport the player into the next dimension. This transition moves the player into a different environment with new visuals, enemies, and cards.  
* The Death/Victory Cycle: If the player loses all health, the run ends and the current deck is lost. However, any credits earned are carried back to the Hub World to purchase permanent stat and capacity upgrades, making the character stronger for the next attempt.


# **4\. Development** {#4.-development}

The codebase is organized around a set of abstract base classes that define shared behavior without implementing it, keeping individual systems extensible and the overall architecture clean.

* Entity: The root class for anything that exists in the game world. Holds position, velocity, health, and a basic update/render cycle. All moving, interactable objects extend this.  
* Card: Defines the structure every card must follow: a name, a rarity, an energy cost, an effect function, and a card type flag (active or automatic). The effect function takes a reference to the current combat state and resolves the card's outcome. Cards also carry a cooldown value used by the discard pile timer system.  
* Enemy: Extends Entity and adds abstract methods for movement behavior, attack patterns, a Card Resistance value that scales with the player's deck capacity, and a drop table reference. Every enemy type implements these differently.  
* Room: Defines the container structure for a playable space: fixed dimensions of 480 x 352 pixels across a 15 x 11 tile grid, spawn points, exit conditions, and lists of enemies and objects. Room subtypes inherit from this and override spawn logic and exit triggers.  
* Biome: Groups a set of room types, an enemy pool, a visual theme identifier, and a boss reference into a single traversable dimension. Controls which rooms can appear on the Dimension Map for that biome and manages the Card Resistance multiplier applied to all enemies within it.  
* Relic: Defines passive items with a trigger condition and an effect callback. The base class handles registration with the combat event bus; derived classes define what triggers them and what they do.  
* Synergy Effect: Defines the structure for combination effects between cards. Holds a trigger card reference, a catalyst card reference, a multiplier value, and a result effect function. Registered with the Synergy Manager at runtime.

##  

## **4.1 Derived Classes** {#4.1-derived-classes}

Derived classes implement the concrete behavior defined by each abstract parent. Below are the primary derived types used across the game's systems.

* Player (extends Entity): The player character is rendered at 32 x 32 pixels and changes visual design depending on the active dimension. Adds the active card slot manager (3 slots, expandable to 5), the automatic card pool (4 to 8 slots), hand management, dimensional credit tracking, and the dodge mechanic. Handles collision with pickups and interaction prompts for objects. Listens to the input manager and translates inputs into movement vectors and card plays.  
* StrikeCard, AreaCard, HealCard (extend Card, active type): The three foundational active card types. StrikeCard resolves direct damage against a single target. AreaCard applies damage across a radius centered on the cursor position. HealCard restores a portion of the player's missing health and enters a longer cooldown than offensive cards to prevent it from replacing resource management.  
* ConditionCard (extends Card, active type): An active card that applies a status effect to one or more enemies and queues a synergy flag in the SynergyManager.  
* TriggerCard (extends Card, automatic type): Sits in the automatic pool and watches the combat event bus for its trigger condition (on\_kill, on\_attack, on\_hit\_received, on\_dash). When met, it fires its effect function without player input.  
* BoostCard (extends Card, automatic type): A permanent stat modifier for the duration of the run. Adds its value to a stat register when added to the deck and subtracts it on removal. Has no event trigger and no cooldown; it contributes passively at all times.  
* SwarmEnemy, TankEnemy, RangedEnemy (extend Enemy): The three base enemy behavioral archetypes. Enemy sprite dimensions vary by type: small swarm enemies render at 16 x 16 pixels and use a seek-and-close movement pattern; tank enemies are larger, move slowly, resist knockback, and hit for high damage on contact; ranged enemies maintain distance, track the player, and fire projectiles on a cooldown. All three archetypes change visual design depending on the active dimension.  
* BossEnemy (extends Enemy): Adds a phase list, a phase transition trigger, and a secondary attack pattern that activates in later phases. Also holds a unique mechanic flag that activates a special rule for the boss fight. Boss sprites scale up significantly from standard enemy sizes to communicate their threat on screen.  
* CombatRoom, ShopRoom, ChestRoom, ShrineRoom, BombasticRoom (extend Room): Each overrides the spawn logic and exit condition appropriate to its type within the fixed 480 x 352 pixel, 15 x 11 tile grid. CombatRoom spawns enemies from the biome pool and unlocks exits on full clear. ShopRoom spawns the merchant object and allows free exit after browsing. ChestRoom spawns one chest tied to a rarity roll and exits after interaction. ShrineRoom spawns one shrine portal and exits after the player accepts or declines the offer. BombasticRoom is a pre-cleared Easter Egg room containing the MrBombastic NPC, which starts a dance animation and reveals the cheat code on interaction.  
* SynergyManager: Singleton class that registers all SynergyEffect instances at startup and listens to card resolution events during combat. When a trigger card resolves and sets a synergy flag on a target, the SynergyManager holds the flag for a defined window. If a matching catalyst card resolves on the same target within that window, the multiplier is applied and the flag is cleared.  
* TelemetryLogger: Passive singleton that hooks into key game events without affecting gameplay logic. Logs run duration, biome reached on death, Game Over and Victory frequencies, card selection rates, automatic trigger activation rates, and dimensional credit spending patterns. Data is written to a local session file and can be exported for balance review.

# **5\. Graphics** {#5.-graphics}

## **5.1 Style Attributes** {#5.1-style-attributes}

The game has a 16-bit aesthetic, using references from Super Nintendo Games such as The Legend of Zelda: A Link to the Past, The Escapists, Mario & Luigi Sagas or Pokemon. Each region of the map has a unique characteristic which gives a visual feedback to the player to know where they are. Style graphic is pixel art in 2D, with resolution of 16x16 bits for each tile.

**Cards Display (bottom left):** The active cards available during the game are displayed in the lower-left area. Cards are triggered with number keys 1–5. A circular cooldown overlay shows the remaining recharge time after each use.  
**Player health and credits (top left):** Displays the current health, shield, and dimensional credits of the player.  
**Deck menu (Tab key):** Opens the deck management overlay, allowing the player to review their full active and automatic card collections and remove cards. 

Visual feedback is used for all important actions occurring in the game. When the player takes damage, the screen will display a brief red flash. Enemies, when taking damage, will briefly change their color to red for less than half a second.

When a card is obtained, an image of the card will be displayed, drawing the player's attention as the main focal point.

## **5.3 Sprites** {#5.3-sprites}

**Player:**

* Dimension: 32 x 32 px  
* Idle in 4 directions: left, right, up, down  
* Walking in 4 directions: left, right, up, down  
* Take damage  
* Death

**Dark Ages – Knight Spritesheet**

![Knight Spritesheet](Img/Player_Sprites/Knight-Spritesheet.png)

**Old West – Cowboy Spritesheet**

![Cowboy Spritesheet](Img/Player_Sprites/cowboy-Sheet.png)

**Enemies: Default movements**

* Dimension: Depends on the enemy type  
* Idle in 2 directions: left, right  
* Walking in 2 directions: left, right  
* Attacking in 2 directions: left, right

**Dark Ages Enemy Sprites**

| Grey Rat | Spirit | Skeleton Head | Two-Headed Giant |
| :---: | :---: | :---: | :---: |
| ![Grey Rat](Img/Enemy_Sprites/GreyRat_SpriteSheet.png) | ![Spirit](Img/Enemy_Sprites/spirit-Sheet.png) | ![Skeleton](Img/Enemy_Sprites/skeleton-head-Sheet.png) | ![Two-Headed Giant](Img/Enemy_Sprites/Two_headed_giant_Sprite-Sheet.png) |

**Old West Enemy Sprites**

| Bandit | Minotaur |
| :---: | :---: |
| ![Bandit](Img/Enemy_Sprites/bandit.png) | ![Minotaur](Img/Enemy_Sprites/minotaur.png) |

**Boss Sprites**

| Skeleton King (Dark Ages) | Iron Marshal (Old West) |
| :---: | :---: |
| ![Skeleton King](Img/Enemy_Sprites/SkeletonKing-Spritesheet.png) | ![Iron Marshal](Img/Enemy_Sprites/IronMarshal-SpriteSheet.png) |

**Easter Egg – Mr. Bombastic**

Mr. Bombastic is a hidden NPC that appears in the rare Bombastic Room. He is rendered using a 7-frame sprite sheet (32 x 19 px per frame). When idle, he stands still on frame 0. After the player interacts (press E), he begins looping through his dance animation at 0.12 seconds per frame and reveals the cheat code notification.

**Tiles:**   
Each dimension will have a base map with a resolution of 480 x 352 px. From this, a tileset will be used by the system to procedurally determine the placement and distribution of tile objects and decorations across the map

**Dark Ages Tileset**

![Dungeon Tileset](Img/Rooms/Tiles/tilesDungeon.png)

1. **Dark Ages**  
   1. **Terrain**  
      1. Stone floor  
      2. Pillars  
      3. Doors  
   2. **Natural props**  
      1. Torches   
      2. Tables  
      3. Blood  
      4. Bones  
   3. **Interactive objects**  
      1. Chests

**Old West Tileset**

![Old West Tileset](Img/Rooms/Tiles/tilesOldWest.png)

2. **Old West**  
   1. **Terrain**  
      1. Sand  
      2. Dirt path  
      3. Rocky ground   
      4. Small elevation  
   2. **Natural props**  
      1. Cacti  
      2. Dry bush  
      3. Animal bones  
   3. **Interactive Objects**  
      1. Boxes  
      2. Chests  
   4. **Obstacles**  
      1. Rocks

**Animations**

| Coin | Portal | Glitch Pillar |
| :---: | :---: | :---: |
| ![Coin](Img/Animations/coin-Sheet.png) | ![Portal](Img/Animations/portal-Sheet.png) | ![Glitch Pillar](Img/Animations/glitch_pilar.png) |

# **6\. Sounds/Music** {#6.-sounds/music}

## **6.1 Style Attributes** {#6.1-style-attributes}

The soundtrack is a core component of the game experience. It is built around a 16-bit aesthetic, using synthesized sound and short looping compositions that reinforce the repetitive style of a roguelite game

The primary goal of the soundtrack is to generate a constant sense of tension, communicating to the player that they are in a dangerous environment where enemies can appear at any moment and potentially end the game. The music does not evolve with the player progression, instead, it maintains sustained pressure. Each dimension has its own distinct soundtrack to differentiate environments and reinforce immersion.

**Old West:** Inspired by classic westerns and desert styles. The music conveys isolation, vast open spaces and latent danger. It uses slower tempos and conveys a sense of isolation, vastness and latent danger:  
[https://www.youtube.com/watch?v=KhChHmk1o8c](https://www.youtube.com/watch?v=KhChHmk1o8c)

**Dark Age:** Inspired by dark fantasy dungeon settings and classic games such as The Legend of Zelda, conveying a sense of confinement and constant threat: [https://www.youtube.com/watch?v=Nxx3Ti83TYk](https://www.youtube.com/watch?v=Nxx3Ti83TYk)

## **6.2 Sounds Needed** {#6.2-sounds-needed}

All sound effects follow a retro 16-bit aesthetic to maintain consistency with the visual and musical identity of the game. Sound effects are grouped based on their function:

**Interaction sounds:**

* Chest opening: [https://www.freesound.org/people/jon1/sounds/95503/](https://www.freesound.org/people/jon1/sounds/95503/)   
* Impacts against walls or objects: [https://www.freesound.org/people/toxicwafflezz/sounds/150838/](https://www.freesound.org/people/toxicwafflezz/sounds/150838/) 

**Player and enemy feedback:**

* Damage effect (player): [https://www.freesound.org/people/mrickey13/sounds/515624/](https://www.freesound.org/people/mrickey13/sounds/515624/)   
* Damage effect (enemy): [https://www.freesound.org/people/Mrthenoronha/sounds/506586/](https://www.freesound.org/people/Mrthenoronha/sounds/506586/) 

Each sound must clearly differentiate between player and enemy actions

**UI Sounds:**

* Card reveal  
* Card played  
* Menu selection [https://www.freesound.org/people/ZeltBolt/sounds/833055/](https://www.freesound.org/people/ZeltBolt/sounds/833055/) 

**Ambient Sounds:**

* Desert wind [https://www.freesound.org/people/felix.blume/sounds/156414/](https://www.freesound.org/people/felix.blume/sounds/156414/)   
* Whispering distant voices

Ambient sounds help reinforce the atmosphere of each dimension and should remain subtle to avoid overwhelming the player

## **6.3 Music Needed** {#6.3-music-needed}

The game requires different music tracks depending on the gameplay state  
**Core Gameplay**

* Dungeon exploration https://www.newgrounds.com/audio/listen/625484  
* Combat https://www.newgrounds.com/audio/listen/76637

**Key Event**

* Final boss battle https://www.newgrounds.com/audio/listen/436762

**UI / Game States**

* Main menu [https://www.playonloop.com/2020-music-loops/misty-dungeon/](https://www.playonloop.com/2020-music-loops/misty-dungeon/)   
* Defeat screen [https://www.newgrounds.com/audio/listen/368887](https://www.newgrounds.com/audio/listen/368887)   
* Victory screen [https://www.newgrounds.com/audio/listen/1323003](https://www.newgrounds.com/audio/listen/1323003)   
* Credits screen [https://www.newgrounds.com/audio/listen/11684](https://www.newgrounds.com/audio/listen/11684) 

**Special Content**

* Special room (Mr. Bombastic Easter Egg)

# **7\. Web Platform** {#7.-web-platform}

Dimension Deck includes a companion web platform built with Node.js, Express, and MySQL. The platform provides player authentication, run statistics, a global leaderboard, and an admin panel for managing users and viewing aggregate game telemetry.

**Login / Sign Up**

Players register and log in through a JWT-based authentication system. Sessions persist via a 7-day token stored in localStorage.

![Login and Sign Up](Img/WebPage/Login_Signup.png)

**Main Web Menu**

After logging in, players reach the main menu which links to game stats, the card catalog, a tutorial, and the admin panel (admin accounts only).

![Web Menu](Img/WebPage/Menu.png)

**Player Statistics**

The stats page displays per-user run history: total runs, victories, defeats, win rate, best score, average score, total damage dealt and taken, enemies killed, and rooms cleared.

![Player Statistics](Img/WebPage/Stats.png)

**Card Catalog**

A reference page listing all available cards in the game, including their rarity, type, cooldown, cost and effect descriptions.

![Card Catalog](Img/WebPage/Cards.png)

**Tutorial**

An interactive guide explaining the core mechanics: movement, card execution, the shop system, automatic card triggers, and the Card Resistance system.

![Tutorial](Img/WebPage/Tutorial.png)

**Admin Panel**

Admin accounts have access to a management panel that displays all registered players with their full run summaries, global averages, and active run monitoring.

![Admin Panel](Img/WebPage/AdminPanel.png)

# **8\. Schedule**  {#8.-schedule}

The game development is organized into 8 stages and will be carried out in a staggered and progressive manner, maintaining a modular development that allows for system scalability with the aim of facilitating easier system debugging. Each system should only do one job and not several. The team consists of 3 developers, and collaborative work will be done with GitHub. The presented timeline maintains a clear and concise structure, prioritizing the individual development of each element for its integration at the end of each stage. The team seeks to perform continuous tests and adjustments for the early detection of problems that could hinder or compromise the complete development of the system.

**Week 1 – Core System** 

* Game object class development   
* Implement of:  
  * Player class (basic movements and initial attributes)  
  * Enemies class   
* Input system implementation  
* Basic physics and collisions system  
* Initial structure card system  
* First version of the game loop

 **Goal:** Establish foundation game and minimal playable game 

**Week 2 – Gameplay and Cards system** 

* Completed card system development   
  * Active card system   
  * Passive card system   
* Implementation of card mechanics (damage, effects)  
* Enemy development (basic movement and logic)

**Goal:** Implement the main gameplay mechanics 

**Week 3 – Procedural Map Design**

* Development of the basic procedural map generator   
* Implementation of:  
  * Enemy AI  
  * Store system (buying card)  
  * Economic system (currency)  
* Progression system and difficulty scaling   
* Design of cards and enemies 

**Goal:** Procedural map generator, game logic and dynamic content

**Week 4 – UI / UX**

* UI development:  
  * Game menu (main menu, pause menu)  
  * Inventory system  
  * Victory screen and Death screen  
  * Deck UI (card management interface)  
* UX feedback  
  * Player visual indicator (damage, effects, interactions)  
  * Player action feedback  
* Integration of sound effects (combat, background sounds, actions)  
* Refinement game loop  
* Gameplay balancing   
  * Gameplay flow  
  * Player feelings  
  * Cards balancing  
  * Economy

**Goal:** Improve user experience and visual final finishes 

**Week 5 – Testing, debugging and final delivery** 

* Gameplay testing  
  * Internal testing  
  * External player testing  
* Bug fixing  
* Development of website  
* Final build and presentation
