// RoomTypeAssigner.js — Assigns room types to untyped nodes in a graph using weighted probability.
// Ensures the start and boss nodes keep their fixed types and prevents duplicate shop rooms.

import { randInt } from "../Utils/Random.js";

export default class RoomTypeAssigner {
  // Iterates all untyped nodes and assigns a weighted random room type to each.
  assign(graph, weights, bossType = "boss") {
    graph.getStartNode().type = "start";
    graph.getBossNode().type = bossType;

    // Check if GraphBuilder already placed a shop to prevent duplicates.
    let shopAssigned = graph.getAllNodes().some((n) => n.type === "shop");

    for (const node of graph.getAllNodes()) {
      if (node.type === null) {
        let type = this.#weightedRoll(weights);

        // Demote the second shop roll to a combat room if one already exists.
        if (type === "shop" && shopAssigned) {
          type = "combat";
        } else if (type === "shop") {
          shopAssigned = true;
        }
        node.type = type;
      }
    }
  }

  // Returns a room type string selected by rolling against the cumulative weight table.
  #weightedRoll(weights) {
    const arrWeights = this.#buildCumalativeTable(weights);
    const randomWeight = randInt(0, 100);

    for (const weight of arrWeights) {
      if (randomWeight <= weight.limit) return weight.type;
    }
  }

  // Converts a weight map into a cumulative threshold array for O(n) random selection.
  #buildCumalativeTable(weights) {
    const arrWeights = [];
    let sumWeights = 0;

    Object.entries(weights).forEach(([key, value]) => {
      sumWeights += value;

      arrWeights.push({
        type: key,
        limit: sumWeights,
      });
    });
    return arrWeights;
  }
}
