import Screen from "../Scenes/Screen.js";
import DefeatScreen from "./DefeatScreen.js";

import Player from "../Entities/Player.js";
import Vector from "../Utils/Vector.js";

import CardManager from "../Cards/CardManager.js";
import QuickStrike from "../Cards/QuickStrike.js";
import HealPulse from "../Cards/HealPulse.js";
import WoodShield from "../Cards/WoodShield.js";
import { createCard, STARTER_CARDS } from "../Cards/CardFactory.js";
import { fetchCards } from "../Utils/Api.js";

import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import MiniMap from "../UI/Minimap.js";

import DimensionManager from "../Systems/DimensionManager.js";
import InteractionManager from "../Systems/InteractionManager.js";
import SeededRandom from "../Utils/SeededRandom.js";

export default class GameplayScreen extends Screen {
  enter(context = {}) {
    // MANAGERS
    this.cardManager = new CardManager();
    this.hud = new HUD();
    this.deckScreen = new DeckScreen();
    this.interaction = new InteractionManager(this.input);

    // PLAYER
    this.player = new Player(new Vector(0, 0), this.input, this.mouse);
    this.player.cardManager = this.cardManager; // instancia ✓

    // CALLBACK ENEMIES
    this.player.getEnemies = () =>
      this.dimManager?.getRoomManager()?.currentRoom?.enemies ?? [];

    // CARDS — cargadas desde el API; fallback a hardcoded si el backend no está
    this.loadStarterCards();

    // WORLD
    const rng = new SeededRandom();
    this.dimManager = new DimensionManager(rng, this.player, () =>
      this.onVictory(),
    );
    this.dimManager.startRun();

    // MINIMAP
    this.minimap = new MiniMap(this.dimManager);
  }

  async loadStarterCards() {
    try {
      const allCards = await fetchCards();
      for (const name of STARTER_CARDS) {
        const data = allCards.find((c) => c.card_name === name);
        if (data) this.cardManager.addCard(createCard(data));
      }
    } catch (err) {
      console.warn("No se pudo cargar cartas del API, usando defaults:", err.message);
      this.cardManager.addCard(new QuickStrike());
      this.cardManager.addCard(new HealPulse());
      this.cardManager.addCard(new WoodShield());
    }
  }

  exit() {}

  update(deltaTime) {
    // If player dead, screen move to defeat screen
    if (this.player.isDead) {
      this.screenManager.changeTo(new DefeatScreen());
      return;
    }

    const prevHealth = this.player.health;

    this.player.update(deltaTime);
    this.cardManager.update(deltaTime);
    this.dimManager.getRoomManager().update(deltaTime);

    if (this.player.health < prevHealth) {
      this.hud.triggerDamageFlash();
    }

    this.hud.update(deltaTime);
    this.deckScreen.update(this.input);
  }

  draw(renderer) {
    renderer.clear();
    this.dimManager.getRoomManager().draw(renderer);
    this.player.draw(renderer);
    this.minimap.draw(renderer);
    this.hud.draw(renderer, this.player, this.cardManager);
    this.deckScreen.draw(renderer, this.cardManager);
  }

  onVictory() {
    console.log("Victory!");
  }
}
