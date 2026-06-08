// Room Game Size
export const TILE_SIZE = 16; // Size of one tile in pixels
export const ROOM_COLS = 17; // Total columns in a room
export const ROOM_ROWS = 11; // Total rows in a room
export const ROOM_WIDTH = TILE_SIZE * ROOM_COLS; // Total room width in pixeles
export const ROOM_HEIGHT = TILE_SIZE * ROOM_ROWS; // Total room height in pixels

// Directions Room
export const DIRECTIONS = [
  { dx: 1, dy: 0 }, // East  (right)
  { dx: -1, dy: 0 }, // West  (left)
  { dx: 0, dy: 1 }, // South (down)
  { dx: 0, dy: -1 }, // North (up)
];

// Room Probability Weights
export const ROOM_WEIGHTS = {
  combat: 1,       // % chance for combat room
  chest: 1,        // % chance for chest room
  shrine: 95,        // % chance for shrine room (portal — rarest)
  glitch: 1,       // % chance for glitch room
  shop: 1,         // % chance for store room
  mrBombastic: 1,   // 1/100 — sala secreta de Mr. Bombastic
};

// Room Configs
export const MIN_ENEMIES = 2;
export const MAX_ENEMIES = 8;

// Graph Generation
export const GENERATION = {
  MIN_ROOMS: 20, // Min rooms in a map
  MAX_ROOMS: 30, // Max rooms in a map
  CONNECTION_CHANCE: 0.3, // % chance to connect with nearby rooms
};

// Minimap UI Config
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
    mrBombastic: "#1e1e1e",
    connection: "#ffffff",
  },
  lineWidth: 3,
};
