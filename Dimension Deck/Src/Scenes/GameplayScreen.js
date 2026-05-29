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

import DimensionManager from "../Systems/DimensionManager.js";
import InteractionManager from "../Systems/InteractionManager.js";

import {
  createRun,
  endRun,
  fetchStarterCards,
  fetchAllCards,
} from "../Utils/Api.js";

// Main gameplay screen — initializes all game systems and delegates update and draw each frame
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

    // Run and stat tracking
    this.runId = null;
    this._runEnded = false;
    this.stats = { roomsCleared: 0, enemiesKilled: 0, damageTaken: 0 };
    this._prevRoom = null;
    this._deadEnemies = new Set();
    this._roomCounted = false;
    this.cardCatalog = [];

    window.testingMode = false;

    // Load starter cards from DB (stats come from DB); fall back to hardcoded if API is down
    this._loadStarterCards();
  }

  async _loadStarterCards() {
    try {
      const [runData, dbCards, allCards] = await Promise.all([
        createRun(),
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
    if (this.player.isDead && !this._runEnded) {
      this._finishRun("defeat");
      return;
    }

    const rm = this.dimManager.getRoomManager();
    const room = rm.currentRoom;
    const shopOpen = room?.isShopRoom && room.storeUI?.isOpen;

    if (this.input.isKeyDown("SHIFT") && this.input.wasKeyPressed("T")) {
      window.testingMode = !window.testingMode;
    }

    // DeckScreen runs first so it can consume clicks before the player does
    if (!shopOpen)
      this.deckScreen.update(this.input, this.mouse, this.cardManager);

    const prevHealth = this.player.health;
    if (!shopOpen && !this.deckScreen.isOpen) this.player.update(deltaTime);

    this.cardManager.update(deltaTime);
    rm.update(deltaTime);

    // Stat: damage taken
    const dmgTaken = Math.max(0, prevHealth - this.player.health);
    this.stats.damageTaken += dmgTaken;
    if (dmgTaken > 0) this.hud.triggerDamageFlash();

    // Stat: track per-room enemies and clear count; reset when entering a new room
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

    this.hud.update(deltaTime);

    const interactables = room?.getInteractables?.() ?? [];
    if (interactables.length > 0 && !shopOpen) {
      this.interaction.update(this.player, interactables, {
        cardManager: this.cardManager,
        cardCatalog: this.cardCatalog,
      });
    }

    if (room?.isShopRoom) {
      room.storeUI?.update(this.input, this.player, this.cardManager);
    }
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
  }

  _finishRun(status) {
    this._runEnded = true;
    const finalStats = {
      status,
      ...this.stats,
      creditsEarned: this.player.credits,
      cardsCollected: [
        ...this.cardManager.activeSlots,
        ...this.cardManager.autoSlots,
      ].filter(Boolean).length,
    };
    this.screenManager.changeTo(new DefeatScreen(), {
      runId: this.runId,
      ...finalStats,
    });
  }

  onVictory() {
    if (!this._runEnded) this._finishRun("victory");
  }
}
