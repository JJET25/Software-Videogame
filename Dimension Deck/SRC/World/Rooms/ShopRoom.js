import Room from "./Room.js";

import Merchant from "../../Objects/Merchant.js";

export default class ShopRoom extends Room {

    constructor(
        doorDirections,
        player,
        bullets,
        credits
    ) {

        super(
            doorDirections,
            player,
            bullets,
            credits
        );

        this.isShopRoom = true;

        this.isCleared = true;

        this.color = "#33ccff";

        this.merchant =
            new Merchant({

                x: 400,
                y: 250
            });
    }

    update(deltaTime) {

    }

    render(renderer) {

        super.render(renderer);

        this.merchant.render(renderer);
    }
}