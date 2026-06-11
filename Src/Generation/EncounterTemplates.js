// EncounterTemplates.js — Predefined enemy group compositions used to populate combat rooms.
// Each template specifies how many swarm, tank, and ranged enemies to spawn.

// Six swarm enemies, no tanks or ranged.
const THE_SWARM = {
  name: "the_swarm",
  swarm: 6,
  tank: 0,
  ranged: 0,
};

// Balanced mix of swarm, one tank, and one ranged enemy.
const THE_SIEGE = {
  name: "the_siege",
  swarm: 2,
  tank: 1,
  ranged: 1,
};

// Two swarm enemies and three ranged enemies.
const SNIPER_NEST = {
  name: "sniper_nest",
  swarm: 2,
  tank: 0,
  ranged: 3,
};

// One swarm enemy and two tanks.
const THE_BRUTE = {
  name: "the_brute",
  swarm: 1,
  tank: 2,
  ranged: 0,
};

// One tank and three ranged enemies, no swarm.
const CROSSFIRE = {
  name: "crossfire",
  swarm: 0,
  tank: 1,
  ranged: 3,
};

// One swarm, one tank, and two ranged enemies.
const ELITE_GUARD = {
  name: "elite_guard",
  swarm: 1,
  tank: 1,
  ranged: 2,
};

// Exported array consumed by CombatRoom to randomly pick one template per room.
export const ENCOUNTER_TEMPLATES = [
  THE_SWARM,
  THE_SIEGE,
  SNIPER_NEST,
  THE_BRUTE,
  CROSSFIRE,
  ELITE_GUARD,
];
