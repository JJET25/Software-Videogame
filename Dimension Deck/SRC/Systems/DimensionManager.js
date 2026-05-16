import DimensionGenerator from "../Generation/DimensionGenerator.js";
import DarkAgesDimension from "../World/Dimension/DarkAgesDimension.js";
import OldWestDimension from "../World/Dimension/OldWestDimension.js";
import RoomManager from "./RoomManager.js";

export default class DimensionManager {
    constructor(rng, player, onVictory = null) {
        this.rng = rng;
        this.player = player;
        this.onVictory = onVictory;
        this.availableDimensions = [new DarkAgesDimension(), new OldWestDimension()];
        this.runDimensions = [];
        this.currentDimIndex = null;
        this.currentPhase = null;
        this.currentGenerator = null;
        this.roomManager = null;
    }

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

    onFinalBossDefeated() {
        if (this.currentDimIndex < this.runDimensions.length - 1) {
            this.currentDimIndex++;
            this.currentPhase = "miniBoss";
            this.#loadCurrentPhase();
        } else {
            this.#triggerVictory();
        }
    }

    getCurrentDimension() { return this.runDimensions[this.currentDimIndex]; }
    getRoomManager() { return this.roomManager; }

    #loadCurrentPhase() {
        this.currentGenerator = new DimensionGenerator(this.runDimensions[this.currentDimIndex], this.rng);

        const graph = this.currentPhase === "miniBoss" 
            ? this.currentGenerator.generateGraphMiniBoss() 
            : this.currentGenerator.generateGraphFinalBoss();

        const callbacks = {
            onMiniBossDefeated: () => this.onMiniBossDefeated(),
            onFinalBossDefeated: () => this.onFinalBossDefeated()
        }

        this.roomManager = new RoomManager(graph, this.player, callbacks);
        this.roomManager.enterStartRoom();
    }

    #triggerVictory() { this.onVictory?.(); }

    #shuffleDimensions() {
        let arr = [...this.availableDimensions];

        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.rng.int(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}