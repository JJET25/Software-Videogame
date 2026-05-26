import Screen from './Screen.js';
import DefeatScreen from './DefeatScreen.js';

import Player from '../Entities/Player.js';
import Vector from '../Utils/Vector.js';

import CardManager from '../cards/CardManager.js';
import { STARTER_DECK } from '../cards/CardCatalog.js';

import HUD from '../UI/HUD.js';
import DeckScreen from '../UI/DeckScreen.js';
import MiniMap from '../UI/Minimap.js';

import DimensionManager from '../Systems/DimensionManager.js';
import InteractionManager from '../Systems/InteractionManager.js';
import SeededRandom from '../Utils/SeededRandom.js';

// Main gameplay screen — initializes all game systems and delegates update and draw each frame
export default class GameplayScreen extends Screen {
    enter(context = {}) {
        this.cardManager = new CardManager();
        this.hud         = new HUD();
        this.deckScreen  = new DeckScreen();
        this.interaction = new InteractionManager(this.input);

        this.player             = new Player(new Vector(0, 0), this.input, this.mouse);
        this.player.cardManager = this.cardManager;
        this.player.getEnemies  = () =>
            this.dimManager?.getRoomManager()?.currentRoom?.enemies ?? [];

        for (const create of STARTER_DECK) {
            this.cardManager.addCard(create());
        }

        const rng       = new SeededRandom();
        this.dimManager = new DimensionManager(rng, this.player, () => this.onVictory());
        this.dimManager.startRun();

        this.minimap = new MiniMap(this.dimManager);
    }

    exit() {}

    update(deltaTime) {
        if (this.player.isDead) {
            this.screenManager.changeTo(new DefeatScreen());
            return;
        }

        const rm       = this.dimManager.getRoomManager();
        const room     = rm.currentRoom;
        const shopOpen = room?.isShopRoom && room.storeUI.isOpen;

        // Freeze player movement and card use while the shop overlay is visible
        const prevHealth = this.player.health;
        if (!shopOpen) this.player.update(deltaTime);

        this.cardManager.update(deltaTime);
        rm.update(deltaTime);

        if (this.player.health < prevHealth) this.hud.triggerDamageFlash();

        this.hud.update(deltaTime);

        if (!shopOpen) this.deckScreen.update(this.input);

        // Merchant interaction and store input handled only in shop rooms
        if (room?.isShopRoom) {
            if (!shopOpen) this.interaction.update(this.player, [room.merchant]);
            room.storeUI.update(this.input, this.player, this.cardManager);
        }
    }

    draw(renderer) {
        renderer.clear();
        this.dimManager.getRoomManager().draw(renderer);
        this.player.draw(renderer);
        this.minimap.draw(renderer);
        this.hud.draw(renderer, this.player, this.cardManager);
        this.deckScreen.draw(renderer, this.cardManager);

        // Draw the store overlay on top of everything else when in a shop room
        const room = this.dimManager.getRoomManager().currentRoom;
        if (room?.isShopRoom && room.storeUI.isOpen) {
            room.storeUI.draw(renderer, this.player, this.cardManager);
        }
    }

    onVictory() {
        console.log('Victory!');
    }
}
