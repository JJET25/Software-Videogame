import Door from "../Objects/Door.js";
import { OPPOSITE, ROOM_HEIGHT, ROOM_WIDTH, TILE_SIZE } from "../Utils/Constants.js";
import Vector from "../Utils/Vector.js";
import Room from "../World/Rooms/Room.js";

export default class RoomManager {
    constructor(graph, player, callbacks = {}) {
        this.graph = graph;
        this.player = player;
        this.callbacks = callbacks;
        this.currentNodeId = null;
        this.previousNodeId = null;
        this.currentRoom = null;
        this.trasitionCooldown = 0;     // Prevents instant room transitions
        this.doors = [];                // Active doors in the current room
    }

    // Teleport player to the start room
    enterStartRoom() { this.enterRoom(this.graph.startNodeId, null) }

    // Load a new room, build its doors and place the player
    enterRoom(nodeId, fromNodeId = null) {
        const node = this.graph.getNode(nodeId);
        const neighbors = this.graph.getNeighbors(nodeId);

        console.log(`Entering node ${nodeId} | type: ${node.type} | depth: ${node.depth}`);
        console.log(`Doors: ${this.graph.getNeighbors(nodeId).map(n => this.#getDirectionBetweem(node, n))}`);
        
        this.currentNodeId = nodeId;
        this.previousNodeId = fromNodeId;
        node.isVisited = true;

        const doorDirections = neighbors.map(neighbor => this.#getDirectionBetweem(node, neighbor));
        this.currentRoom = new Room(doorDirections);
        this.doors = this.#buildDoors(node);

        this.#placePlayer(fromNodeId);

        // Loock doors if the room has enemies
        if (this.currentRoom.enemies.length > 0) {
            this.doors.forEach(door => door.lock());
        }
        this.trasitionCooldown = 0.3;   // Cooldown time in seconds
    }

    // Update loop for room logic and collision checks 
    update(deltaTime) {
        if (this.trasitionCooldown > 0) this.trasitionCooldown -= deltaTime;
        this.currentRoom.update(deltaTime, this.player);
        this.#checkRoomCleared();
        this.#checkDoorTransitions();
    }

    // Render the room layout and its doors
    draw(renderer) {
        this.currentRoom.draw(renderer);
        this.doors.forEach(door => door.draw(renderer));
    }

    // Create door using directions of neighbor rooms
    #buildDoors(node) {
        const arrDoor = [];
        for (const neighbor of this.graph.getNeighbors(node.id)) {
            const direction = this.#getDirectionBetweem(node, neighbor);
            const position = this.currentRoom.getDoorPosition(direction);
            arrDoor.push(new Door(position, neighbor.id));
        }
        return arrDoor;
    }

    // Place the player at the center (startRoom) or near the door they came from
    #placePlayer(fromNodeId) {
        if (fromNodeId === null) this.player.position = new Vector(ROOM_WIDTH / 2, ROOM_HEIGHT / 2);
        else {
            const currentNode = this.graph.getNode(this.currentNodeId);
            const fromNode = this.graph.getNode(fromNodeId);

            const direction = this.#getDirectionBetweem(fromNode, currentNode);
            const oppositeDir = OPPOSITE[direction];    // Find the door side on the new room
            const doorPos = this.currentRoom.getDoorPosition(oppositeDir);

            // Move the player 1 tile inside 
            switch (oppositeDir) {
                case "north":
                    this.player.position = doorPos.plus(new Vector(0, TILE_SIZE));
                    break;
                case "south":
                    this.player.position = doorPos.minus(new Vector(0, TILE_SIZE));
                    break;
                case "east":
                    this.player.position = doorPos.minus(new Vector(TILE_SIZE, 0));
                    break;
                case "west":
                    this.player.position = doorPos.plus(new Vector(TILE_SIZE, 0));
                    break;
                default:
                    break;
            }
        }
    }

    // Check if all enemies are dead to open the doors
    #checkRoomCleared() {
        if (this.currentRoom.isCleared) return;

        if (this.currentRoom.enemies.length === 0) {
            this.currentRoom.isCleared = true;
            this.doors.forEach(door => door.unlock());

            const type = this.graph.getNode(this.currentNodeId).type;
            if (type === "miniBoss") this.callbacks.onMiniBossDefeated?.();
            if (type === "finalBoss") this.callbacks.onFinalBossDefeated?.();
        }
    }

    // Check if the player is walking into an unlocked door
    #checkDoorTransitions() {
        if (this.trasitionCooldown > 0) return;
        for (const door of this.doors) {
            if (!door.isLocked && door.isPlayerInside(this.player)) {
                this.enterRoom(door.targetNodeId, this.currentNodeId);
                return;
            }
        }
    }

    // Calculate the cardinal direction
    #getDirectionBetweem(fromNode, toNode) {
        const dx = toNode.gridPos.x - fromNode.gridPos.x;
        const dy = toNode.gridPos.y - fromNode.gridPos.y;

        if (dx > 0) return "east";
        if (dx < 0) return "west";
        if (dy > 0) return "south";
        if (dy < 0) return "north";
    }
}