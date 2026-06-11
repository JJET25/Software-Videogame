// Constants.js — Shared game configuration values for room dimensions, generation, and UI layout.

// Base tile size and room grid dimensions in pixels.
export const TILE_SIZE = 16;
export const ROOM_COLS = 17;
export const ROOM_ROWS = 11;
export const ROOM_WIDTH = TILE_SIZE * ROOM_COLS;
export const ROOM_HEIGHT = TILE_SIZE * ROOM_ROWS;

// Cardinal direction vectors used for adjacency checks and movement.
export const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

// Weighted probability table for procedural room type selection.
export const ROOM_WEIGHTS = {
  combat: 57,
  chest: 20,
  shrine: 2,
  glitch: 10,
  shop: 10,
  mrBombastic: 1,
};

// Enemy count bounds for a single combat room.
export const MIN_ENEMIES = 2;
export const MAX_ENEMIES = 8;

// Map generation parameters controlling room count and connection density.
export const GENERATION = {
  MIN_ROOMS: 20,
  MAX_ROOMS: 30,
  CONNECTION_CHANCE: 0.3,
};

// Minimap rendering configuration including anchor position, cell size, and color palette.
export const MINIMAP_CONFIG = {
  anchorX: TILE_SIZE * (ROOM_COLS - 1) + TILE_SIZE / 2,
  anchorY: TILE_SIZE * (ROOM_ROWS - 1) + TILE_SIZE / 2,

  roomSize: 4,
  gap: 2,

  colors: {
    undiscovered: "#1e1e1e",
    visited: "#4a4a8a",
    current: "#7b7bff",
    boss: "#c20c0c",
    shop: "#FFD700",
    mrBombastic: "#C0C0C0",
    connection: "#ffffff",
  },
  lineWidth: 3,
};
