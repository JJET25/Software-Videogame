import SpriteSheet from "../../../Animation/SpriteSheet.js";
import SwarmEnemy from "../archetypes/SwarmEnemy.js";

const SPRITE = "../../Assets/Sprites/enemies/rat/GreyRat_SpriteSheet.png";

// Row 0 = right, Row 1 = left
// Col 0: idle (1 frame)  Cols 1-3: breathe (3 frames)  Cols 4-6: attack (3 frames)
const ANIMATIONS = {
  right: {
    idle:   new SpriteSheet({ src: SPRITE, frameWidth: 20, frameHeight: 20, frameCount: 3, row: 0, startCol: 1 }),
    attack: new SpriteSheet({ src: SPRITE, frameWidth: 20, frameHeight: 20, frameCount: 3, row: 0, startCol: 4 }),
  },
  left: {
    idle:   new SpriteSheet({ src: SPRITE, frameWidth: 20, frameHeight: 20, frameCount: 3, row: 1, startCol: 1 }),
    attack: new SpriteSheet({ src: SPRITE, frameWidth: 20, frameHeight: 20, frameCount: 3, row: 1, startCol: 4 }),
  },
};

export default class DesertRat extends SwarmEnemy {
  constructor(position, deps) {
    super(position, deps, ANIMATIONS);
  }
}
