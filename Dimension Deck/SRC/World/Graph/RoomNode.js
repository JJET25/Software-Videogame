export default class RoomNode {
    constructor(id, depth) {
        this.id = id;                   // Unique ID for the node ID
        this.type = null;               // Room type
        this.depth = depth;             // Depth in the graph
        this.connections = [];          // List of connected node ID
        this.isCleared = false;         // True if enemies are dead
        this.isVisited = false;         // True if player entered the room
        this.gridPos = { x: 0, y: 0 }   // {x, y} minimap's layout
    }

    // Connect this room to another room
    connectTo(otherId) {
        if (!this.connections.includes(otherId)) this.connections.push(otherId);
    }

    // Check if this room connects to another room
    isConnectedTo(otherId) { return this.connections.includes(otherId); }
}
