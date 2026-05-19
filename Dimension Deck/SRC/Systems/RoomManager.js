import Door from "../Objects/Door.js";

import {
    OPPOSITE,
    ROOM_HEIGHT,
    ROOM_WIDTH,
    TILE_SIZE
} from "../Utils/Constants.js";

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

        this.trasitionCooldown = 0;

        this.doors = [];

        // Enemy bullets
        this.enemyBullets = [];
    }

    enterStartRoom() {

        this.enterRoom(this.graph.startNodeId, null);
    }

    enterRoom(nodeId, fromNodeId = null) {

        const node = this.graph.getNode(nodeId);

        const neighbors = this.graph.getNeighbors(nodeId);

        this.currentNodeId = nodeId;

        this.previousNodeId = fromNodeId;

        node.isVisited = true;

        const doorDirections = neighbors.map(
            neighbor =>
                this.#getDirectionBetweem(
                    node,
                    neighbor
                )
        );

        // Create room
        this.currentRoom = new Room(
            doorDirections,
            this.player,
            this.enemyBullets
        );

        this.doors = this.#buildDoors(node);

        this.#placePlayer(fromNodeId);

        // Lock room if enemies exist
        if (this.currentRoom.enemies.length > 0) {

            this.doors.forEach(
                door => door.lock()
            );
        }

        this.trasitionCooldown = 0.3;
    }

    update(deltaTime) {

        if (this.trasitionCooldown > 0) {

            this.trasitionCooldown -= deltaTime;
        }

        this.currentRoom.update(
            deltaTime,
            this.player
        );

        // Update bullets
        for (let bullet of this.enemyBullets) {

            bullet.update(deltaTime);
        }

// Bullet collisions
this.enemyBullets =
    this.enemyBullets.filter(bullet => {

        const distanceX = Math.abs(
            this.player.position.x -
            bullet.position.x
        );

        const distanceY = Math.abs(
            this.player.position.y -
            bullet.position.y
        );

        if (
            distanceX < 24 &&
            distanceY < 24
        ) {

            this.player.takeDamage(
                bullet.damage
            );

            return false;
        }

        return true;
    });

        this.#checkRoomCleared();

        this.#checkDoorTransitions();
    }

    draw(renderer) {

        this.currentRoom.draw(renderer);

        this.doors.forEach(
            door => door.draw(renderer)
        );

        // Draw bullets
        for (let bullet of this.enemyBullets) {

            bullet.draw(renderer);
        }
    }

    #buildDoors(node) {

        const arrDoor = [];

        for (
            const neighbor
            of this.graph.getNeighbors(node.id)
        ) {

            const direction =
                this.#getDirectionBetweem(
                    node,
                    neighbor
                );

            const position =
                this.currentRoom.getDoorPosition(
                    direction
                );

            arrDoor.push(
                new Door(
                    position,
                    neighbor.id
                )
            );
        }

        return arrDoor;
    }

    #placePlayer(fromNodeId) {

        if (fromNodeId === null) {

            this.player.position =
                new Vector(
                    ROOM_WIDTH / 2,
                    ROOM_HEIGHT / 2
                );
        }

        else {

            const currentNode =
                this.graph.getNode(
                    this.currentNodeId
                );

            const fromNode =
                this.graph.getNode(fromNodeId);

            const direction =
                this.#getDirectionBetweem(
                    fromNode,
                    currentNode
                );

            const oppositeDir =
                OPPOSITE[direction];

            const doorPos =
                this.currentRoom.getDoorPosition(
                    oppositeDir
                );

            switch (oppositeDir) {

                case "north":

                    this.player.position =
                        doorPos.plus(
                            new Vector(
                                0,
                                TILE_SIZE
                            )
                        );

                    break;

                case "south":

                    this.player.position =
                        doorPos.minus(
                            new Vector(
                                0,
                                TILE_SIZE
                            )
                        );

                    break;

                case "east":

                    this.player.position =
                        doorPos.minus(
                            new Vector(
                                TILE_SIZE,
                                0
                            )
                        );

                    break;

                case "west":

                    this.player.position =
                        doorPos.plus(
                            new Vector(
                                TILE_SIZE,
                                0
                            )
                        );

                    break;
            }
        }
    }

    #checkRoomCleared() {

        if (this.currentRoom.isCleared) return;

        if (
            this.currentRoom.enemies.length === 0
        ) {

            this.currentRoom.isCleared = true;

            this.doors.forEach(
                door => door.unlock()
            );

            const type =
                this.graph.getNode(
                    this.currentNodeId
                ).type;

            if (type === "miniBoss") {

                this.callbacks
                    .onMiniBossDefeated?.();
            }

            if (type === "finalBoss") {

                this.callbacks
                    .onFinalBossDefeated?.();
            }
        }
    }

    #checkDoorTransitions() {

        if (this.trasitionCooldown > 0)
            return;

        for (const door of this.doors) {

            if (
                !door.isLocked &&
                door.isPlayerInside(
                    this.player
                )
            ) {

                this.enterRoom(
                    door.targetNodeId,
                    this.currentNodeId
                );

                return;
            }
        }
    }

    #getDirectionBetweem(
        fromNode,
        toNode
    ) {

        const dx =
            toNode.gridPos.x -
            fromNode.gridPos.x;

        const dy =
            toNode.gridPos.y -
            fromNode.gridPos.y;

        if (dx > 0) return "east";

        if (dx < 0) return "west";

        if (dy > 0) return "south";

        if (dy < 0) return "north";
    }
}