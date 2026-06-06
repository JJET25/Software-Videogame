// Dual-bus audio system
// BGM: <audio> element for streaming background music
// SFX: Web Audio API for low-latency one-shot sound effects
export default class AudioManager {
  constructor() {
    // BGM bus
    this._currentBGM = null;
    this._currentBGMName = null;
    this._bgmTracks = {};

    // SFX bus
    this._audioCtx = null;
    this._sfxBuffers = new Map();
  }

  // Registers a BGM track: call once during asset loading
  loadBGM(name, path) {
    this._bgmTracks[name] = new Audio(path);
  }

  // Fetches, decodes and stores an SFX buffer, call once during asset loading
  async loadSFX(name, path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.#getAudioCtx().decodeAudioData(arrayBuffer);
    this._sfxBuffers.set(name, audioBuffer);
  }

  // Starts a BGM track; does nothing if that track is already playing
  async playBGM(name) {
    if (name === this._currentBGMName) return;
    this.stopBGM();

    const track = this._bgmTracks[name];
    if (!track) return;

    track.currentTime = 0;
    this._currentBGM = track;
    this._currentBGMName = name;

    try {
      await this._currentBGM.play();
    } catch {
      // Blocked by browser autoplay policy
    }
  }

  // Stops and rewinds the current BGM track
  stopBGM() {
    if (!this._currentBGM) return;
    this._currentBGM.pause();
    this._currentBGM.currentTime = 0;
    this._currentBGM = null;
    this._currentBGMName = null;
  }

  // Plays a one-shot SFX from the preloaded buffer — safe to call repeatedly
  playSFX(name) {
    const buffer = this._sfxBuffers.get(name);
    if (!buffer) return;

    const ctx = this.#getAudioCtx();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0);
  }

  // Stops BGM and resets the SFX bus — use on scene changes
  stopAll() {
    this.stopBGM();
    this._audioCtx = null;
    this._sfxBuffers.clear();
  }

  // --------------------- PRIVATE ---------------------
  // Creates the AudioContext on first use (required by browser autoplay policy)
  #getAudioCtx() {
    if (!this._audioCtx) this._audioCtx = new AudioContext();
    return this._audioCtx;
  }
}
