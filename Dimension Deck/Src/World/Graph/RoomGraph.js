export default class RoomGraph {
    constructor() {
        this.nodes = new Map();     // Stores all rooms (Key: ID, Value: RoomNode)
        this.startNodeId = null;    // ID of the start room
        this.bossNodeId = null;     // ID of the boss room
    }

    // Add a room to the map
    addNode(node) { this.nodes.set(node.id, node); }

    // Connect two rooms together 
    addEdge(idA, idB) {
        // Check if node A or node B exists in the graph
        if (!this.nodes.has(idA) || !this.nodes.has(idB)) return;

        const nodeA = this.getNode(idA);
        const nodeB = this.getNode(idB);

        nodeA.connectTo(idB);
        nodeB.connectTo(idA);
    }

    setStart(id) { this.startNodeId = id; }
    setBoss(id) { this.bossNodeId = id; }

    // Get a room by its ID
    getNode(id) { return this.nodes.get(id); }

    // Get an array of all connected room in room IDx
    getNeighbors(id) {
        const arrRoomNodes = [];
        const node = this.getNode(id);
        const nodeConnections = node.connections;

        for (const idNode of nodeConnections) { arrRoomNodes.push(this.getNode(idNode)); }
        return arrRoomNodes;
    }

    getStartNode() { return this.getNode(this.startNodeId); }
    getBossNode() { return this.getNode(this.bossNodeId); }
    getAllNodes() { return [...this.nodes.values()]; }
    size() { return this.nodes.size; }

    // Check if all nodes are connected. No one node should be not connected
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

    // Check if there is a path from start to the boss room. Use DFS
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