export default class RoomGraph {
    constructor() {
        this.nodes = new Map();
        this.startNodeId = null;
        this.bossNodeId = null;
    }

    // Building methods
    addNode(node) { this.nodes.set(node.id, node); }

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

    // Consult Methods
    getNode(id) { return this.nodes.get(id); }

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

    // Validation
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

    printAdjacencyList() {
        for (const node of this.getAllNodes()) {
            const neighbors = node.connections.join(", ");
            console.log(`Node ${node.id} (${node.gridPos.x},${node.gridPos.y}) → [${neighbors}]`);
        }
    }
}