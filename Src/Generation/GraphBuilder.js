import { DIRECTIONS, GENERATION } from "../Utils/Constants.js";
import { randFloat, randInt } from "../Utils/Random.js";
import RoomGraph from "../World/Graph/RoomGraph.js";
import RoomNode from "../World/Graph/RoomNode.js";

export default class GraphBuilder {
  #counter;
  #occupiedGrid;

  constructor() {
    this.#counter = 0;
    this.#occupiedGrid = new Map();
  }

  build(roomCount) {
    const graph = new RoomGraph();
    const startNode = this.#createNode(0, 0);

    startNode.type = "start";

    graph.addNode(startNode);
    graph.setStart(startNode.id);

    this.#expandDungeon(graph, roomCount);

    this.#assignDepths(graph);

    this.#assignSpecialRooms(graph);

    return graph;
  }

  #expandDungeon(graph, roomCount) {
    const frontier = [graph.getStartNode()];

    while (frontier.length > 0 && graph.size() < roomCount) {
      const randomIndex = randInt(0, frontier.length - 1);
      const currentNode = frontier[randomIndex];

      const availableDirection = this.#getAvailableDirections(
        currentNode.gridPos,
      );

      for (const dir of availableDirection) {
        if (graph.size() >= roomCount) break;

        const newX = currentNode.gridPos.x + dir.dx;

        const newY = currentNode.gridPos.y + dir.dy;

        const newNode = this.#createNode(newX, newY);

        newNode.type = null;
        graph.addNode(newNode);
        graph.addEdge(currentNode.id, newNode.id);

        this.#connectToExistingNeighbors(graph, newNode);

        frontier.push(newNode);
      }

      frontier.splice(randomIndex, 1);
    }
  }

  #getAvailableDirections(pos) {
    return DIRECTIONS.filter((dir) => {
      const nextX = pos.x + dir.dx;
      const nextY = pos.y + dir.dy;
      const posXY = this.#posKey(nextX, nextY);

      return !this.#occupiedGrid.has(posXY);
    });
  }

  #connectToExistingNeighbors(graph, node) {
    for (const dir of DIRECTIONS) {
      const newX = node.gridPos.x + dir.dx;
      const newY = node.gridPos.y + dir.dy;
      const key = this.#posKey(newX, newY);

      if (this.#occupiedGrid.has(key)) {
        if (randFloat() > GENERATION.CONNECTION_CHANCE) continue;
        const neighbor = this.#occupiedGrid.get(key);

        graph.addEdge(node.id, neighbor.id);
      }
    }
  }

  #assignDepths(graph) {
    const queueId = [[graph.startNodeId, 0]];

    const visited = new Set();

    while (queueId.length > 0) {
      const [currentId, currentDepth] = queueId.shift();

      if (visited.has(currentId)) continue;

      visited.add(currentId);

      const currentNode = graph.getNode(currentId);

      currentNode.depth = currentDepth;

      for (const neighbor of graph.getNeighbors(currentId)) {
        if (!visited.has(neighbor.id)) {
          queueId.push([neighbor.id, currentDepth + 1]);
        }
      }
    }
  }

  #assignSpecialRooms(graph) {
    const nodes = graph.getAllNodes();

    nodes.sort((a, b) => b.depth - a.depth);

    // Boss room
    const bossNode = nodes[0];

    bossNode.type = "finalBoss";

    graph.setBoss(bossNode.id);

    // Shop room
    for (const node of nodes) {
      if (
        node.id !== bossNode.id &&
        node.type === "combat" &&
        node.depth >= 4
      ) {
        node.type = "shop";
        break;
      }
    }
  }

  #createNode(x, y) {
    const newNode = new RoomNode(this.#counter, 0);

    newNode.gridPos.x = x;
    newNode.gridPos.y = y;

    this.#occupiedGrid.set(this.#posKey(x, y), newNode);

    this.#counter++;

    return newNode;
  }

  #posKey(x, y) {
    return `${x},${y}`;
  }
}
