const ShopItems = [

    {
        id: "health_upgrade",

        name: "Health Upgrade",

        cost: 40,

        description: "+25 Max HP",

        apply(player) {

            player.maxHealth += 25;
            player.health += 25;
        }
    },

    {
        id: "speed_upgrade",

        name: "Speed Upgrade",

        cost: 35,

        description: "+15 Speed",

        apply(player) {

            player.speed += 15;
        }
    },

    {
        id: "damage_upgrade",

        name: "Damage Upgrade",

        cost: 50,

        description: "+20% Damage",

        apply(player) {

            if (!player.damageMultiplier) {

                player.damageMultiplier = 1;
            }

            player.damageMultiplier += 0.2;
        }
    }
];

export default ShopItems;