import InputManager from "./InputManager.js";
import MouseManager from "./MouseManager.js";
import Renderer from "./Renderer.js";
import ScreenManager from "../Systems/ScreenManager.js";
import GameplayScreen from "../Scenes/GameplayScreen.js";

import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import MiniMap from "../UI/Minimap.js";

import CardManager  from "../Cards/CardManager.js";
import { createCard, STARTER_CARDS } from "../Cards/CardFactory.js";
import { fetchCards } from "../Utils/Api.js";

import SeededRandom from "../Utils/SeededRandom.js";

import DimensionManager from "../Systems/DimensionManager.js";
import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {
  constructor(canvas) {
    this.lastTime = 0;

    this.renderer = new Renderer(canvas);
    this.input = new InputManager();
    this.mouse = new MouseManager(canvas);

    this.renderer.resize();
    this.renderer.setupResizeListener();

    this.screens = new ScreenManager({
      renderer: this.renderer,
      input: this.input,
      mouse: this.mouse,
    });

    this.screens.changeTo(new GameplayScreen());

    this.start();
  }
        this.renderer.resize();

        this.renderer.setupResizeListener();
    }

    initEntities() {
        this.player = new Player(
            new Vector(0, 0),
            this.input,
            this.mouse
        );

        this.player.cardManager =
            this.cardManager;

        // Always read enemies from the current room so QuickStrike targets
        // room enemies instead of a stale hardcoded array
        this.player.getEnemies = () =>
            this.dimManager?.getRoomManager()?.currentRoom?.enemies ?? [];

        // Starter cards are loaded from the API in loadStarterCards()
        this.loadStarterCards();
    }

    initWorld() {

        const rng = new SeededRandom();

        this.dimManager = new DimensionManager(
            rng,
            this.player,
            () => this.onVictory()
        );

        this.dimManager.startRun();

        // Minimap
        this.minimap = new MiniMap(
            this.dimManager
        );
    }

    async loadStarterCards() {
        try {
            const allCards = await fetchCards();
            for (const name of STARTER_CARDS) {
                const data = allCards.find(c => c.card_name === name);
                if (data) this.cardManager.addCard(createCard(data));
            }
        } catch (err) {
            console.warn('Could not load cards from API, using defaults:', err.message);
            // Fallback: instantiate with hardcoded defaults so game is never broken
            const { default: QuickStrike } = await import('../Cards/QuickStrike.js');
            const { default: HealPulse }   = await import('../Cards/HealPulse.js');
            const { default: WoodShield }  = await import('../Cards/WoodShield.js');
            this.cardManager.addCard(new QuickStrike());
            this.cardManager.addCard(new HealPulse());
            this.cardManager.addCard(new WoodShield());
        }
    }

  start() {
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    this.screens.update(deltaTime);
    this.screens.draw(this.renderer);
    this.input.update();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
}
