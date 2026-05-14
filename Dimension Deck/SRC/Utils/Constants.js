// Room Game Size
export const TILE_SIZE = 32;
export const ROOM_COLS = 15;
export const ROOM_ROWS = 11;
export const ROOM_WIDTH = TILE_SIZE * ROOM_COLS;
export const ROOM_HEIGHT = TILE_SIZE * ROOM_ROWS;

// Directions Room
export const DIRECTIONS = [
    { dx:  1, dy:  0 },  // East
    { dx: -1, dy:  0 },  // West
    { dx:  0, dy:  1 },  // South
    { dx:  0, dy: -1 },  // North
];

// Room Probability Weights
export const ROOM_WEIGHTS = {
    combat: 50,
    chest: 25,
    shrine: 15,
    glitch: 10
}