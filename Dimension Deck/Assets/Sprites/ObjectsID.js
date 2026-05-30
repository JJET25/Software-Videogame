const img = new Image();
img.src = "../../Assets/Sprites/tiles/tilesDungeon.png";

export const OBJECTS_IMAGE = img;

export const OBJECTS_SPRITE = {
  rock_1: { srcX: 0, srcY: 64, srcW: 16, srcH: 16 },
  rock_2: { srcX: 16, srcY: 64, srcW: 16, srcH: 16 },
  rock_3: { srcX: 32, srcY: 64, srcW: 16, srcH: 16 },

  box_1_ore: { srcX: null, srcY: null, srcW: null, srcH: null },
  box_2_ore: { srcX: null, srcY: null, srcW: null, srcH: null },

  box_1_silver: { srcX: null, srcY: null, srcW: null, srcH: null },
  box_2_silver: { srcX: null, srcY: null, srcW: null, srcH: null },

  box_1_wood: { srcX: null, srcY: null, srcW: null, srcH: null },
  box_2_wood: { srcX: null, srcY: null, srcW: null, srcH: null },

  spike_1: { srcX: 0, srcY: 112, srcW: 16, srcH: 16 },
  spike_2: { srcX: 16, srcY: 109, srcW: 16, srcH: 19 },

  chest: { srcX: null, srcY: null, srcW: null, srcH: null },
};
