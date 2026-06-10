import {
  TILE_SIZE,
  ROOM_COLS,
  ROOM_ROWS,
  ROOM_WIDTH,
  ROOM_HEIGHT,
} from "../../Utils/Constants.js";

const FRAME_W     = 48;
const FRAME_COUNT = 5;
const FRAME_OPEN  = 0;
const FRAME_CLOSED = FRAME_COUNT - 1;
const ANIM_FPS    = 10;

const FRAME_H  = { tilesDarkAge: 35, tilesOldWest: 37 };
const Y_OFFSET = { tilesDarkAge: 0,  tilesOldWest: 1 };
const IMG_SRC = {
  tilesDarkAge: "../../Assets/Sprites/room/doors-dungeon.png",
  tilesOldWest: "../../Assets/Sprites/room/doors-oldwest.png",
};

const _imgs = {};
function getImg(tileSetId) {
  if (!_imgs[tileSetId]) {
    const img = new Image();
    img.src = IMG_SRC[tileSetId] ?? IMG_SRC.tilesDarkAge;
    _imgs[tileSetId] = img;
  }
  return _imgs[tileSetId];
}

function centerPos(direction) {
  const midCol = Math.floor(ROOM_COLS / 2);
  const midRow = Math.floor(ROOM_ROWS / 2);
  switch (direction) {
    case "north": return { x: midCol * TILE_SIZE + TILE_SIZE / 2, y: TILE_SIZE };
    case "south": return { x: midCol * TILE_SIZE + TILE_SIZE / 2, y: ROOM_HEIGHT - TILE_SIZE };
    case "east":  return { x: ROOM_WIDTH  - TILE_SIZE, y: midRow * TILE_SIZE + TILE_SIZE / 2 };
    case "west":  return { x: TILE_SIZE,               y: midRow * TILE_SIZE + TILE_SIZE / 2 };
  }
}

export default class DoorVisual {
  constructor(direction, tileSetId) {
    this._direction = direction;
    this._img       = getImg(tileSetId);
    this._fh        = FRAME_H[tileSetId] ?? 35;
    this._frame     = FRAME_CLOSED;
    this._target    = FRAME_CLOSED;
    this._elapsed   = 0;
    this._pos       = centerPos(direction);
    this._pos.y    += Y_OFFSET[tileSetId] ?? 0;
  }

  open(instant = false) {
    this._target = FRAME_OPEN;
    if (instant) this._frame = FRAME_OPEN;
  }

  close(instant = false) {
    this._target = FRAME_CLOSED;
    if (instant) this._frame = FRAME_CLOSED;
  }

  update(deltaTime) {
    if (this._frame === this._target) return;
    this._elapsed += deltaTime;
    if (this._elapsed >= 1 / ANIM_FPS) {
      this._elapsed = 0;
      this._frame += this._frame < this._target ? 1 : -1;
    }
  }

  draw(renderer) {
    if (!this._img?.complete || !this._img.naturalWidth) return;

    const ctx = renderer.context;
    const sc  = renderer.scale;
    const sx  = this._frame * FRAME_W;
    const px  = Math.round((this._pos.x + renderer.offsetX) * sc);
    const py  = Math.round((this._pos.y + renderer.offsetY) * sc);
    const rot = this._direction === "east"  ?  Math.PI / 2
              : this._direction === "west"  ? -Math.PI / 2
              : this._direction === "south" ?  Math.PI
              : 0;

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(px, py);
    if (rot) ctx.rotate(rot);

    ctx.drawImage(
      this._img,
      sx, 0, FRAME_W, this._fh,
      Math.round(-FRAME_W / 2 * sc),
      Math.round(-this._fh  / 2 * sc),
      Math.round(FRAME_W * sc),
      Math.round(this._fh  * sc),
    );

    ctx.restore();
  }
}
