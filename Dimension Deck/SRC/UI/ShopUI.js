import ShopItems from "../Data/ShopItems.js";

export default class ShopUI {

    constructor(player) {

        this.player = player;

        this.isOpen = false;

        this.selectedIndex = 0;
    }

    toggle() {

        this.isOpen = !this.isOpen;
    }

    buySelected() {

        const item =
            ShopItems[this.selectedIndex];

        if (
            this.player.credits >= item.cost
        ) {

            this.player.credits -= item.cost;

            item.apply(this.player);
        }
    }

    nextItem() {

        this.selectedIndex++;

        if (
            this.selectedIndex >=
            ShopItems.length
        ) {

            this.selectedIndex = 0;
        }
    }

    previousItem() {

        this.selectedIndex--;

        if (this.selectedIndex < 0) {

            this.selectedIndex =
                ShopItems.length - 1;
        }
    }

    render(ctx) {

        if (!this.isOpen) return;

        ctx.fillStyle =
            "rgba(0,0,0,0.85)";

        ctx.fillRect(
            180,
            120,
            500,
            320
        );

        ctx.fillStyle = "white";

        ctx.font = "28px Arial";

        ctx.fillText(
            "SHOP",
            380,
            160
        );

        ctx.font = "20px Arial";

        ctx.fillText(
            "Credits: " +
            this.player.credits,
            220,
            200
        );

        let y = 250;

        ShopItems.forEach(
            (item, index) => {

                ctx.fillStyle =
                    index === this.selectedIndex
                    ? "yellow"
                    : "white";

                ctx.fillText(

                    item.name +
                    " - " +
                    item.cost,

                    240,
                    y
                );

                ctx.fillStyle = "gray";

                ctx.fillText(
                    item.description,
                    450,
                    y
                );

                y += 45;
            }
        );

        ctx.fillStyle = "white";

        ctx.fillText(
            "[E] Buy",
            240,
            390
        );

        ctx.fillText(
            "[W/S] Navigate",
            380,
            390
        );
    }
}