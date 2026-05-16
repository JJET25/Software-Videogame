import { GENERATION, ROOM_WEIGHTS } from "../Utils/Constants.js";
import GraphBuilder from "./GraphBuilder.js";
import RoomTypeAssigner from "./RoomTypeAssigner.js";

export default class DimensionGenerator {
    constructor(dimension, rng) {
        this.dimension = dimension;                 // Current world/dimension
        this.rng = rng                              // Random Number Generator
        this.assigner = new RoomTypeAssigner(rng);
    }

    // This generate a graph where the final node is a Mini Boss
    // Use when you want to make many levels in each dimension
    generateGraphMiniBoss() {
        const count = this.rng.int(GENERATION.MIN_ROOMS, GENERATION.MAX_ROOMS);
        const builder = new GraphBuilder(this.rng);
        const graph = builder.build(count);

        // Uses specific weights from current dimensio
        this.assigner.assign(graph, this.dimension.roomWeights, "miniBoss");
        return graph;
    }

    // This generate a graph where the final node is the Final Boss of the dimension
    // Only use one time, after you generate de mini boss you want before
    generateGraphFinalBoss() {
        const count = this.rng.int(GENERATION.MIN_ROOMS, GENERATION.MAX_ROOMS);
        const builder = new GraphBuilder(this.rng);
        const graph = builder.build(count);
        this.assigner.assign(graph, ROOM_WEIGHTS, "finalBoss");
        return graph;
    }
}