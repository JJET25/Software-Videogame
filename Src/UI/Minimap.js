import { MINIMAP_CONFIG, ROOM_HEIGHT, ROOM_WIDTH } from "../Utils/Constants.js";

export default class MiniMap {
  constructor(dimensionManager, config = MINIMAP_CONFIG) {
    this.dimensionManager = dimensionManager;

    this.config = config;

    this.visible = true;
  }

  toggle() {
    this.visible = !this.visible;
  }

  draw(renderer) {
    if (!this.visible) return;

    const RoomManager = this.dimensionManager.roomManager
    const graph = RoomManager.graph;
    const nodes = graph.getAllNodes()
    const minX = Math.min(...nodes.map((node) => node.gridPos.x));
    const minY = Math.min(...nodes.map((node) => node.gridPos.y));
    const maxX = Math.max(...nodes.map((node) => node.gridPos.x));
    const maxY = Math.max(...nodes.map((node) => node.gridPos.y));

    // Draw background
    const totalCols = maxX - minX + 1;
    const totalRows = maxY - minY + 1;

    const cell = this.config.roomSize + this.config.gap;

    const originX = this.config.anchorX - totalCols * cell;
    const originY = this.config.anchorY - totalRows * cell;

    // Draw connections
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

    // Draw nodes
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

  #getState(node, currentNodeId) {
    // SHOP FIRST
    if (node.type === "mrBombastic") return "mrBombastic";
    if (node.type === "shop") return "shop";

    // BOSS
    if (node.type === "miniBoss" || node.type === "finalBoss") return "boss";

    // CURRENT ROOM
    if (node.id === currentNodeId) return "current";

    // UNDISCOVERED
    if (!node.isVisited) return "undiscovered";

    // VISITED
    return "visited";
  }

  #toScreenPos(gridPos, minX, minY, originX, originY) {
    // Normalized positions
    const normalX = gridPos.x - minX;

    const normalY = gridPos.y - minY;

    const cell = this.config.roomSize + this.config.gap;

    return {
      x: originX + normalX * cell,

      y: originY + normalY * cell,
    };
  }

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
