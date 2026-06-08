import Room from "./Room.js";
import MrBombastic from "../Objects/MrBombastic.js";
import { ROOM_WIDTH, ROOM_HEIGHT } from "../../Utils/Constants.js";

export default class BombasticRoom extends Room {
    constructor(doorDirections, player, bullets, credits, dimension) {
        super(doorDirections, player, bullets, credits, dimension);

        this.isBombasticRoom = true;
        this.isCleared = true;

        this.mrBombastic = new MrBombastic({
            x: ROOM_WIDTH  / 2 + 8,
            y: ROOM_HEIGHT / 2,
        });

        this.objects.push(this.mrBombastic);
    }

    populate() {
        this.buildDecorGrid();
    }

    getInteractables() {
        return this.mrBombastic ? [this.mrBombastic] : [];
    }

    draw(renderer) {
        super.draw(renderer);

        if (!this.mrBombastic.isDancing) {
            const dx = this.player.position.x - this.mrBombastic.position.x;
            const dy = this.player.position.y - this.mrBombastic.position.y;
            if (dx * dx + dy * dy <= 60 * 60) {
                renderer.drawText(
                    '[E] Talk',
                    this.mrBombastic.position.x,
                    this.mrBombastic.position.y - 16,  // 19/2 + margen
                    4,
                    '#ffffff',
                    { font: "'Press Start 2P', monospace" },
                );
            }
        }
    }
}
