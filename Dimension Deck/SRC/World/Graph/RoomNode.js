export default class RoomNode {
    constructor(id, depth) {
        this.id = id;
        this.type = null;
        this.depth = depth;
        this.connections = []; 
        this.isCleared = false;
        this.isVisited = false;
        this.gridPos = { x: 0, y: 0 } // {x, y} minimap's layout
    }

    connectTo(otherId) { if (!this.connections.includes(otherId)) this.connections.push(otherId); }
    
    isConnectedTo(otherId) { return this.connections.includes(otherId); }
}
