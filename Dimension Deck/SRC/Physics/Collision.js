export default class Collision {
    static checkAABB(boundsA, boundsB) {
        // Comprueba si dos cajas estan tocandose/solapandose
        // Recibe los limites del objeto {left, right, top, bottom} 
        return (
            boundsA.left <= boundsB.right &&
            boundsA.right >= boundsB.left &&
            boundsA.top <= boundsB.bottom &&
            boundsA.bottom >= boundsB.top
        );
    }

    static getOverlap(boundsA, boundsB) {
        // Calcula el area de solapamiento entre dos cajas
        const overlapX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
        const overlapY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

        return { overlapX, overlapY };
    }

    static resolve(objectA, objectB) {
        const boundsA = objectA.getBounds();
        const boundsB = objectB.getBounds();

        // Si no hay colisión, salir
        if (!this.checkAABB(boundsA, boundsB)) return;

        const { overlapX, overlapY } = this.getOverlap(boundsA, boundsB);

        if (overlapX < overlapY) {
            // Collision horizontal
            if (objectA.position.x < objectB.position.x) {
                objectA.position.x -= overlapX;
            } else { objectA.position.x += overlapX; }

            objectA.velocity.x = 0;

        } else {
            // Collision vertical
            if (objectA.position.y < objectB.position.y) {
                objectA.position.y -= overlapY;
            } else { objectA.position.y += overlapY }

            objectA.velocity.y = 0;
        }
    }
}