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

    this.player = new Player(new Vector(0, 0), this.input, this.mouse);
    this.player.cardManager = this.cardManager;
    this.player.getEnemies = () =>
      this.dimManager?.getRoomManager()?.currentRoom?.enemies ?? [];
    this.player.getObjects = () =>
      this.dimManager?.getRoomManager()?.currentRoom?.objects ?? [];

    this.dimManager = new DimensionManager(this.player, () => this.onVictory());
    this.dimManager.startRun();

    this.minimap = new MiniMap(this.dimManager);

    this._paused = false;
    this._runEnded = false;
    this._notification = null;
    this.runId = null;
    this._runPromise = null;
    this.cardCatalog = [];
    this.stats = { roomsCleared: 0, enemiesKilled: 0, damageTaken: 0 };

    // Track room state for stat counting
    this._prevRoom = null;
    this._deadEnemies = new Set();
    this._roomCounted = false;

    this.pauseMenu = new PauseMenu();
    window.testingMode = false;

    // Overlay para LevelScreen / VictoryScreen / DimensionTransitionScreen
    this._overlay = null;

    // Load starter cards from DB; fall back to hardcoded deck if API is down
    this._loadStarterCards();

    // Mostrar Level 1 al iniciar
    this.#showLevelOverlay(1, null);
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

      for (const data of dbCards ?? []) {
        const card = createCard(data);
        if (card) this.cardManager.addCard(card);
      }
      if (!dbCards?.length) this._addFallbackCards();
    } catch {
      this._addFallbackCards();
    }
  }

  _addFallbackCards() {
    for (const create of STARTER_DECK) this.cardManager.addCard(create());
  }

  exit() {}

  update(deltaTime) {
    // El overlay maneja su propio input; el juego se pausa detrás
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

    // ENTER toggles pause when shop and deck are closed
    if (
      this.input.wasKeyPressed("ENTER") &&
      !shopOpen &&
      !this.deckScreen.isOpen
    ) {
      this._paused = !this._paused;
    }

    if (this._paused) {
      this.#updatePauseMenu();
      return;
    }

    if (this.input.isKeyDown("SHIFT") && this.input.wasKeyPressed("T")) {
      window.testingMode = !window.testingMode;
    }

    // DeckScreen consumes clicks before the player does
    if (!shopOpen)
      this.deckScreen.update(this.input, this.mouse, this.cardManager);

    const prevHealth = this.player.health;
    if (!shopOpen && !this.deckScreen.isOpen) this.player.update(deltaTime);

    this.cardManager.update(deltaTime);
    rm.update(deltaTime);

    this.#trackStats(room, prevHealth);
    this.hud.update(deltaTime);
    this.#updateInteractables(room, shopOpen);

    if (room?.isShopRoom)
      room.storeUI?.update(this.input, this.player, this.cardManager);
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
      room.storeUI.draw(renderer, this.player, this.cardManager);
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

    // El overlay se dibuja encima de todo
    if (this._overlay) this._overlay.draw(renderer);
  }

  // --------------------- METHODS ---------------------
  onVictory() {
    if (!this._runEnded) this.#finishRun("victory");
  }

  showNotification(message) {
    this._notification = { message };
    this.player.freeze(99999);
  }

  // Llamar esto desde DimensionManager cuando avanza de fase
  showLevelVictory(nextLevelNumber, onContinue) {
    this.#showVictoryOverlay(nextLevelNumber, onContinue);
  }

  // Llamar esto desde DimensionManager al cambiar de dimensión
  showDimensionTransition(fromName, toName, onDone) {
    this.#showDimensionTransitionOverlay(fromName, toName, onDone);
  }

  // --------------------- PRIVATE HELPERS ---------------------
  // Crea y muestra un overlay adjuntando los servicios necesarios
  #mountOverlay(OverlayClass, context) {
    const overlay = new OverlayClass();
    overlay.attach({
      renderer:      this.renderer,
      input:         this.input,
      mouse:         this.mouse,
      screenManager: this.screenManager,
    });
    overlay.enter(context);
    this._overlay = overlay;
  }

  #showLevelOverlay(levelNumber, onDone) {
    this.#mountOverlay(LevelScreen, {
      levelNumber,
      onDone: () => {
        this._overlay = null;
        onDone?.();
      },
    });
  }

  #showVictoryOverlay(nextLevelNumber, onContinue) {
    this.#mountOverlay(VictoryScreen, {
      nextLevelNumber,
      onContinue: () => {
        this._overlay = null;
        onContinue?.();
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
    if (result === "menu") window.location.href = "../../index.html";
  }

  // Tracks damage taken, enemies killed, and rooms cleared each frame
  #trackStats(room, prevHealth) {
    const dmgTaken = Math.max(0, prevHealth - this.player.health);
    this.stats.damageTaken += dmgTaken;
    if (dmgTaken > 0) this.hud.triggerDamageFlash();

    // Reset counters when the player enters a new room
    if (room !== this._prevRoom) {
      this._prevRoom = room;
      this._deadEnemies = new Set();
      this._roomCounted = false;
    }

    for (const enemy of room?.enemies ?? []) {
      if (enemy.isDead && !this._deadEnemies.has(enemy)) {
        this._deadEnemies.add(enemy);
        this.stats.enemiesKilled++;
      }
    }

    if (room?.isCleared && !this._roomCounted && this._deadEnemies.size > 0) {
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
    const finalStats = {
      status,
      ...this.stats,
      damageDealt: this.player.totalDamageDealt,
      creditsEarned: this.player.credits,
      cardsCollected: [
        ...this.cardManager.activeSlots,
        ...this.cardManager.autoSlots,
      ].filter(Boolean).length,
    };
    this.screenManager.changeTo(new DefeatScreen(), {
      runId: this.runId,
      runPromise: this._runPromise,
      ...finalStats,
    });
  }

  // Draws a dark banner at the bottom with a message and a hint to continue
  #drawNotification(renderer, message) {
    renderer.drawRect(0, ROOM_HEIGHT - 40, ROOM_WIDTH, 40, "rgba(0,0,0,0.85)");
    renderer.drawText(
      message,
      ROOM_WIDTH / 2,
      ROOM_HEIGHT - 24,
      "9px monospace",
      "#ffffff",
      { align: "center" },
    );
    renderer.drawText(
      "Press ENTER to continue",
      ROOM_WIDTH / 2,
      ROOM_HEIGHT - 10,
      "6px monospace",
      "#888888",
      { align: "center" },
    );
  }
}