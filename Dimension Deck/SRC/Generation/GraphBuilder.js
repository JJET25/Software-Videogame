import { DIRECTIONS, GENERATION } from "../Utils/Constants.js";
import RoomGraph from "../World/Graph/RoomGraph.js";
import RoomNode from "../World/Graph/RoomNode.js";

export default class GraphBuilder {
    #counter;
    #occupiedGrid;

    constructor(rng) {
        this.rng = rng;                     // Random Number Generator
        this.#counter = 0;                  // Unique IDs
        this.#occupiedGrid = new Map();     // Map<string, RoomNode>
    }

    // Create the dungeon map
    build(roomCount) {
        const graph = new RoomGraph();
        const startNode = this.#createNode(0, 0); // Create start room

        graph.addNode(startNode);
        graph.setStart(startNode.id);

        this.#expandDungeon(graph, roomCount);
        this.#assignDepths(graph);
        this.#selectBossNode(graph);
        return graph;
    }

    // Create new rooms until roomCount is reached
    #expandDungeon(graph, roomCount) {
        const frontier = [graph.getStartNode()]; // List of rooms to expand

        while (frontier.length > 0 && graph.size() < roomCount) {
            const randomIndex = this.rng.int(0, frontier.length - 1);
            const currentNode = frontier[randomIndex];

            const availableDirection = this.#getAvailableDirections(currentNode.gridPos);

            for (const dir of availableDirection) {
                if (graph.size() >= roomCount) break;

                const newX = currentNode.gridPos.x + dir.dx;
                const newY = currentNode.gridPos.y + dir.dy;

                const newNode = this.#createNode(newX, newY);
                graph.addNode(newNode);
                graph.addEdge(currentNode.id, newNode.id);

                // Connect with nearby existing rooms using a PROBABILITY 
                this.#connectToExistingNeighbors(graph, newNode);
                frontier.push(newNode);
            }
            // Remove room from frontier after expansion
            frontier.splice(randomIndex, 1);
        }
    }

    // Get directions that are not occupied by other rooms
    #getAvailableDirections(pos) {
        const available = DIRECTIONS.filter(dir => {
            const nextX = pos.x + dir.dx;
            const nextY = pos.y + dir.dy;
            const posXY = this.#posKey(nextX, nextY);

            return !this.#occupiedGrid.has(posXY);
        })
        return available;
    }

    // Randomly connect a room to its neighbors
    #connectToExistingNeighbors(graph, node) {
        for (const dir of DIRECTIONS) {
            const newX = node.gridPos.x + dir.dx;
            const newY = node.gridPos.y + dir.dy;
            const key = this.#posKey(newX, newY);

            if (this.#occupiedGrid.has(key)) {
                // Use chance to decide if we connect
                if (this.rng.float() > GENERATION.CONNECTION_CHANCE) continue;
                const neighbor = this.#occupiedGrid.get(key);
                graph.addEdge(node.id, neighbor.id);
            }
        }
    }

    // Calculate distance from start for every room
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

    // Set the room with the maximum depth as the boss room
    #selectBossNode(graph) {
        const arrNodes = graph.getAllNodes();
        let bossNode = arrNodes[0];
        for (const node of arrNodes) {
            if (bossNode.depth < node.depth) bossNode = node;
        }

        graph.setBoss(bossNode.id);
        return graph.getBossNode();
    }

    // Create a node and save its position in the grid
    #createNode(x, y) {
        const newNode = new RoomNode(this.#counter, 0);

        newNode.gridPos.x = x;
        newNode.gridPos.y = y;

        this.#occupiedGrid.set(this.#posKey(x, y), newNode);
        this.#counter++;

        return newNode;
    }

    // Convert coordinates to a string key
    #posKey(x, y) { return `${x},${y}`; }
}