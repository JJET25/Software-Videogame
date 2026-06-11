// GameplayScreen.js — Main gameplay screen that sets up all game systems and delegates update and draw each frame
import Screen from "./Screen.js";
import DefeatScreen from "./DefeatScreen.js";

import Player from "../Entities/Player.js";
import Vector from "../Utils/Vector.js";

import CardManager from "../cards/CardManager.js";
import { STARTER_DECK } from "../cards/CardCatalog.js";
import { createCard } from "../cards/CardFactory.js";

import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import MiniMap from "../UI/Minimap.js";
import PauseMenu from "../UI/PauseMenu.js";

import DimensionManager from "../Systems/DimensionManager.js";
import InteractionManager from "../Systems/InteractionManager.js";

import LevelScreen from "./LevelScreen.js";
import VictoryScreen from "./VictoryScreen.js";
import DimensionTransitionScreen from "./DimensionTransitionScreen.js";

import {
  createRun,
  endRun,
  fetchStarterCards,
  fetchAllCards,
} from "../Utils/Api.js";
import { ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

export default class GameplayScreen extends Screen {
  // Initializes all systems, starts the dimension run, and loads starter cards from the API
  async enter(context = {}) {
    this.cardManager = new CardManager();
    this.hud = new HUD();
    this.deckScreen = new DeckScreen();
    this.interaction = new InteractionManager(this.input);

    this.player = new Player(
      new Vector(0, 0),
      this.input,
      this.mouse,
      this.audio,
    );
    this.player.cardManager = this.cardManager;
    this.player.getEnemies = () =>
      this.dimManager?.getRoomManager()?.currentRoom?.enemies ?? [];
    this.player.getObjects = () =>
      this.dimManager?.getRoomManager()?.currentRoom?.objects ?? [];

    this._overlay = null;

    this.dimManager = new DimensionManager(
      this.player,
      () => this.onVictory(),
      (levelNum, dimName, phase, done) =>
        this.#showLevelOverlay(levelNum, dimName, phase, done),
      (fromName, toName, done) =>
        this.#showDimensionTransitionOverlay(fromName, toName, done),
      (bossType, dimName, nextLabel, done) =>
        this.#showBossKillOverlay(bossType, dimName, nextLabel, done),
    );
    this.dimManager.startRun();

    this.#loadAndPlayBGM();
    this.#loadSFX();

    this.minimap = new MiniMap(this.dimManager);

    this._paused = false;
    this._runEnded = false;
    this._notification = null;
    this.runId = null;
    this._runPromise = null;
    this.cardCatalog = [];
    this.stats = {
      roomsCleared: 0,
      enemiesKilled: 0,
      damageTaken: 0,
      damageDealt: 0,
    };
    this._enemyHealthSnap = new Map();

    // Tracks the previous room reference and dead enemies for stat counting
    this._prevRoom = null;
    this._deadEnemies = new Set();
    this._roomCounted = false;

    this.pauseMenu = new PauseMenu(this.audio);
    window.testingMode = false;

    // Loads starter cards from the DB; falls back to a hardcoded deck if the API is unavailable
    await this._loadStarterCards();
  }

  // Fetches run data, starter cards, and the full card catalog concurrently; applies any saved deck on top
  async _loadStarterCards() {
    const runPromise = createRun();
    this._runPromise = runPromise;
    try {
      const [runData, dbCards, allCards] = await Promise.all([
        runPromise,
        fetchStarterCards(),
        fetchAllCards(),
      ]);
      this.cardCatalog = allCards ?? [];
      this.runId = runData?.runId ?? null;

      for (const data of dbCards ?? []) {
        const card = createCard(data);
        if (card) this.cardManager.addCard(card);
      }
      if (!dbCards?.length) this._addFallbackCards();

      // Saved cards are layered on top; addCard handles upgrades for duplicates
      const savedRaw = localStorage.getItem("dimensionDeck_savedDeck");
      const savedDeck = savedRaw ? JSON.parse(savedRaw) : null;
      if (savedDeck?.length && allCards?.length) {
        for (const { name, level } of savedDeck) {
          const dbData = allCards.find(d => d.card_name === name);
          if (dbData) {
            const card = createCard(dbData);
            if (card) {
              card.level = level ?? 1;
              this.cardManager.addCard(card);
            }
          }
        }
      }

      // All cards present at run start are recorded as starters for end-of-run comparison
      this._starterCardNames = new Set(this._getAllCards().map(c => c.name));
    } catch {
      this._addFallbackCards();
      this._starterCardNames = new Set(
        this._getAllCards().map(c => c.name)
      );
    }
  }

  // Populates the deck with the hardcoded starter set when the API is unavailable
  _addFallbackCards() {
    for (const create of STARTER_DECK) this.cardManager.addCard(create());
  }

  // Returns a flat array of all cards across active slots, auto slots, and storage
  _getAllCards() {
    return [
      ...this.cardManager.activeSlots,
      ...this.cardManager.autoSlots,
      ...this.cardManager.storage,
    ].filter(Boolean);
  }

  // Stops background music when leaving the gameplay screen
  exit() {
    this.audio?.stopBGM();
  }

  // Advances all game systems each frame; pauses the world when an overlay or pause menu is active
  update(deltaTime) {
    // Active overlay suspends all world updates
    if (this._overlay) {
      this._overlay.update(deltaTime);
      return;
    }

    if (this.player.isDead && !this._runEnded) {
      this.#finishRun("defeat");
      return;
    }

    // Notification banner freezes the world until the player presses ENTER
    if (this._notification) {
      if (this.input.wasKeyPressed("ENTER")) {
        this._notification = null;
        this.player.unfreeze();
      }
      return;
    }

    const rm = this.dimManager.getRoomManager();
    const room = rm.currentRoom;
    const shopOpen = room?.isShopRoom && room.storeUI?.isOpen;

    // ESC or ENTER toggles pause when the shop and deck screen are both closed
    const wantsPause =
      this.input.wasKeyPressed("ESCAPE") || this.input.wasKeyPressed("ENTER");
    if (wantsPause && !shopOpen && !this.deckScreen.isOpen) {
      this._paused = !this._paused;
      this.audio?.playSFX(this._paused ? "pause" : "unpause");
    }

    if (this._paused) {
      this.#updatePauseMenu();
      return;
    }

    if (this.input.isKeyDown("SHIFT") && this.input.wasKeyPressed("T")) {
      window.testingMode = !window.testingMode;
    }

    // DeckScreen consumes mouse clicks before the player does
    if (!shopOpen) {
      const wasOpen = this.deckScreen.isOpen;
      this.deckScreen.update(
        this.input,
        this.mouse,
        this.cardManager,
        this.audio,
      );
      if (this.deckScreen.isOpen !== wasOpen) {
        this.audio?.playSFX(this.deckScreen.isOpen ? "pause" : "unpause");
      }
    }

    const prevHealth = this.player.health;
    const enemySnap = new Map(
      (room?.enemies ?? []).map((e) => [e, e.health])
    );

    if (!shopOpen && !this.deckScreen.isOpen) this.player.update(deltaTime);

    if (!this.deckScreen.isOpen) {
      this.cardManager.update(deltaTime);
      rm.update(deltaTime);
      this.#trackStats(room, prevHealth, enemySnap);
    }

    this.hud.update(deltaTime);
    this.#updateInteractables(room, shopOpen);

    if (room?.isShopRoom)
      room.storeUI?.update(
        this.input,
        this.player,
        this.cardManager,
        this.mouse,
        this.audio,
      );

    this.#updateBGM();
  }

  // Draws the world, HUD, minimap, deck screen, shop UI, brightness overlay, pause menu, and any active overlay
  draw(renderer) {
    renderer.clear();
    this.dimManager.getRoomManager().draw(renderer);
    this.player.draw(renderer);
    this.minimap.draw(renderer);
    this.hud.draw(renderer, this.player, this.cardManager);
    this.deckScreen.draw(renderer, this.cardManager);

    const room = this.dimManager.getRoomManager().currentRoom;
    if (room?.isShopRoom && room.storeUI?.isOpen) {
      room.storeUI.draw(renderer, this.player, this.cardManager, this.mouse);
    }

    // Apply a darkening layer when brightness is reduced in settings
    const brightness = window.gameBrightness ?? 1.0;
    if (brightness < 1.0) {
      const alpha = ((1.0 - brightness) * 0.85).toFixed(2);
      renderer.drawRect(
        0,
        0,
        renderer.GAME_WIDTH,
        renderer.GAME_HEIGHT,
        `rgba(0,0,0,${alpha})`,
      );
    }

    if (this._paused) this.pauseMenu.draw(renderer, this.mouse);

    if (this._notification)
      this.#drawNotification(renderer, this._notification.message);

    // Overlay is drawn last; canvas state is reset afterward to prevent contamination
    if (this._overlay) {
      this._overlay.draw(renderer);
      const ctx = renderer.context;
      ctx.globalAlpha = 1;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  }

  // Triggers the victory flow if the run has not already ended
  onVictory() {
    if (!this._runEnded) this.#finishRun("victory");
  }

  // Freezes the player and displays a dismissable message banner
  showNotification(message) {
    this._notification = { message };
    this.player.freeze(99999);
  }

  // Instantiates an overlay screen, attaches services, and mounts it over the gameplay layer
  #mountOverlay(OverlayClass, context) {
    const overlay = new OverlayClass();
    overlay.attach({
      renderer: this.renderer,
      input: this.input,
      mouse: this.mouse,
      screenManager: this.screenManager,
    });
    overlay.enter(context);
    this._overlay = overlay;
  }

  // Shows the level number overlay and clears it once the screen calls onDone
  #showLevelOverlay(levelNumber, dimensionName, phaseName, onDone) {
    this.#mountOverlay(LevelScreen, {
      levelNumber,
      dimensionName,
      phaseName,
      onDone: () => {
        this._overlay = null;
        onDone?.();
      },
    });
  }

  // Shows the boss-defeated overlay and resumes the run when dismissed
  #showBossKillOverlay(bossType, dimensionName, nextLabel, onDone) {
    this.#mountOverlay(VictoryScreen, {
      bossType,
      dimensionName,
      nextLabel,
      onContinue: () => {
        this._overlay = null;
        onDone?.();
      },
    });
  }

  // Shows the dimension-shift overlay and resumes when it finishes
  #showDimensionTransitionOverlay(fromName, toName, onDone) {
    this.#mountOverlay(DimensionTransitionScreen, {
      fromName,
      toName,
      onDone: () => {
        this._overlay = null;
        onDone?.();
      },
    });
  }

  // Handles pause menu button results and routes to the appropriate action
  #updatePauseMenu() {
    const result = this.pauseMenu.update(this.mouse);
    if (result === "resume") this._paused = false;
    if (result === "restart")
      this.screenManager.changeTo(new this.constructor());
    if (result === "menu") window.location.href = "/index.html";
  }

  // Tracks damage taken and dealt, enemies killed, and rooms cleared each frame
  #trackStats(room, prevHealth, enemySnap = new Map()) {
    const dmgTaken = Math.max(0, prevHealth - this.player.health);
    this.stats.damageTaken += dmgTaken;
    if (dmgTaken > 0) this.hud.triggerDamageFlash();

    for (const [enemy, prevHp] of enemySnap) {
      this.stats.damageDealt += Math.max(0, prevHp - enemy.health);
    }

    // Reset per-room counters when the player moves to a different room
    if (room !== this._prevRoom) {
      this._prevRoom = room;
      this._deadEnemies = new Set();
      this._roomCounted = false;
    }

    for (const [enemy] of enemySnap) {
      if (enemy.isDead && !this._deadEnemies.has(enemy)) {
        this._deadEnemies.add(enemy);
        this.stats.enemiesKilled++;
      }
    }

    if (room?.isCleared && !this._roomCounted) {
      this._roomCounted = true;
      this.stats.roomsCleared++;
    }
  }

  // Runs interactable proximity and input checks for the current room
  #updateInteractables(room, shopOpen) {
    const interactables = room?.getInteractables?.() ?? [];
    if (interactables.length > 0 && !shopOpen) {
      this.interaction.update(this.player, interactables, {
        cardManager: this.cardManager,
        cardCatalog: this.cardCatalog,
        showNotification: (msg) => this.showNotification(msg),
        advanceLevel: () => this.dimManager.advanceLevel(),
        canAdvance: () => this.dimManager.canAdvanceLevel(),
      });
    }
  }

  // Computes final stats, separates newly acquired cards, and navigates to the end screen
  #finishRun(status) {
    this._runEnded = true;
    const allCards = this._getAllCards();
    const starterNames = this._starterCardNames ?? new Set();
    const newCards = allCards.filter(c => !starterNames.has(c.name));
    const finalStats = {
      status,
      ...this.stats,
      damageDealt: this.stats.damageDealt,
      creditsEarned: this.player.creditsEarned,
      cardsCollected: allCards.length,
      cardIds: allCards.map(c => c.id).filter(Boolean),
    };
    this.screenManager.changeTo(new DefeatScreen(), {
      runId: this.runId,
      runPromise: this._runPromise,
      newCards,
      cardCatalog: this.cardCatalog,
      ...finalStats,
    });
  }

  // Draws a semi-transparent banner at the bottom with a message and a hint to continue
  #drawNotification(renderer, message) {
    const PIXEL = { font: "'Press Start 2P', monospace", align: "center" };
    renderer.drawRect(0, ROOM_HEIGHT - 40, ROOM_WIDTH, 40, "rgba(0,0,0,0.85)");
    renderer.drawText(message, ROOM_WIDTH / 2, ROOM_HEIGHT - 25, 5, "#ffffff", PIXEL);
    renderer.drawText("Press ENTER to continue", ROOM_WIDTH / 2, ROOM_HEIGHT - 10, 4, "#888888", PIXEL);
  }

  // Loads all background music tracks and begins playback for the current room state
  #loadAndPlayBGM() {
    const BASE = "../../Assets/Audios/BGM/";
    this.audio.loadBGM("darkAges", BASE + "DarkAgesTheme.mp3");
    this.audio.loadBGM("oldWest", BASE + "OldWestTheme.mp3");
    this.audio.loadBGM("combat", BASE + "CombatRoomTheme.mp3");
    this.audio.loadBGM("miniBoss", BASE + "MiniBossTheme.mp3");
    this.audio.loadBGM("finalBoss", BASE + "FinalBossTheme.mp3");
    this.audio.loadBGM("finalBossTheme_2", BASE + "FinalBossTheme_2.mp3");
    this.audio.loadBGM("mrBombastic", BASE + "MrBombasticTheme.mp3");
    this.#updateBGM();
  }

  // Selects the correct BGM track based on the current room type and dimension
  #updateBGM() {
    const room = this.dimManager?.getRoomManager()?.currentRoom;
    const dim = this.dimManager?.getCurrentDimension();

    this.player.floorType = dim?.id === "oldWest" ? "wood" : "stone";

    const nodeType = room?.nodeType ?? null;
    const inBoss = nodeType === "miniBoss" || nodeType === "finalBoss";
    const inCombat = room?.enemies?.length > 0 && !room?.isCleared && !inBoss;

    if (room?.isBombasticRoom && room.mrBombastic?.isDancing) {
      this.audio.playBGM("mrBombastic");
      return;
    }

    if (nodeType === "finalBoss") {
      // Hook into the boss phase 3 event to switch the music track on entry
      const boss = room?.enemies?.[0];
      if (boss && !boss._phase3Hooked) {
        boss._phase3Hooked = true;
        boss.onPhase3Enter = () => this.audio.playBGM("finalBossTheme_2");
      }

      if (
        this.audio._currentBGMName !== "finalBoss" &&
        this.audio._currentBGMName !== "finalBossTheme_2"
      )
        this.audio.playBGM("finalBoss");
    } else if (nodeType === "miniBoss") this.audio.playBGM("miniBoss");
    else if (inCombat) this.audio.playBGM("combat");
    else {
      const dimKey = dim?.id === "oldWest" ? "oldWest" : "darkAges";
      this.audio.playBGM(dimKey);
    }
  }

  // Registers all sound effect assets used during gameplay
  #loadSFX() {
    const BASE = "../../Assets/Audios/SFX/";
    const sfx = [
      ["playerHit", "PlayerHit.wav"],
      ["playerDeath", "PlayerLose.wav"],
      ["dash", "PlayerDash.wav"],
      ["enemyHit", "EnemyHit.wav"],
      ["enemyDeath", "EnemyDeath.wav"],
      ["cardMelee", "MeleeCardEffect.wav"],
      ["cardHeal", "HealCardEffect.wav"],
      ["cardDefense", "DefenseCardEffect.wav"],
      ["creditPickup", "Coin.wav"],
      ["chestOpen", "ChestReward.wav"],
      ["boxBreak", "BoxBreak.mp3"],
      ["cardSelect", "CardChange.wav"],
      ["teleport", "Teleport.wav"],
      ["roomOpen", "RoomOpen.mp3"],
      ["spikes", "Spikes.wav"],
      ["hoverUI", "HoverUI.wav"],
      ["confirmUI", "ConfirmUI.wav"],
      ["buySell", "BuySell.wav"],
      ["deniedUI", "DeniedUI.wav"],
      ["declineUI", "DeclineUI.wav"],
      ["equip", "Equip.wav"],
      ["unequip", "Unequip.wav"],
      ["pause", "Pause.wav"],
      ["unpause", "Unpause.wav"],
      ["stepsStone", "PlayerStoneSteps.wav"],
      ["stepsWood", "PlayerWoodSteps.wav"],
      ["bullet", "Bullet.wav"],
    ];
    for (const [name, file] of sfx) this.audio.loadSFX(name, BASE + file);
  }
}
