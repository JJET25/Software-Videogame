// Minimap.js — Renders a top-down minimap of visited and unvisited rooms in the top-right corner
import { MINIMAP_CONFIG, ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

export default class MiniMap {
  // Stores a reference to the dimension manager and accepts an optional config override
  constructor(dimensionManager, config = MINIMAP_CONFIG) {
    this.dimensionManager = dimensionManager;
    this.config = config;
    this.visible = true;
  }

  // Toggles minimap visibility on and off
  toggle() {
    this.visible = !this.visible;
  }

  // Draws room nodes and connecting lines; skips drawing when not visible
  draw(renderer) {
    if (!this.visible) return;

    const RoomManager = this.dimensionManager.roomManager;
    const graph = RoomManager.graph;
    const nodes = graph.getAllNodes();
    const minX = Math.min(...nodes.map((node) => node.gridPos.x));
    const minY = Math.min(...nodes.map((node) => node.gridPos.y));
    const maxX = Math.max(...nodes.map((node) => node.gridPos.x));
    const maxY = Math.max(...nodes.map((node) => node.gridPos.y));

    const totalCols = maxX - minX + 1;
    const totalRows = maxY - minY + 1;

    const cell = this.config.roomSize + this.config.gap;

    // Anchor position moves as the map grows to keep it top-right-aligned
    const originX = this.config.anchorX - totalCols * cell;
    const originY = this.config.anchorY - totalRows * cell;

    // Draw edges once per unique pair using a deduplication set
    const drawEdges = new Set();

    for (const node of nodes) {
      const posA = this.#toScreenPos(
        node.gridPos,
        minX,
        minY,
        originX,
        originY,
      );

      for (const neighbor of graph.getNeighbors(node.id)) {
        const edgeKey = [node.id, neighbor.id].sort().join(",");

        if (drawEdges.has(edgeKey)) continue;

        drawEdges.add(edgeKey);

        const posB = this.#toScreenPos(
          neighbor.gridPos,
          minX,
          minY,
          originX,
          originY,
        );

        this.#drawConnection(renderer, posA, posB);
      }
    }

    // Draw each node after all edges so nodes appear on top
    for (const node of nodes) {
      const screenPos = this.#toScreenPos(
        node.gridPos,
        minX,
        minY,
        originX,
        originY,
      );

      const state = this.#getState(node, RoomManager.currentNodeId);

      this.#drawNode(renderer, screenPos, state);
    }
  }

  // Returns a state string used to look up the correct color for a node
  #getState(node, currentNodeId) {
    if (node.type === "mrBombastic") return "mrBombastic";
    if (node.type === "shop") return "shop";
    if (node.type === "miniBoss" || node.type === "finalBoss") return "boss";
    if (node.id === currentNodeId) return "current";
    if (!node.isVisited) return "undiscovered";
    return "visited";
  }

  // Converts a grid position to screen pixel coordinates relative to the minimap origin
  #toScreenPos(gridPos, minX, minY, originX, originY) {
    const normalX = gridPos.x - minX;
    const normalY = gridPos.y - minY;
    const cell = this.config.roomSize + this.config.gap;
    return {
      x: originX + normalX * cell,
      y: originY + normalY * cell,
    };
  }

  // Draws a single room square in the color that matches its state
  #drawNode(renderer, screenPos, state) {
    const color = this.config.colors[state];
    renderer.drawRect(
      screenPos.x,
      screenPos.y,
      this.config.roomSize,
      this.config.roomSize,
      color,
    );
  }

  // Draws a line between the centers of two adjacent room nodes
  #drawConnection(renderer, posA, posB) {
    const half = this.config.roomSize / 2;
    renderer.drawLine(
      posA.x + half,
      posA.y + half,
      posB.x + half,
      posB.y + half,
      this.config.colors.connection,
      this.config.lineWidth,
    );
  }
}
