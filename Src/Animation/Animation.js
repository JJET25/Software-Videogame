// Animation.js — Frame-based animation controller that advances frames at a fixed FPS.
export default class Animation {
  // sheet: SpriteSheet describing the frame source; fps: playback speed; loop: whether to repeat.
  constructor({ sheet, fps, loop = true }) {
    this.sheet = sheet;
    this.fps = fps;
    this.loop = loop;

    this._elapsed = 0;
    this.frame = 0;
    this.isDone = false;
  }

  // Advances the animation by deltaTime seconds; stops on the last frame when not looping.
  update(deltaTime) {
    if (this.isDone) return;

    this._elapsed += deltaTime;
    const frameDuration = 1 / this.fps;

    // Consume accumulated time in frame-sized chunks to handle frame skipping correctly.
    while (this._elapsed >= frameDuration) {
      this._elapsed -= frameDuration;
      this.frame++;

      if (this.frame >= this.sheet.frameCount) {
        if (this.loop) this.frame = 0;
        else {
          // Hold on the last frame and mark the animation as complete.
          this.frame = this.sheet.frameCount - 1;
          this.isDone = true;
          break;
        }
      }
    }
  }

  // Resets the animation back to the first frame.
  reset() {
    this._elapsed = 0;
    this.frame = 0;
    this.isDone = false;
  }
}
