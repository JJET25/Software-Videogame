import { MINIMAP_CONFIG } from "../Utils/Constants.js";

export default class MiniMap {
    constructor(dimensionManager, config = MINIMAP_CONFIG) {
        this.dimensionManager = dimensionManager;
        this.config = config;
        this.visible = false;
    }

    toggle() { this.visible = !this.visible; }

    draw(renderer) {
        if (!this.visible) return

        const RoomManager = this.dimensionManager.roomManager;
        const graph = RoomManager.graph;
        const currentNodeId;
        // Obtener un graph y currentNodeId
        // Calculamos bounding box
        // Acceder a grid pos
        // Dibujar el fondo
        // Dibujar nodo
        // Dibujar conexiones   
    }

    #getState(node, currentNodeId) {
        if (node.id === currentNodeId) return "current";
        if (!node.isVisited) return "undiscovered";

        // Agregar logica boss?
        return "visited";
    }

    #toScreenPos(gridPos, minX, minY) {
        // Normalized positions
        const normalX = gridPos.x - minX;
        const normalY = gridPos.y - minY;

        // Scale pixels
        const screenX = this.config.originX + normalX * (this.config.roomSize + this.config.gap);
        const screenY = this.config.originY + normalY * (this.config.roomSize + this.config.gap);

        return {x: screenX, y: screenY};
    }

    #drawNode(renderer, screenPos, state) {
        const color = this.config.colors[state];
        renderer.drawRect(screenPos.x, screenPos.y, 
                          this.config.roomSize, this.config.roomSize, color);
    }

    #drawConnection(renderer, posA, posB) {
        renderer.drawLine(posA.x, posA.y, posB.x, posB.y, this.config.colors.connection);
    }
}