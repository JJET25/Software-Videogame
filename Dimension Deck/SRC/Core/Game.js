import Player from "../Entities/Player.js";

import Enemy from "../Entities/Enemy.js";

import Vector from "../Utils/Vector.js";

import InputManager from "./InputManager.js";
import MouseManager from "./MouseManager.js";
import Renderer from "./Renderer.js";

import HUD from "../UI/HUD.js";
import DeckScreen from "../UI/DeckScreen.js";
import MiniMap from "../UI/Minimap.js";

import CardManager from "../Cards/CardManager.js";
import QuickStrike from "../Cards/QuickStrike.js";
import HealPulse   from "../Cards/HealPulse.js";
import WoodShield  from "../Cards/WoodShield.js";

import SeededRandom from "../Utils/SeededRandom.js";

import DimensionManager from "../Systems/DimensionManager.js";
import InteractionManager from "../Systems/InteractionManager.js";

export default class Game {

    constructor(canvas) {

        this.lastTime = 0;

        this.initManagers(canvas);

        this.initEntities();

        this.initWorld();

        this.start();
    }

    initManagers(canvas) {

        this.renderer = new Renderer(canvas);

        this.input = new InputManager();

        this.mouse = new MouseManager(canvas);

        this.interaction = new InteractionManager(
            this.input
        );

        this.cardManager = new CardManager();

        this.hud = new HUD();

        this.deckScreen = new DeckScreen();

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

        // Starter cards
        this.cardManager.addCard(new QuickStrike());
        this.cardManager.addCard(new HealPulse());
        this.cardManager.addCard(new WoodShield());
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

    start() {

        requestAnimationFrame(
            (ts) => this.gameLoop(ts)
        );
    }

    gameLoop(timestamp) {

        const deltaTime = Math.min(
            (timestamp - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = timestamp;

        this.update(deltaTime);

        this.render();

        this.input.update();

        requestAnimationFrame(
            (ts) => this.gameLoop(ts)
        );
    }

    update(deltaTime) {

        const prevHealth =
            this.player.health;

        // Player
        this.player.update(deltaTime);

        // Cards
        this.cardManager.update(deltaTime);

        // Rooms + enemies + bullets (all managed by RoomManager → Room)
        this.dimManager.getRoomManager().update(deltaTime);

        // HUD flash
        if (
            this.player.health <
            prevHealth
        ) {

            this.hud.triggerDamageFlash();
        }

        this.hud.update(deltaTime);

        this.deckScreen.update(
            this.input
        );

    }

    render() {
        this.renderer.clear();

        // Room walls + enemies + doors + bullets
        this.dimManager.getRoomManager().draw(this.renderer);

        // Player (drawn on top of room contents)
        this.player.draw(this.renderer);

        // Draw minimap
        this.minimap.draw(
            this.renderer
        );

        // Draw HUD
        this.hud.draw(
            this.renderer,
            this.player,
            this.cardManager
        );

        // Draw deck screen
        this.deckScreen.draw(
            this.renderer,
            this.cardManager
        );
    }

    onVictory() {

        console.log(
            "Victory! Run completed"
        );
    }
}
