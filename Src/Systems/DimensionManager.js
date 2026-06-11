// DimensionManager.js — Orchestrates the full run by shuffling dimensions, advancing phases, and delegating to RoomManager
import DimensionGenerator from "../Generation/DimensionGenerator.js";
import { randInt } from "../Utils/Random.js";
import DarkAgesDimension from "../World/Dimensions/DarkAgesDimension.js";
import OldWestDimension from "../World/Dimensions/OldWestDimension.js";
import RoomManager from "./RoomManager.js";

export default class DimensionManager {
  // Stores player reference, victory callback, and optional overlay callbacks with safe defaults
  constructor(
    player,
    onVictory           = null,
    onShowLevel         = null,
    onShowDimTransition = null,
    onShowBossKill      = null,
  ) {
    this.player    = player;
    this.onVictory = onVictory;

    this._onShowLevel        = onShowLevel        ?? ((n, d, p, done) => done?.());
    this._onShowDimTransition = onShowDimTransition ?? ((f, t, done) => done?.());
    this._onShowBossKill     = onShowBossKill      ?? ((type, dim, next, done) => done?.());

    this.availableDimensions = [
      new DarkAgesDimension(),
      new OldWestDimension(),
    ];
    this.runDimensions    = [];
    this.currentDimIndex  = null;
    this.currentPhase     = null;
    this.currentGenerator = null;
    this.roomManager      = null;
    this._levelNumber     = 0;
    this._advancing       = false;
  }

  // Shuffles dimensions, loads the first mini-boss phase, and shows the Level 1 overlay
  startRun() {
    this.runDimensions   = this.#shuffleDimensions();
    this.currentDimIndex = 0;
    this.currentPhase    = "miniBoss";
    this._levelNumber    = 1;
    this.#loadCurrentPhase();
    const dim = this.getCurrentDimension();
    this._onShowLevel(this._levelNumber, dim.name, "MINI BOSS", null);
  }

  // Transitions from mini-boss to final-boss phase within the current dimension
  onMiniBossDefeated() {
    if (this._advancing) return;
    this._advancing = true;

    const dim = this.getCurrentDimension();
    this._levelNumber++;
    this._onShowBossKill("miniBoss", dim.name, "FINAL BOSS", () => {
      this.currentPhase = "finalBoss";
      this.#loadCurrentPhase();
      this._advancing = false;
      this._onShowLevel(this._levelNumber, dim.name, "FINAL BOSS", null);
    });
  }

  // Advances to the next dimension or triggers victory if all dimensions are cleared
  onFinalBossDefeated() {
    if (this._advancing) return;
    this._advancing = true;

    if (this.currentDimIndex < this.runDimensions.length - 1) {
      const fromDim = this.getCurrentDimension();
      const nextDim = this.runDimensions[this.currentDimIndex + 1];
      this._levelNumber++;
      this._onShowBossKill("finalBoss", fromDim.name, nextDim.name.toUpperCase(), () => {
        this.currentDimIndex++;
        this.currentPhase = "miniBoss";
        const toDim = this.getCurrentDimension();
        this._onShowDimTransition(fromDim.name, toDim.name, () => {
          this.#loadCurrentPhase();
          this._advancing = false;
          this._onShowLevel(this._levelNumber, toDim.name, "MINI BOSS", null);
        });
      });
    } else {
      const dim = this.getCurrentDimension();
      this._onShowBossKill("finalBoss", dim.name, "VICTORY!", () => {
        this._advancing = false;
        this.#triggerVictory();
      });
    }
  }

  // Returns the dimension object at the current run index
  getCurrentDimension() {
    return this.runDimensions[this.currentDimIndex];
  }

  // Returns the active RoomManager instance
  getRoomManager() {
    return this.roomManager;
  }

  // Returns false only when the player is on the last phase of the last dimension
  canAdvanceLevel() {
    return !(
      this.currentDimIndex === this.runDimensions.length - 1 &&
      this.currentPhase === "finalBoss"
    );
  }

  // Delegates to the correct boss-defeated handler based on the current phase
  advanceLevel() {
    if (this.currentPhase === "miniBoss") this.onMiniBossDefeated();
    else if (this.currentPhase === "finalBoss") this.onFinalBossDefeated();
  }

  // Generates the room graph for the current phase and creates a fresh RoomManager
  #loadCurrentPhase() {
    const dim = this.getCurrentDimension();
    this.player.setDimension(dim.id);

    this.currentGenerator = new DimensionGenerator(
      this.runDimensions[this.currentDimIndex],
    );

    const graph =
      this.currentPhase === "miniBoss"
        ? this.currentGenerator.generateGraphMiniBoss()
        : this.currentGenerator.generateGraphFinalBoss();

    const callbacks = {
      onMiniBossDefeated:  () => this.onMiniBossDefeated(),
      onFinalBossDefeated: () => this.onFinalBossDefeated(),
    };

    this.roomManager = new RoomManager(
      graph,
      this.player,
      this.getCurrentDimension(),
      callbacks,
    );
    this.roomManager.enterStartRoom();
  }

  // Invokes the victory callback if one was provided
  #triggerVictory() {
    this.onVictory?.();
  }

  // Fisher-Yates shuffle using seeded math.random so runs are reproducible
  #shuffleDimensions() {
    let arr = [...this.availableDimensions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
