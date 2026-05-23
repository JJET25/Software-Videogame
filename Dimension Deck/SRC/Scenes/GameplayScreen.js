import Screen from "../Scenes/Screen.js";
import DefeatScreen from "./DefeatScreen.js";

import Player from "../Entities/Player.js";
import Vector from "../Utils/Vector.js";

import CardManager from "../Cards/CardManager.js";
import { STARTER_DECK } from "../Cards/CardCatalog.js";

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

    // CARDS
    for (const create of STARTER_DECK) {
      this.cardManager.addCard(create());
    }

    // WORLD
    const rng = new SeededRandom();
    this.dimManager = new DimensionManager(rng, this.player, () =>
      this.onVictory(),
    );
    this.dimManager.startRun();

    // MINIMAP
    this.minimap = new MiniMap(this.dimManager);
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
