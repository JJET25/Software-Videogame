import DimensionGenerator from "../Generation/DimensionGenerator.js";
import DarkAgesDimension from "../World/Dimension/DarkAgesDimension.js";
import OldWestDimension from "../World/Dimension/OldWestDimension.js";

export default class DimensionManager {
    constructor(rng, game) {
        this.rng = rng;
        this.game = game
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

    onMiniBossDefeated() { }
    onFinalBossDefeated() { }
    getCurrentDimension() { }
    getRoomManager() { }

    #loadCurrentPhase() {
        const dimGenerator = new DimensionGenerator(this.runDimensions[this.currentDimIndex], this.rng);

        if (this.currentPhase === "miniBoss") dimGenerator.generateGraphMiniBoss();
        else if (this.currentPhase === "finalBoss") dimGenerator.generateGraphFinalBoss();
    }
    #triggerVictory() { }

    #shuffleDimensions() {
        let arr = [...this.availableDimensions];

        for (let i = arr.length - 1; i > 0; i--) {
            const j = this.rng.int(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}