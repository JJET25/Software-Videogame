const img = new Image();
img.src = "../../Assets/Sprites/tiles/tilesDungeon.png";

export const OBJECTS_IMAGE = img;

export const OBJECTS_SPRITE = {
  rock_1: { srcX: 0, srcY: 64, srcW: 16, srcH: 16 },
  rock_2: { srcX: 16, srcY: 64, srcW: 16, srcH: 16 },
  rock_3: { srcX: 32, srcY: 64, srcW: 16, srcH: 16 },

  box_1_ore: { srcX: 64, srcY: 64, srcW: 16, srcH: 16 },
  box_2_ore: { srcX: 64, srcY: 80, srcW: 16, srcH: 16 },

  box_1_silver: { srcX: 48, srcY: 64, srcW: 16, srcH: 16 },
  box_2_silver: { srcX: 48, srcY: 80, srcW: 16, srcH: 16 },

  box_1_wood: { srcX: 80, srcY: 64, srcW: 16, srcH: 16 },
  box_2_wood: { srcX: 80, srcY: 80, srcW: 16, srcH: 16 },

  spike_1: { srcX: 0, srcY: 112, srcW: 16, srcH: 16 },
  spike_2: { srcX: 16, srcY: 109, srcW: 16, srcH: 19 },

  chestClosed: { srcX: 16, srcY: 80, srcW: 16, srcH: 16 },
  chestOpen: { srcX: 16, srcY: 80, srcW: 16, srcH: 16 },
};
