import DimensionGenerator from "../Generation/DimensionGenerator.js";
import { randInt } from "../Utils/Random.js";
import DarkAgesDimension from "../World/Dimensions/DarkAgesDimension.js";
import OldWestDimension from "../World/Dimensions/OldWestDimension.js";
import RoomManager from "./RoomManager.js";

// Orchestrates the full run — shuffles dimensions, advances phases, and delegates to RoomManager
export default class DimensionManager {
  constructor(player, onVictory = null) {
    this.player = player;
    this.onVictory = onVictory;
    this.availableDimensions = [
      new DarkAgesDimension(),
      new OldWestDimension(),
    ];
    this.runDimensions = [];
    this.currentDimIndex = null;
    this.currentPhase = null;
    this.currentGenerator = null;
    this.roomManager = null;
  }

  // Shuffles dimensions and loads the first miniBoss phase
  startRun() {
    this.runDimensions = this.#shuffleDimensions();
    this.currentDimIndex = 0;
    this.currentPhase = "miniBoss";
    this.#loadCurrentPhase();
  }

  onMiniBossDefeated() {
    this.currentPhase = "finalBoss";
    this.#loadCurrentPhase();
  }

  // Advances to the next dimension or triggers victory if all dimensions are cleared
  onFinalBossDefeated() {
    if (this.currentDimIndex < this.runDimensions.length - 1) {
      this.currentDimIndex++;
      this.currentPhase = "miniBoss";
      this.#loadCurrentPhase();
    } else this.#triggerVictory();
  }

  getCurrentDimension() {
    return this.runDimensions[this.currentDimIndex];
  }
  getRoomManager() {
    return this.roomManager;
  }

  // Generates the room graph for the current phase and creates a fresh RoomManager
  #loadCurrentPhase() {
    this.currentGenerator = new DimensionGenerator(
      this.runDimensions[this.currentDimIndex],
    );

    const graph =
      this.currentPhase === "miniBoss"
        ? this.currentGenerator.generateGraphMiniBoss()
        : this.currentGenerator.generateGraphFinalBoss();

    const callbacks = {
      onMiniBossDefeated: () => this.onMiniBossDefeated(),
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

  #triggerVictory() {
    this.onVictory?.();
  }

  // Fisher-Yates shuffle using the seeded math.random so runs are reproducible
  #shuffleDimensions() {
    let arr = [...this.availableDimensions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
