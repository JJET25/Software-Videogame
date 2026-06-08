import SpriteSheet from "../../../Animation/SpriteSheet.js";
import SwarmEnemy from "../archetypes/SwarmEnemy.js";

const SPRITE = "../../Assets/Sprites/enemies/rat/BrownRat_SpriteSheet.png";

const ANIMATIONS = {
  left: {
    idle: new SpriteSheet({
      src: SPRITE,
      frameWidth: 20,
      frameHeight: 20,
      frameCount: 4,
      row: 0,
      startCol: 0,
    }),
    walk: new SpriteSheet({
      src: SPRITE,
      frameWidth: 20,
      frameHeight: 20,
      frameCount: 3,
      row: 0,
      startCol: 4,
    }),
  },
  right: {
    idle: new SpriteSheet({
      src: SPRITE,
      frameWidth: 20,
      frameHeight: 20,
      frameCount: 4,
      row: 1,
      startCol: 0,
    }),
    walk: new SpriteSheet({
      src: SPRITE,
      frameWidth: 20,
      frameHeight: 20,
      frameCount: 3,
      row: 1,
      startCol: 4,
    }),
  },
};

export default class DungeonRat extends SwarmEnemy {
  constructor(position, deps) {
    super(position, deps, ANIMATIONS);
  }
}
