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

// Main gameplay screen, sets up all game systems and delegates update/draw each frame
export default class GameplayScreen extends Screen {
  enter(context = {}) {
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

    // Track room state for stat counting
    this._prevRoom = null;
    this._deadEnemies = new Set();
    this._roomCounted = false;

    this.pauseMenu = new PauseMenu(this.audio);
    window.testingMode = false;

    // Load starter cards from DB; fall back to hardcoded deck if API is down
    this._loadStarterCards();
  }

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

      // Always load default starter cards first
      for (const data of dbCards ?? []) {
        const card = createCard(data);
        if (card) this.cardManager.addCard(card);
      }
      if (!dbCards?.length) this._addFallbackCards();

      // Then add saved cards on top (addCard handles upgrades for duplicates)
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

      // All cards present at run start are treated as starters
      this._starterCardNames = new Set(this._getAllCards().map(c => c.name));
    } catch {
      this._addFallbackCards();
      this._starterCardNames = new Set(
        this._getAllCards().map(c => c.name)
      );
    }
  }

  _addFallbackCards() {
    for (const create of STARTER_DECK) this.cardManager.addCard(create());
  }

  _getAllCards() {
    return [
      ...this.cardManager.activeSlots,
      ...this.cardManager.autoSlots,
      ...this.cardManager.storage,
    ].filter(Boolean);
  }

  exit() {
    this.audio?.stopBGM();
  }

  update(deltaTime) {
    // Overlay activo — el juego se pausa detrás
    if (this._overlay) {
      this._overlay.update(deltaTime);
      return;
    }

    if (this.player.isDead && !this._runEnded) {
      this.#finishRun("defeat");
      return;
    }

    // Notification banner — freeze world until player presses ENTER
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

    // ESC or ENTER toggles pause when shop and deck are closed
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

    // DeckScreen consumes clicks before the player does
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

    // Darken the screen if brightness is reduced in settings
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

    // Overlay encima de todo — reset ctx después para no contaminar el HUD
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

  // --------------------- METHODS ---------------------
  onVictory() {
    if (!this._runEnded) this.#finishRun("victory");
  }

  showNotification(message) {
    this._notification = { message };
    this.player.freeze(99999);
  }

  // --------------------- PRIVATE HELPERS ---------------------
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

  // Handles pause menu button results
  #updatePauseMenu() {
    const result = this.pauseMenu.update(this.mouse);
    if (result === "resume") this._paused = false;
    if (result === "restart")
      this.screenManager.changeTo(new this.constructor());
    if (result === "menu") window.location.href = "/index.html";
  }

  // Tracks damage taken/dealt, enemies killed, and rooms cleared each frame
  #trackStats(room, prevHealth, enemySnap = new Map()) {
    const dmgTaken = Math.max(0, prevHealth - this.player.health);
    this.stats.damageTaken += dmgTaken;
    if (dmgTaken > 0) this.hud.triggerDamageFlash();

    // Accumulate damage dealt to enemies this frame
    for (const [enemy, prevHp] of enemySnap) {
      this.stats.damageDealt += Math.max(0, prevHp - enemy.health);
    }

    // Reset counters when the player enters a new room
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

  // Runs interactable checks and shop UI updates
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

  // Draws a dark banner at the bottom with a message and a hint to continue
  #drawNotification(renderer, message) {
    const PIXEL = { font: "'Press Start 2P', monospace", align: "center" };
    renderer.drawRect(0, ROOM_HEIGHT - 40, ROOM_WIDTH, 40, "rgba(0,0,0,0.85)");
    renderer.drawText(message, ROOM_WIDTH / 2, ROOM_HEIGHT - 25, 5, "#ffffff", PIXEL);
    renderer.drawText("Press ENTER to continue", ROOM_WIDTH / 2, ROOM_HEIGHT - 10, 4, "#888888", PIXEL);
  }

  // --------------------- BGM ---------------------
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

  // --------------------- SFX ---------------------
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
