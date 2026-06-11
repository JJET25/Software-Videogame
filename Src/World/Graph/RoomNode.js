// RoomNode.js — Single node in the dungeon room graph.
// Tracks the room's type, depth, connections, cleared/visited state, and minimap grid position.

export default class RoomNode {
  constructor(id, depth) {
    // Unique identifier for this node.
    this.id = id;
    // Room type assigned by the generator (e.g. "combat", "shop", "boss").
    this.type = null;
    // Distance from the start node in BFS traversal order.
    this.depth = depth;
    // List of connected neighbor node IDs.
    this.connections = [];
    // True once all enemies in this room have been defeated.
    this.isCleared = false;
    // True once the player has entered this room.
    this.isVisited = false;
    // Grid position used for minimap rendering.
    this.gridPos = { x: 0, y: 0 };
  }

  // Adds a connection to another node if not already present.
  connectTo(otherId) {
    if (!this.connections.includes(otherId)) this.connections.push(otherId);
  }

  // Returns true if this node is directly connected to the given node ID.
  isConnectedTo(otherId) { return this.connections.includes(otherId); }
}
