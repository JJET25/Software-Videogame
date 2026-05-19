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
        // Obtener un graph y currentNodeId
        // Calculamos bounding box
        // Acceder a grid pos
        // Dibujar el fondo
        // Dibujar nodo
        // Dibujar conexiones   
    }

    #getState(node, currentNodeId) { }

    #toScreenPos(gridPos, minX, minY) {
        // Normalized positions
        const normalX = gridPos.x - minX; 
        const normalY = gridPos.y - minY;

        // Scale pixels
        const scaleX = this.config.originX + normalX * (this.config.roomSize + this.config.gap);
        const scaleY = this.config.originY + normalY * (this.config.roomSize + this.config.gap);
    }
    
    #drawNode(renderer, screenPos, state) {
        this.config.colors[state];
        renderer.drawRect(screenPos.x, screenPos.y, this.config.roomSize, this.config.roomSize)
    }

    #drawConnection(renderer, posA, posB) { }
}