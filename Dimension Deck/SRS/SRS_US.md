**![][image1]**

**Campus Santa Fe**

**Software Requirements Specification**

**Course:**  
Software Construction and Decision Making

**Students:**  
Jesús José Espinoza Torruco  
Vladimir Piñera Reyes  
Gonzalo Zamarrón Orrantia

**Matriculate:**  
A01781963  
A01786772  
A01782739

**Delivery Date:**  
06 de mayo

## **User account**

| User account | Priority: High | Estimate: 10 hr |
| :---- | :---- | :---- |
| **User Story:**  As a registered user, I want to log in to my account using my password and user, so that I can access my account. |  |  |
| **Acceptance Criteria:** Given I have a valid account When I enter correct credentials Then I access to the game menu to start or to continue my game |  |  |

## 

| Log out account | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a registered user, I want to log in to my account using my password and user, so that I can access my account. |  |  |
| **Acceptance Criteria:** Given I have a valid account When I enter correct credentials Then I access to the game menu to start or to continue my game |  |  |

## 

## **Menu and general flow**

| Main menu navigation | Priority: Medium | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to see a clear main menu with options (New Game, Continue, Settings, Exit) so that I can navigate easily when I start the game. |  |  |
| **Acceptance Criteria:** Given I have logged in successfully, When the game loads, Then I see the main menu with all navigation options clearly displayed |  |  |

## 

| Access settings from menu | Priority: Low | Estimate: 1 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to access the settings screen from the main menu so that I can adjust volume, resolution, and language before playing. |  |  |
| **Acceptance Criteria:** Given I am on the main menu, When I click the Settings option, Then I see a settings panel where I can modify audio, display, and language preferences |  |  |

## 

| Credit screen | Priority: Low | Estimate: 1 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to access a Credits screen from the main menu so that I can see the names of the development team and relevant attributions. |  |  |
| **Acceptance Criteria:** Given I am on the main menu,  When I click the Credits button,  Then a credits screen is displayed showing team names, roles, and a back button to return to the main menu |  |  |

## 

| Pause menu | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to pause the game at any time during a run so that I can take a break, adjust settings, or quit to the main menu without losing my progress. |  |  |
| **Acceptance Criteria:** Given I am in an active run,  When I press the Escape key,  Then the game pauses and a pause menu appears with options to Resume, open Settings, and Return to Main Menu |  |  |

## **Map and exploration**

| Dimension map display | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to view the full branching map of the current dimension so that I can choose which path of rooms to take toward the Boss node. |  |  |
| **Acceptance Criteria:** Given I press M (hold) during a run,  When the tactical map opens,  Then I see all room nodes (Combat, Chest, Shop, Shrine, Glitch, Boss) connected by path lines, and my current position is highlighted |  |  |

## 

| Mini-map toggle | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to toggle a mini-map overlay in the corner of the screen so that I can see my position in the dimension without opening the full map. |  |  |
| **Acceptance Criteria:** Given I am in an active room,  When I tap M,  Then a mini-map overlay appears or disappears in the corner of the screen showing nearby nodes and current room position |  |  |

## 

| Room node persistence on map | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want visited rooms to remain revealed on the map permanently so that I can keep track of my path even if I backtrack. |  |  |
| **Acceptance Criteria:** Given I enter a room's detection collider,  When I backtrack to a previous node,  Then the entered room remains revealed and labeled on both the mini-map and the full dimension map |  |  |

## 

| Procedural room generation | Priority: High | Estimate: 10 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want each dimension to contain 8 to 12 rooms generated randomly before a Boss node so that no two runs have the same length or layout. |  |  |
| **Acceptance Criteria:** Given a new run starts,  When the dimension generator runs,  Then it produces a branching map with 8–12 rooms (random count), branching paths that converge at the Boss node, and room types weighted according to the Room Type Weighting table (Combat 60%, Chest 15%, Shop 10%, Shrine 10%, Glitch 5%) |  |  |

## 

| Shop room scaling | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the likelihood of a shop room to increase after clearing several consecutive combat rooms so that I am always guaranteed a chance to manage my deck. |  |  |
| **Acceptance Criteria:** Given I have cleared 3 consecutive combat rooms without visiting a shop,  When the next room node is generated,  Then the chance of it being a Shop Room increases by 10% per every 3 consecutive combat rooms; this bonus resets to 0% the moment I enter a shop room |  |  |

## 

## **Progress system and save game**

| Auto-save after each room | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the game to automatically save my progress after completing each room so that I do not lose my run if I close the game unexpectedly |  |  |
| **Acceptance Criteria:** Given I have just cleared a room, When the room completion animation ends, Then my current run state is saved automatically |  |  |

 

| Run summary in death | Priority: Medium | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to see a summary screen when I die (rooms cleared, total damage, cards used) so that I can learn from my mistakes and improve in the next run. |  |  |
| **Acceptance Criteria:** Given my character's health has reached zero,  When the death animation plays,  Then a summary screen appears showing my run statistics before returning to the main menu |  |  |

| Permanent death and deck loss | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the game to reset my current deck upon death so that each run feels meaningful and high stakes. |  |  |
| **Acceptance Criteria:** Given my health reaches zero during a run,  When the Game Over screen appears,  Then my current deck is cleared and I am returned to the Hub World with zero active cards; any dimensional credits earned during the run are retained |  |  |

| Hub World permanent upgrades | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to spend dimensional credits earned during runs on permanent Hub upgrades so that each failed run still contributes to long-term progression |  |  |
| **Acceptance Criteria:** Given I am at the Hub World after a run ends,  When I open the permanent upgrade menu,  Then I can spend retained dimensional credits on upgrades such as increased base health, additional card slots, or starting card bonuses that persist across all future runs |  |  |

| Dimension transition | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want a portal to open after defeating the final boss of a dimension so that I can advance to the next dimension with a new visual environment and enemy set |  |  |
| **Acceptance Criteria:** Given I defeat the final boss of the current dimension,  When the victory sequence plays,  Then a dimensional portal appears; upon entering it, the player is loaded into the next dimension's map with new biome visuals, a new enemy pool, and their credits and deck intact; all chests and pillars from the previous dimension are removed |  |  |

## **Rooms and interactive objects**

| Card reward chest interaction | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to open a card reward chest after clearing a room so that I can choose one of three new cards to add to my deck. |  |  |
| **Acceptance Criteria:** Given I have cleared all enemies in a combat room and a chest appears,  When I press E near the chest,  Then a card selection screen shows 3 randomly drawn cards from the current biome's rarity pool; selecting one adds it to my deck; if I exit the room without choosing, the chest disappears permanently |  |  |

## 

| Glitch Pillar Interaction | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to interact with Glitch Pillars to receive a random card reward so that exploration is unpredictably rewarding. |  |  |
| **Acceptance Criteria:** Given a Glitch Pillar exists in the current room,  When the player's sprite touches the pillar's collider,  Then the pillar stabilizes and one card is drawn randomly from any rarity tier and added directly to the player's deck without a selection screen; only one pillar upgrade per run is permitted |  |  |

## 

| Dimension Altar Interaction | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to interact with a Dimensional Altar to trade one automatic card slot for a permanent damage boost so that I can make high-risk strategic sacrifices during a run |  |  |
| **Acceptance Criteria:** Given a Dimensional Altar is present in the room,  When I press E and confirm the trade,  Then one automatic card slot is permanently removed for the rest of the run and all active card damage is increased by 30%; a confirmation prompt must appear before the trade is finalized and the action cannot be reversed |  |  |

## 

| Card Smith Anvil Interaction | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to merge two copies of the same active card at the Card Smith's Anvil so that the merged card has its cooldown reduced by 40%. |  |  |
| **Acceptance Criteria:** Given the Card Smith's Anvil is present and I have two copies of the same active card,  When I press E and select the two matching cards,  Then both cards are consumed and a single upgraded version is added to my deck with its cooldown reduced by 40% |  |  |

| E-key interaction system | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want a single interaction key (E) to work on all interactive objects so that I can engage with chests, altars, the anvil, the shop, and pillars consistently. |  |  |
| **Acceptance Criteria:** Given I am within interaction range of any interactive object,  When I press E,  Then the appropriate interaction triggers (chest opens, shop opens, altar prompt appears, anvil prompt appears); pressing E outside range produces no effect |  |  |

## **Combat** 

| Player movement in 4 directions  | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to move my character using directional keys (WASD) so that I can navigate and avoid enemies in the game |  |  |
| **Acceptance Criteria:** Given I press WASD  When input is detected  Then the player moves in the corresponding direction Given no input is pressed Then the player remains idle |  |  |

## 

| Arrow key alternative movement | Priority: Medium | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to use arrow keys as an alternative to WASD for movement so that I can choose my preferred control layout. |  |  |
| **Acceptance Criteria:** Given I press any Arrow key during a run,  When the input is detected,  Then the player moves in the corresponding direction identically to WASD input |  |  |

## 

| Collision system | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want entities to collide with each other, so that positioning and movement have consequences  |  |  |
| **Acceptance Criteria:** Given the player collides with an enemy When collision occurs Then contact damage or interaction is triggered Given projectiles intersect objects  Then collision is detected and effects something |  |  |

## 

| Player damage | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to receive damage from enemies so that combat feels challenging and reactive. |  |  |
| **Acceptance Criteria:** Given an enemy attack hits the player  When collision occurs  Then damage is applied Given the player avoids the attack  Then no damage is taken |  |  |

## 

| Enemies damage | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to take damage from my actions, so that I can defeat them and progress. |  |  |
| **Acceptance Criteria:** Given a card or effect hits an enemy  When a collision occurs  Then enemy health reaches 0  Then the enemy is defeated |  |  |

## 

| Dash player system | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to perform a dash so that I can evade attacks quickly. |  |  |
| **Acceptance Criteria:** Given I press spacebar  When dash is available  Then the player moves rapidly in the current direction Given dash is on cooldown  When I press space  Then dash is not executed |  |  |

## 

| Mouse aiming system | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to aim card effects using the mouse cursor so that I have precise directional control over where my cards land. |  |  |
| **Acceptance Criteria:** Given I am in an active room during combat,  When I move the mouse cursor,  Then a targeting reticle follows the cursor position; when I execute an active card, the effect resolves at or toward the cursor location |  |  |

## 

| Enemy attack telegraphing | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemy attacks to be telegraphed via wind-up animations or visible floor paths so that I have time to react and dodge. |  |  |
| **Acceptance Criteria:** Given an enemy is about to attack,  When the wind-up animation begins,  Then a visible indicator (animation or projected floor path) appears for at least 1 second before the attack resolves, giving the player time to dodge |  |  |

## 

| Player health display | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to see my current health displayed in the bottom-right of the screen at all times so that I can monitor my survival status during combat. |  |  |
| **Acceptance Criteria:** Given I am in any gameplay screen,  When damage is taken or health is restored,  Then the health display in the bottom-right updates immediately to reflect the new value |  |  |

## 

| Player damage visual feedback | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want a red screen flash when I take damage so that I have a clear visual cue that my health has decreased. |  |  |
| **Acceptance Criteria:** Given the player takes damage,  When the damage is applied,  Then a red flash briefly overlays the screen; as player health decreases, the intensity of the flash increases proportionally |  |  |

## 

| Enemy damage visual feedback | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to briefly flash red when they take damage so that I can confirm my attacks are connecting. |  |  |
| **Acceptance Criteria:** Given a card effect or projectile hits an enemy, When damage is applied,  Then the enemy's sprite changes to red for less than 0.5 seconds before returning to its normal color |  |  |

## 

| Boss enemy phase transitions | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the final boss to change its behavior and attacks as the fight progresses so that the encounter escalates in difficulty and tests my deck. |  |  |
| **Acceptance Criteria:** Given I am fighting the dimension boss,  When the boss's health crosses a defined phase threshold,  Then it transitions to a new attack pattern with increased aggression or a unique special mechanic; each phase transition is communicated via a visual animation |  |  |

## **Card system**

## **Card gameplay**

| Card select with num key | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to select the card using number keys (1 \- 5\) so that I can quickly select the card I want to execute. |  |  |
| **Acceptance Criteria:** Given I am in combat,  When I press keys 1 through 5,  Then the corresponding card slot is selected and highlighted; pressing the key executes the card effect immediately at the cursor position if the slot is not on cooldown |  |  |

## 

| Use a card with a left click | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to execute my cards using the mouse so that I can confirm my card to use in the game. |  |  |
| **Acceptance Criteria:** Given a card is selected in my active hand,  When I press the left mouse button,  Then the card's effect is executed at the cursor's current location and the slot enters its cooldown state |  |  |

## 

| Cooldown card system | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want cards to enter a cooldown after use so that I must manage timing and rotation strategically. |  |  |
| **Acceptance Criteria:** Given I use a card  When it is executed  Then it enters a cooldown and cannot be reused in a short time |  |  |

## 

| Cooldown visual indicator | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want a visual cooldown animation on each card slot so that I can see at a glance when a card will be available again. |  |  |
| **Acceptance Criteria:** Given a card has been played and is on cooldown,  When I look at the active hand HUD,  Then the card face dims and a circular wipe animation shows the remaining recharge time; when the cooldown expires, the card returns to its normal appearance |  |  |

## 

| Smart card slot shifting | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want my card number keys to shift left after a card is played so that I never have dead keys in the middle of my hand. |  |  |
| **Acceptance Criteria:** Given I play a card from a middle slot during combat,  When the card enters cooldown,  Then the remaining active cards shift left to fill the gap, ensuring contiguous key assignments with no empty slots between active cards |  |  |

## 

| Active card slot expansion | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to expand my active card hand from 3 to up to 5 slots so that I can carry more offensive and defensive options into combat. |  |  |
| **Acceptance Criteria:** Given I purchase a slot expansion at the shop,  When the transaction is confirmed,  Then a new active card slot (up to a maximum of 5\) appears in the active hand HUD and can be assigned a card |  |  |

## 

| Automatic card pool display | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want automatic cards to be shown in a separate area of the deck UI so that I can distinguish them from my active hand. |  |  |
| **Acceptance Criteria:** Given I open the deck management screen (Tab),  When I view my cards,  Then automatic cards are displayed separately from active cards with a clear label; the pool shows 4 to 8 slots and displays each card's trigger condition and current status |  |  |

## 

| Automatic card trigger execution | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want automatic cards to activate on their own when their trigger conditions are met so that my deck passively supports me during combat. |  |  |
| **Acceptance Criteria:** Given an automatic card is in my pool,  When its defined trigger condition is met during combat (e.g., HP drops below 50%, player dodges through an enemy, player enters a boss room),  Then the card's effect activates immediately without any player input |  |  |

## 

| Card rarity system | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want cards to have visually distinct rarities (Common, Rare, Epic, Legendary) so that I can immediately recognize a card's power level when I find it. |  |  |
| **Acceptance Criteria:** Given a card is displayed anywhere in the game (chest reward, shop, hand, deck UI),  When I look at the card,  Then its rarity is communicated by a distinct border color: bronze for Common, blue for Rare, purple for Epic, and gold for Legendary |  |  |

## 

| Card adquisiton display | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want a card acquisition animation to play whenever I obtain a new card so that the event is clearly communicated and feels rewarding. |  |  |
| **Acceptance Criteria:** Given I acquire a card by any method (chest, boss reward, shop, Glitch Pillar),  When the card is added to my deck,  Then a card image is displayed prominently on screen as the main focal point for a brief moment before dismissing |  |  |

 

## **Card upgrade**

| Automatic card merge on duplicate | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want duplicate cards to automatically merge and upgrade when I acquire them so that collecting multiples of the same card is always valuable. |  |  |
| **Acceptance Criteria:** Given I already own a card at base level and I acquire a second copy of the same card,  When the card is added to my collection,  Then both copies automatically merge into a single upgraded version; acquiring a third copy upgrades it again to max level |  |  |

## 

| Max-level card duplicate on credits | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want extra copies of max-level cards to convert into dimensional credits so that acquiring duplicates never feels wasted. |  |  |
| **Acceptance Criteria:** Given I own a card at max level and acquire an additional copy,  When the duplicate is added,  Then no merge occurs and the duplicate is automatically converted into dimensional credits: 10 for Common, 25 for Rare, 50 for Epic, and 100 for Legendary |  |  |

## 

| Active card upgrade effects | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want upgraded active cards to have reduced cooldowns and max-level cards to deal more damage and unlock secondary effects so that leveling up cards feels impactful. |  |  |
| **Acceptance Criteria:** Given an active card is at Upgraded level,  Then its cooldown is reduced by 30% compared to base;  Given it is at Max level,  Then its base damage, healing, or defense value increases by 40% and a unique secondary effect is unlocked that did not exist at lower levels |  |  |

## 

| Automatic card upgrade effects | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want upgraded automatic cards to trigger in more situations and max-level cards to apply stronger effects so that my passive cards scale with progression. |  |  |
| **Acceptance Criteria:** Given an automatic card is at Upgraded level,  Then its trigger condition is widened to activate in more situations than at base level;  Given it is at Max level,  Then the potency of its effect increases (larger damage bonus, longer buff duration, or stronger status) |  |  |

## **Synergy**

| Active card synergies | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want certain card combinations to activate special synergy effects so that creative deck building is rewarded during combat. |  |  |
| **Acceptance Criteria:** Given I have two or more synergy cards in play,  When the conditions of the synergy are met,  Then the special synergy effect is triggered and applied in combat |  |  |

## 

| Synergy indicator in hand | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to see a visual indicator when two or more cards in my hand form an active synergy so that I can take advantage of it during combat. |  |  |
| **Acceptance Criteria:** Given I have synergy-compatible cards in my hand,  When I look at my hand during combat,  Then a visual highlight or icon appears on those cards indicating an active synergy |  |  |

## 

| Synergy 4-second flag window | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want synergy trigger flags to expire after 4 seconds if not completed so that landing synergies requires active timing skill rather than passive accumulation. |  |  |
| **Acceptance Criteria:** Given a trigger card has been played and set a synergy flag on an enemy,  When 4 seconds pass without a matching catalyst card hitting the same enemy,  Then the flag is cleared and no synergy bonus is applied; if the catalyst lands within 4 seconds, the defined damage multiplier fires |  |  |

## **Deck management system**

| Deck management screen | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to open a deck management overlay with the Tab key at any time during exploration so that I can review and organize my cards without interrupting combat. |  |  |
| **Acceptance Criteria:** Given I am in exploration mode (not in active combat),  When I press Tab,  Then a deck management overlay appears showing all cards in my deck in a grid view with filter and sort options; pressing Tab again or Escape closes it |  |  |

## 

| Card filter and sort in deck UI | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to filter and sort my cards by cost, rarity, or type in the deck management screen so that I can quickly find the cards I want to manage. |  |  |
| **Acceptance Criteria:** Given the deck management screen is open,  When I select a filter or sort option,  Then the card grid reorders or filters instantly to show only the selected category with no load time |  |  |

## 

| Deck stats sidebar | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to see deck statistics in the management screen so that I can evaluate my build's overall composition. |  |  |
| **Acceptance Criteria:** Given the deck management screen is open,  When I view the stats sidebar,  Then I see the deck's dominant archetype, average cooldown cost, and total card count updated in real time as cards are added or removed |  |  |

## 

| Card removal at shop | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to pay to remove unwanted cards from my deck at the Dimension Store so that I can improve the consistency of my high-tier card plays. |  |  |
| **Acceptance Criteria:** Given I am at the shop and open the deck management screen,  When I select a card and click Remove Card,  Then the card is permanently removed from my deck for that run after I pay the removal fee; the action is confirmed via a prompt before deletion. |  |  |

## 

| Card tooltip in deck UI | Priority: Medium | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to hover over any card in the deck management screen to see its full stats and lore so that I can make informed decisions without cluttering the combat HUD. |  |  |
| **Acceptance Criteria:** Given the deck management overlay is open,  When I hover the mouse cursor over any card,  Then a tooltip appears displaying the card's full name, rarity, effect description, cooldown, level, and lore text |  |  |

## **Roguelite progression**

| Card resistance scaling system | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemy resistance to increase as I expand my card slots so that building a larger deck creates a fair counter-challenge that prevents a single strategy from dominating the entire run. |  |  |
| **Acceptance Criteria:** Given I expand beyond 3 active card slots,  Then enemies gain Card Resistance: 5% at 4 slots and 10% at 5 slots (max);  Given I expand beyond 4 automatic slots,  Then enemies gain an additional 3% resistance for every 2 automatic slots above 4; both resistances stack (max combined: 16% at 5 active \+ 8 automatic slots) |  |  |

## 

| Dimensional credits economy | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to earn dimensional credits from defeating enemies and opening chests so that I have currency to spend in the shop on cards and upgrades. |  |  |
| **Acceptance Criteria:** Given I defeat an enemy or open a chest,  When the drop event fires,  Then a credit amount is added to my wallet and displayed in the HUD; credits persist across room transitions and are accessible at any shop |  |  |

## 

| Post-level store | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to automatically enter the Dimension Store after defeating a level boss so that I have a guaranteed safe zone to manage my deck between major encounters. |  |  |
| **Acceptance Criteria:** Given I defeat the final boss of a level,  When the boss death animation completes,  Then the player is transported to the Dimension Store with no enemies present; I can buy cards, expand slots, remove cards, and leave when ready |  |  |

## 

| Shop card inventory and purchase | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the Dimension Store to offer 4 cards for sale per visit with visible prices so that I can make strategic purchases to complete my deck archetype. |  |  |
| **Acceptance Criteria:** Given I enter the shop,  When the shop screen loads,  Then 4 cards are displayed with price tags (20 to 80 credits based on rarity); clicking Buy and confirming the purchase deducts credits and adds the card to my deck; if I have insufficient credits, the Buy button is disabled |  |  |

## 

| Boss reward card selection | Priority: High | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to choose one of three cards offered as a reward after defeating a boss so that I can improve my deck in a way that fits my current strategy. |  |  |
| **Acceptance Criteria:** Given I defeat the final boss of a dimension,  When the reward screen appears,  Then 3 cards are shown drawn from a randomized selection pool; I select one and it is added to my deck; the other two are discarded |  |  |

## **Enemies**

| Enemy AI | Priority: High | Estimate: 10 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to attack me to my current position, so that combat feels live and dynamic. |  |  |
| **Acceptance Criteria:** Given an enemy detects the player  When the player is in enemy's range  Then the enemy moves toward or attacks the player |  |  |

## 

| Enemies respawns in rooms | Priority:  | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to appear when I enter in a room, so that I can upgrade my cards and player skills. |  |  |
| **Acceptance Criteria:** Given I enter a room  When the player enters in a new room  Then enemies spawn based on the room configuration  Given the room is cleared  When all enemies are defeated T hen no more enemies in the room |  |  |

## 

| Swarm enemy | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to fight fast and weak enemies, so that combat feels intense. |  |  |
| **Acceptance Criteria:** Given an enemy detects the player  When the player is in enemy's range  Then the enemy moves toward or attacks the player |  |  |

## 

| Tank enemy | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want to fight durable enemies, so that I need stronger strategies. |  |  |
| **Acceptance Criteria:**  |  |  |

## 

| Ranged enemy | Priority: High | Estimate: 8 hr |
| :---- | :---- | :---- |
| **User Story:** As a player, I want enemies that attack from distance so that I must reposition strategically. |  |  |
| **Acceptance Criteria:** Given a ranged enemy spawns (mid-sized sprite),  When the player is at distance,  Then the enemy maintains range and fires projectiles at the player on a cooldown; it retreats if the player closes distance |  |  |

## 

| Life enemy system | Priority: High | Estimate: 5 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to have a health bar so that I can track progress toward defeating them. |  |  |
| **Acceptance Criteria:** Given an enemy receives damage  When damage is applied  Then its health decreases and the health bar updates;  Given health reaches zero  Then the enemy death animation plays and the entity is removed from the room |  |  |

## 

| Dimension-specific enemy visual | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to have different visual designs in each dimension so that the world feels cohesive and distinct. |  |  |
| **Acceptance Criteria:** Given I enter a Dark Ages dimension,  Then enemies render using the dark fantasy bestiary (Dungeon Rat, Slime, Skeleton);  Given I enter the Old West dimension,  Then enemies render using the western bestiary (Desert Rat, Bandit, Cactus Thug); all behavioral archetypes remain the same across dimensions |  |  |

## 

| Enemy credit drop on death | Priority: High | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want enemies to drop dimensional credits when defeated so that I earn currency through combat. |  |  |
| **Acceptance Criteria:** Given an enemy's health reaches zero,  When the death animation plays,  Then a credit pickup spawns at the enemy's position; the player automatically collects it upon moving into range, adding the amount to the wallet display |  |  |

## 

## **Dimensions** 

| Dark Ages dimension theme | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the Dark Ages dimension to use a dark fantasy castle and cavern visual theme so that I feel trapped in a heavy, enclosed environment. |  |  |
| **Acceptance Criteria:** Given I am in the Dark Ages dimension,  When a room loads,  Then the tileset uses stone floors, pillars, doors, torches, tables, and bones; the music plays the dark dungeon track; ambient sounds include whispering distant voices |  |  |

## 

| Old West dimension theme | Priority: High | Estimate: 6 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want the Old West dimension to use a dusty desert and frontier town visual theme so that it feels open and lawless compared to the Dark Ages. |  |  |
| **Acceptance Criteria:** Given I am in the Old West dimension,  When a room loads,  Then the tileset uses sand, dirt paths, rocky ground, cacti, dry bushes, and boxes; the music plays the western soundtrack; ambient sounds include desert wind |  |  |

## 

## **Telemetry**

| Telemetry: time per dimension KPI | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to track the average minutes spent in each dimension per run so that I can identify biomes that cause players to stall or rush and fix pacing issues. |  |  |
| **Acceptance Criteria:** Given a run is in progress,  When the player enters a dimension,  Then the TelemetryLogger begins a timer; when the player exits the dimension (by death or transition), the elapsed time is logged with the biome identifier to a local session file |  |  |

## 

| Telemetry: most discarded card KPI | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to track which active card is removed from the deck most often at the shop so that I can identify underperforming cards relative to their rarity and cost. |  |  |
| **Acceptance Criteria:** Given a player removes a card at the shop,  When the removal is confirmed,  Then the TelemetryLogger records the card name, rarity, and cost in the session log; this data is aggregatable across sessions to rank cards by removal frequency |  |  |

## 

| Telemetry: run length at death KPI | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to track the room number where Game Over screens most frequently occur so that I can identify procedural layout difficulty spikes. |  |  |
| **Acceptance Criteria:** Given the player dies,  When the Game Over screen triggers,  Then the TelemetryLogger records the current room number and dimension identifier to the session log; the data is exportable for balance review |  |  |

## 

| Telemetry: win/loss analytics | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to log the frequency of Game Over versus Victory screens so that I can gauge the game's overall accessibility and difficulty balance. |  |  |
| **Acceptance Criteria:** Given a run ends in either a Game Over or Victory,  When the result screen appears,  Then the TelemetryLogger records the outcome, total run duration, and highest biome reached; the log is written to the local session file |  |  |

## 

| Telemetry: card usage analytics | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to track which active cards are selected most often and which automatic triggers activate most in combat so that I can balance card utility and rarity. |  |  |
| **Acceptance Criteria:** Given a card is played or an automatic trigger activates during combat,  When the event fires,  Then the TelemetryLogger records the card name, type (active/automatic), and current run room number; the data feeds into card selection rate and trigger activation rate summaries |  |  |

## 

| Telemetry: economic balancing log | Priority: Low | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a developer, I want to log how players spend dimensional credits so that I can determine whether players prioritize new cards, shop items, or permanent Hub upgrades. |  |  |
| **Acceptance Criteria:** Given a player spends dimensional credits,  When the transaction completes,  Then the TelemetryLogger records the amount spent, the category (card purchase, slot expansion, card removal, Hub upgrade), and the current run state |  |  |

## 

## **Audio and sound**

| Dimension-specific music tracks | Priority: Medium | Estimate: 3 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want distinct music tracks to play in each dimension so that the audio reinforces where I am and maintains tension throughout the run. |  |  |
| **Acceptance Criteria:** Given I enter the Dark Ages dimension,  Then the dark dungeon exploration track plays;  Given I enter the Old West dimension,  Then the western soundtrack plays;  Given I am in a boss room,  Then the boss battle track plays; all tracks loop seamlessly |  |  |

## 

| UI state music | Priority: Low | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want appropriate music to play on the main menu, defeat screen, victory screen, and credits so that the game's audio identity is consistent across all screens. |  |  |
| **Acceptance Criteria:** Given I am on the main menu,  Then the main menu track plays;  Given the Game Over screen appears,  Then the defeat track plays;  Given the Victory screen appears,  Then the victory track plays;  Given I am on the credits screen, Then the credits track plays |  |  |

## 

| Combat and interaction sound effects | Priority: Medium | Estimate: 4 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want distinct music tracks to play in each dimension so that the audio reinforces where I am and maintains tension throughout the run. |  |  |
| **Acceptance Criteria:** Given I enter the Dark Ages dimension,  Then the dark dungeon exploration track plays;  Given I enter the Old West dimension,  Then the western soundtrack plays;  Given I am in a boss room,  Then the boss battle track plays; all tracks loop seamlessly |  |  |

## 

| Ambient environmental sounds | Priority: Low | Estimate: 2 hr |
| :---- | :---- | :---- |
| **User Story:**  As a player, I want subtle ambient sounds in each dimension so that the environment feels alive without overwhelming the gameplay audio. |  |  |
| **Acceptance Criteria:** Given I am in the Old West dimension, Then desert wind ambient audio plays at a low volume; Given I am in the Dark Ages dimension, Then whispering distant voice ambient audio plays at a low volume; ambient sounds do not interrupt or overpower music or sound effects |  |  |

[image1]: <data:image/png;base64,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>