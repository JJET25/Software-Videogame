import { DIRECTIONS } from "../Utils/Constants.js";
import RoomGraph from "../World/Graph/RoomGraph.js";
import RoomNode from "../World/Graph/RoomNode.js";

export default class GraphBuilder {
    #counter;
    #occupiedGrid;

    constructor(rng) {
        this.rng = rng; // Random Number Generator
        this.#counter = 0; // Unique IDs
        this.#occupiedGrid = new Map(); // Map<string, RoomNode>
    }

    build(roomCount) {
        const graph = new RoomGraph();
        const startNode = this.#createNode(0, 0);

        graph.addNode(startNode);
        graph.setStart(startNode.id);

        this.#expandDungeon(graph, roomCount);
        this.#assignDepths(graph);
        this.#selectBossNode(graph);
        return graph;
    }

    #expandDungeon(graph, roomCount) {
        const frontier = [graph.getStartNode()];

        while (frontier.length > 0 && graph.size() < roomCount) {
            const randomIndex = this.rng.int(0, frontier.length - 1);
            const currentNode = frontier[randomIndex];

            // Get available directions
            const availableDirection = this.#getAvailableDirections(currentNode.gridPos);

            for (const dir of availableDirection) {
                // Check if room counts is completed
                if (graph.size() >= roomCount) break;

                // Get new node position
                const newX = currentNode.gridPos.x + dir.dx;
                const newY = currentNode.gridPos.y + dir.dy;

                const newNode = this.#createNode(newX, newY);
                graph.addNode(newNode);
                this.#connectToExistingNeighbors(graph, newNode);
                frontier.push(newNode);
            }
            // Remove actual node as frontier
            frontier.splice(randomIndex, 1);
        }
    }

    #getAvailableDirections(pos) {
        const available = DIRECTIONS.filter(dir => {
            const nextX = pos.x + dir.dx;
            const nextY = pos.y + dir.dy;

            const posXY = this.#posKey(nextX, nextY);

            // Check if not position have a node
            return !this.#occupiedGrid.has(posXY);
        })
        return available;
    }

    #connectToExistingNeighbors(graph, node) {
        for (const dir of DIRECTIONS) {
            const newX = node.gridPos.x + dir.dx;
            const newY = node.gridPos.y + dir.dy;
            const key = this.#posKey(newX, newY);

            if (this.#occupiedGrid.has(key)) {
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
                if (!visited.has(neighbor.id)) queueId.push([neighbor.id, currentDepth + 1]);
            }
        }
    }

    #selectBossNode(graph) {
        const arrNodes = graph.getAllNodes();
        let bossNode = arrNodes[0];
        for (const node of arrNodes) {
            if (bossNode.depth < node.depth) bossNode = node;
        }

        graph.setBoss(bossNode.id);
        return graph.getBossNode();
    }

    #createNode(x, y) {
        const newNode = new RoomNode(this.#counter, 0);

        // Set grid position
        newNode.gridPos.x = x;
        newNode.gridPos.y = y;

        // Store node position
        this.#occupiedGrid.set(this.#posKey(x, y), newNode);
        this.#counter++;

        return newNode;
    }

    #posKey(x, y) { return `${x},${y}`; }
}