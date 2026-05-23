import { Rarity } from './Card.js';
import { Trigger } from './AutomaticCard.js';
import AutomaticCard from './AutomaticCard.js';

import ActiveMeleeCard   from './ActiveMeleeCard.js';
import ActiveHealCard    from './ActiveHealCard.js';
import ActiveDefenseCard from './ActiveDefenseCard.js';
import ActiveDrainCard   from './ActiveDrainCard.js';


// Active Cards

// Damage Cards
// Quick Strike
export const quickStrike = () => new ActiveMeleeCard({
    name:        'Quick Strike',
    description: 'Deal 20 damage to enemies within 120px.',
    rarity:      Rarity.COMMON,
    damage:      1000,
    range:       120,
    cooldown:    3,
    spread:      Math.PI * 0.2,
});

// Iron Fist
export const ironFist = () => new ActiveMeleeCard({
    name:        'Iron Fist',
    description: 'A powerful close-range blow dealing 55 damage within 90px.',
    rarity:      Rarity.RARE,
    damage:      55,
    range:       90,
    cooldown:    5,
    spread:      Math.PI * 0.35,  // 63° — golpe concentrado, cono angosto
});

// Nove Burst
export const novaBurst = () => new ActiveMeleeCard({
    name:        'Nova Burst',
    description: 'Unleash an explosion dealing 110 damage to all enemies within 200px.',
    rarity:      Rarity.EPIC,
    damage:      110,
    range:       200,
    cooldown:    9,
    spread:      Math.PI * 1.0,
});

// Shadow Blade
export const shadowBlade = () => new ActiveMeleeCard({
    name:        'Shadow Blade',
    description: 'A devastating strike dealing 180 damage to enemies within 160px.',
    rarity:      Rarity.LEGENDARY,
    damage:      180,
    range:       160,
    cooldown:    15,
    spread:      Math.PI * 0.75,
});

// Heal Cards
// Heal Pulse
export const healPulse = () => new ActiveHealCard({
    name:        'Heal Pulse',
    description: 'Restore 25 HP.',
    rarity:      Rarity.COMMON,
    healAmount:  25,
    cooldown:    10,
});

// Blood Siphon
export const bloodSiphon = () => new ActiveDrainCard({
    name:        'Blood Siphon',
    description: 'Drain the nearest enemy for 40 damage and restore 20 HP.',
    rarity:      Rarity.RARE,
    damage:      40,
    healAmount:  20,
    cooldown:    12,
});

// Mending Wave
export const mendingWave = () => new ActiveHealCard({
    name:        'Mending Wave',
    description: 'Release a healing wave that restores 70 HP.',
    rarity:      Rarity.EPIC,
    healAmount:  70,
    cooldown:    15,
});

// Phoenix Elixir
export const phoenixElixir = () => new ActiveHealCard({
    name:        'Phoenix Elixir',
    description: 'Consume a legendary elixir to fully restore all HP.',
    rarity:      Rarity.LEGENDARY,
    healAmount:  null,
    cooldown:    30,
});

// Defense Cards
// Wood Shield
export const woodShield = () => new ActiveDefenseCard({
    name:         'Wood Shield',
    description:  'Absorb the next 20 damage.',
    rarity:       Rarity.COMMON,
    shieldAmount: 20,
    cooldown:     8,
});

// Stone Wall
export const stoneWall = () => new ActiveDefenseCard({
    name:         'Stone Wall',
    description:  'Erect a wall of stone that absorbs the next 50 damage.',
    rarity:       Rarity.RARE,
    shieldAmount: 50,
    cooldown:     12,
});

// Mirror Guard
export const mirrorGuard = () => new ActiveDefenseCard({
    name:         'Mirror Guard',
    description:  'Gain 35 shield and 1.5s of invincibility.',
    rarity:       Rarity.EPIC,
    shieldAmount: 35,
    cooldown:     14,
    invincibility: 1.5,
});

// Diamond Fortress
export const diamondFortress = () => new ActiveDefenseCard({
    name:         'Diamond Fortress',
    description:  'Crystallize your body, absorbing the next 100 damage.',
    rarity:       Rarity.LEGENDARY,
    shieldAmount: 100,
    cooldown:     18,
});

// Automic Cards

// Life Tap
export const lifetap = () => new AutomaticCard({
    name:        'Lifetap',
    description: 'Restore 20 HP each time you kill an enemy.',
    rarity:      Rarity.COMMON,
    trigger:     Trigger.ON_KILL,
    effect:      ({ player }) => player.heal(20),
});

// Iron Skin
export const ironSkin = () => new AutomaticCard({
    name:        'Iron Skin',
    description: 'Gain 8 shield each time you hit an enemy.',
    rarity:      Rarity.COMMON,
    trigger:     Trigger.ON_HIT,
    effect:      ({ player }) => { player.shield += 8; },
});

// Rebound
export const rebound = () => new AutomaticCard({
    name:        'Rebound',
    description: 'When hit, deal 15 damage to enemies within 150px.',
    rarity:      Rarity.RARE,
    trigger:     Trigger.ON_DAMAGE,
    effect:      ({ player, enemies }) => {
        if (!enemies?.length) return;
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            if (dx * dx + dy * dy <= 150 * 150) enemy.takeDamage(15);
        }
    },
});

// Berserker Rush
export const berserkerRush = () => new AutomaticCard({
    name:        'Berserker Rush',
    description: 'Dashing deals 20 damage to enemies within 100px.',
    rarity:      Rarity.RARE,
    trigger:     Trigger.ON_DASH,
    effect:      ({ player, enemies }) => {
        if (!enemies?.length) return;
        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            if (dx * dx + dy * dy <= 100 * 100) enemy.takeDamage(20);
        }
    },
});

// Last Stand
export const lastStand = () => new AutomaticCard({
    name:        'Last Stand',
    description: 'When hit below 30% HP, gain 2s of invincibility.',
    rarity:      Rarity.EPIC,
    trigger:     Trigger.ON_DAMAGE,
    effect:      ({ player }) => {
        if (player.health / player.maxHealth <= 0.30) {
            player.grantInvincibility(2);
        }
    },
});

// Chain Kill
export const chainKill = () => new AutomaticCard({
    name:        'Chain Kill',
    description: 'Killing an enemy deals 25 damage to all others within 200px.',
    rarity:      Rarity.EPIC,
    trigger:     Trigger.ON_KILL,
    effect:      ({ player, enemies, enemy: origin }) => {
        if (!enemies?.length) return;
        const ox = origin ? origin.position.x : player.position.x;
        const oy = origin ? origin.position.y : player.position.y;
        for (const enemy of enemies) {
            if (enemy.isDead || enemy === origin) continue;
            const dx = enemy.position.x - ox;
            const dy = enemy.position.y - oy;
            if (dx * dx + dy * dy <= 200 * 200) enemy.takeDamage(25);
        }
    },
});

// Starter Deck
export const STARTER_DECK = [quickStrike, healPulse, woodShield];
