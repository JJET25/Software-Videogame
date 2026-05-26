import {
    quickStrike, ironFist, novaBurst, shadowBlade,
    healPulse, bloodSiphon, mendingWave, phoenixElixir,
    woodShield, stoneWall, mirrorGuard, diamondFortress,
    lifetap, ironSkin, rebound, berserkerRush, lastStand, chainKill,
} from '../cards/CardCatalog.js';

// Pool of cards that can appear in the shop — each entry pairs a factory with a credit cost
export const SHOP_CARD_POOL = [
    { factory: quickStrike,     cost: 30  },
    { factory: ironFist,        cost: 60  },
    { factory: novaBurst,       cost: 100 },
    { factory: shadowBlade,     cost: 150 },
    { factory: healPulse,       cost: 25  },
    { factory: bloodSiphon,     cost: 70  },
    { factory: mendingWave,     cost: 90  },
    { factory: phoenixElixir,   cost: 160 },
    { factory: woodShield,      cost: 25  },
    { factory: stoneWall,       cost: 65  },
    { factory: mirrorGuard,     cost: 95  },
    { factory: diamondFortress, cost: 145 },
    { factory: lifetap,         cost: 40  },
    { factory: ironSkin,        cost: 40  },
    { factory: rebound,         cost: 80  },
    { factory: berserkerRush,   cost: 80  },
    { factory: lastStand,       cost: 110 },
    { factory: chainKill,       cost: 110 },
];

// Credits returned when selling a card — keyed by rarity
export const SELL_VALUE = {
    common:    15,
    rare:      35,
    epic:      65,
    legendary: 120,
};

// Escalating costs to unlock additional active card slots — index 0 means upgrading from 3 to 4
export const ACTIVE_SLOT_UPGRADE_COSTS = [60, 120];

// Escalating costs to unlock additional auto card slots — index 0 means upgrading from 4 to 5
export const AUTO_SLOT_UPGRADE_COSTS = [50, 80, 120, 160];
