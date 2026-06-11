// RoomGraph.js — Undirected graph that models the dungeon room layout.
// Provides methods for adding nodes, connecting rooms, BFS traversal, and graph validation.

export default class RoomGraph {
  constructor() {
    // Stores all rooms keyed by their ID.
    this.nodes = new Map();
    // ID of the starting room.
    this.startNodeId = null;
    // ID of the boss room.
    this.bossNodeId = null;
  }

  // Adds a room node to the graph.
  addNode(node) { this.nodes.set(node.id, node); }

  // Creates a bidirectional connection between two rooms by ID.
  addEdge(idA, idB) {
    if (!this.nodes.has(idA) || !this.nodes.has(idB)) return;

    const nodeA = this.getNode(idA);
    const nodeB = this.getNode(idB);

    nodeA.connectTo(idB);
    nodeB.connectTo(idA);
  }

  // Sets the start room ID.
  setStart(id) { this.startNodeId = id; }
  // Sets the boss room ID.
  setBoss(id) { this.bossNodeId = id; }

  // Returns the node with the given ID.
  getNode(id) { return this.nodes.get(id); }

  // Returns an array of all RoomNode neighbors connected to the given room ID.
  getNeighbors(id) {
    const arrRoomNodes = [];
    const node = this.getNode(id);
    const nodeConnections = node.connections;

    for (const idNode of nodeConnections) { arrRoomNodes.push(this.getNode(idNode)); }
    return arrRoomNodes;
  }

  // Returns the start node instance.
  getStartNode() { return this.getNode(this.startNodeId); }
  // Returns the boss node instance.
  getBossNode() { return this.getNode(this.bossNodeId); }
  // Returns an array of all nodes in the graph.
  getAllNodes() { return [...this.nodes.values()]; }
  // Returns the total number of rooms in the graph.
  size() { return this.nodes.size; }

  // Returns true if every node is reachable from the start node via BFS.
  isFullyConnected() {
    const queueId = [this.startNodeId];
    const visited = new Set();

    while (queueId.length > 0) {
      const currentId = queueId.shift();

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      for (const neighbor of this.getNeighbors(currentId)) {
        if (!visited.has(neighbor.id)) queueId.push(neighbor.id);
      }
    }
    return visited.size === this.size();
  }

  // Returns true if there is at least one path from the start room to the boss room using BFS.
  allPathsReachBoss() {
    const queueId = [this.startNodeId];
    const visited = new Set();

    while (queueId.length > 0) {
      const currentId = queueId.shift();

      if (currentId === this.bossNodeId) return true;

      if (visited.has(currentId)) continue;
      visited.add(currentId);

      for (const neighbor of this.getNeighbors(currentId)) {
        if (!visited.has(neighbor.id)) queueId.push(neighbor.id);
      }
    }
    return false;
  }
}
