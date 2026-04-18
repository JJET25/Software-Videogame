![tec](Img/Logo_TEC.png)
# **Dimension Deck**
## _Game Design Document_

**Professors:**
- Gilberto Echerría Juarez
- Esteban Castillo Juarez
- 

**Developers**
- Jesús José Espinoza Torruco  |  A01781963
- Vladimir Piñera Reyes        |  A01786772
- Gonzalo Zamarrón Orrantia    |  A01782739

##
## _Index_

1. [Index](#index)
2. [Game Design](#game-design)
   1. [Summary](#summary)
   2. [Gameplay](#gameplay)
   3. [Mindset](#mindset)
3. [Technical](#technical)
   1. [Screens](#screens)
   2. [Controls](#controls)
   3. [Mechanics](#mechanics)
4. [Level Design](#level-design)
   1. [Themes](#themes)
   2. [Game Flow](#game-flow)
5. [Development](#development)
   1. [Abstract Classes](#abstract-classes--components)
   2. [Derived Classes](#derived-classes--component-compositions)
6. [Graphics](#graphics)
   1. [Style Attributes](#style-attributes)
   2. [Graphics Needed](#graphics-needed)
7. [Sounds/Music](#soundsmusic)
   1. [Style Attributes](#style-attributes-1)
   2. [Sounds Needed](#sounds-needed)
   3. [Music Needed](#music-needed)
8. [Schedule](#schedule)

## _Game Design_
---

### **Summary**
A retro-styled open-world adventure game inspired by the retro game aesthetic, where every room of the map hides a surprise: a new card to collect, a hidden reward, or an unexpected boss fight. The player builds their deck as they explore, finding attack, defense, and support cards scattered across the world, creating a unique and evolving strategy with every run. Combat is entirely card-based, meaning the hand you've built determines whether you survive what's behind the next door. With a world that shifts themes and challenges as the player progresses and a randomized structure that ensures no two runs ever feel the same, the game delivers the tension of a roguelite wrapped in the charm of classic pixel-art adventure.

### **Gameplay**
This is a dynamic game that combines a fast-paced action roguelite with the dynamic freedom of a deck builder using a 2D design. It uses the movement, top-down from The Binding of Isaac, with strategic deck management that Slay the Spire uses. 

The players use their deck of cards in order to materialize attacks, defenses, and effects performed at the moment. The combat mechanics consist of two different types of cards. Active cards that the user can use in order to attack, heal or defend; and secondary cards that help the user when certain conditions are met or that help as stat boosts for the player.

We let the player navigate in randomized rooms in order to find loot, shops, or enemies, leading to the main goal of advancing from rooms and worlds by clearing rooms. We let the user draft new cards by buying them or obtaining them by killing enemies and bosses with a final purpose of killing the final boss of each room in order to advance. 

### **Mindset**
The player should feel empowered and free and have control of her decision, movements and where to explore a big procedural world. His principal objective is to collect power-up cards.

We prioritize exploration and card collection and interactive combat. We leave a bit of the balance in the cards game. The style of game we want to demonstrate is dynamic gameplay where you can feel the combat; you need to move every time for evade the enemy’s attacks


## _Technical_
---

### **Screens**
The game features the following core screens: a Main Menu (New Run, Continue, Settings, Quit); the Hub World, where permanent upgrades are purchased between runs; the Dimension Map, showing the current biome and available rooms; the Room/Combat Screen, where real-time card-based gameplay takes place; a Deck Management Screen for reviewing and organizing active and automatic cards; the Shop (Dimension Store) for purchasing cards and expanding deck capacity; and a Game Over/Victory Screen that returns the player to the Hub with earned dimensional credits.

### **Controls**

### **Mechanics**
Combat is real-time and card-based, requiring simultaneous movement and decision-making.

- **Active Cards:**
  - Player-controlled
  - 3 initial slots (expandable to 5)
  - Used for attacks, area damage, and healing
  - Have cooldown via discard system

- **Automatic Cards:**
  - Trigger based on conditions
  - 4–8 slots capacity
  - Provide passive or reactive effects

Enemies scale using **card resistance**, forcing continuous adaptation in strategy.

## _Level Design_
---

### **Themes**

1. **The Old West**
   1. Mood  
      - Dry, hostile, adventurous  
   2. Objects  
      1. _Ambient_  
         - Dusty environment  
         - Small western town  
      2. _Interactive_  
         - Bandits  
         - Wild animals  

2. **The Dark Ages**
   1. Mood  
      - Dark, tense, dangerous  
   2. Objects  
      1. _Ambient_  
         - Castle interiors  
      2. _Interactive_  
         - Skeletons  
         - Dragons  
         - Fantasy enemies  

### **Game Flow**

## _Development_
---

### **Abstract Classes / Components**

### **Derived Classes / Component Compositions**

## _Graphics_
---

### **Style Attributes**
The game uses a **16-bit pixel art style** inspired by retro games, with fluid animations. Each dimension has a distinct visual identity to reinforce progression and immersion.

### **Graphics Needed**

## _Sounds/Music_
---

### **Style Attributes**

### **Sounds Needed**

### **Music Needed**

## _Schedule_
---