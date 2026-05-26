export default class RoomTypeAssigner {
  constructor(rng) {
    this.rng = rng; // Random Number Generator
  }

  // Sets types for all rooms in the graph
  assign(graph, weights, bossType = "boss") {
    graph.getStartNode().type = "start";
    graph.getBossNode().type = bossType;

    // Track if a shop was already placed by GraphBuilder
    let shopAssigned = graph.getAllNodes().some((n) => n.type === "shop");

    for (const node of graph.getAllNodes()) {
      if (node.type === null) {
        let type = this.#weightedRoll(weights);

        // Prevent duplicate shop rooms
        if (type === "shop" && shopAssigned) {
          type = "combat";
        } else if (type === "shop") {
          shopAssigned = true;
        }

        node.type = type;
      }
    }
  }

  // Pick a random type using probability weights
  #weightedRoll(weights) {
    const arrWeights = this.#buildCumalativeTable(weights);
    const randomWeight = this.rng.int(0, 100);

    // Find where random number fits in the limits
    for (const weight of arrWeights) {
      if (randomWeight <= weight.limit) return weight.type;
    }
  }

  // Create a table with combined limit numbers for easy checking
  #buildCumalativeTable(weights) {
    const arrWeights = [];
    let sumWeights = 0;

    Object.entries(weights).forEach(([key, value]) => {
      sumWeights += value; // Add the current weight to the total sum

      arrWeights.push({
        type: key,
        limit: sumWeights,
      });
    });
    return arrWeights;
  }
}
