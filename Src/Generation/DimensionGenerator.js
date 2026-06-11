// DimensionGenerator.js — Orchestrates dungeon graph generation for a given dimension.
// Produces either a mini-boss graph (for mid-level runs) or a final-boss graph (for the last level).

import { GENERATION, ROOM_WEIGHTS } from "../Utils/Constants.js";
import { randInt } from "../Utils/Random.js";
import GraphBuilder from "./GraphBuilder.js";
import RoomTypeAssigner from "./RoomTypeAssigner.js";

export default class DimensionGenerator {
  // Creates a generator for the given dimension instance.
  constructor(dimension) {
    // The dimension provides enemy pool, room weights, and boss references.
    this.dimension = dimension;
    this.assigner = new RoomTypeAssigner();
  }

  // Generates a dungeon graph whose deepest room is assigned the mini-boss type.
  generateGraphMiniBoss() {
    const count = randInt(GENERATION.MIN_ROOMS, GENERATION.MAX_ROOMS);
    const builder = new GraphBuilder();
    const graph = builder.build(count);

    // Apply dimension-specific room weights so special rooms appear at the correct frequency.
    this.assigner.assign(graph, this.dimension.roomWeights, "miniBoss");
    return graph;
  }

  // Generates a dungeon graph whose deepest room is assigned the final-boss type.
  // This method should be called only once, after all mini-boss levels have been generated.
  generateGraphFinalBoss() {
    const count = randInt(GENERATION.MIN_ROOMS, GENERATION.MAX_ROOMS);
    const builder = new GraphBuilder();
    const graph = builder.build(count);
    this.assigner.assign(graph, ROOM_WEIGHTS, "finalBoss");
    return graph;
  }
}
