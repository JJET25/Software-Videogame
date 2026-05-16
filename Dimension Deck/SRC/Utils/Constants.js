// Room Game Size
export const TILE_SIZE = 32;                        // Size of one tile in pixels
export const ROOM_COLS = 15;                        // Total columns in a room
export const ROOM_ROWS = 11;                        // Total rows in a room
export const ROOM_WIDTH = TILE_SIZE * ROOM_COLS;    // Total room width in pixeles
export const ROOM_HEIGHT = TILE_SIZE * ROOM_ROWS;   // Total room height in pixels

// Directions Room
export const DIRECTIONS = [
    { dx:  1, dy:  0 },  // East  (right)
    { dx: -1, dy:  0 },  // West  (left)
    { dx:  0, dy:  1 },  // South (down)
    { dx:  0, dy: -1 },  // North (up)
];

// Room Probability Weights
export const ROOM_WEIGHTS = {
    combat: 50,     // % chance for combat room
    chest: 25,      // % chance for chest room
    shrine: 15,     // % chance for shrine room
    glitch: 10      // % chance for glitch room
    // Store room??
}

// Graph Generation
export const GENERATION = {
    MIN_ROOMS: 20,              // Min rooms in a map
    MAX_ROOMS: 30,              // Max rooms in a map
    CONNECTION_CHANCE: 0.4      // % chance to connect with nearby rooms
}

// Player movement between rooms
// Converts a direction to its opposite side (rooms transitions)
export const OPPOSITE = { north: 'south', south: 'north', east: 'west', west: 'east' };
