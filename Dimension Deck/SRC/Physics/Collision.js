export default class Collision {
    // Clamp an entity inside the room boundaries using its hitbox
    static resolveEntityBounds(entity, roomWidth, roomHeight) {
        const b = entity.getBounds();
        if (b.left   < 0)          entity.position.x -= b.left;
        if (b.right  > roomWidth)  entity.position.x -= (b.right  - roomWidth);
        if (b.top    < 0)          entity.position.y -= b.top;
        if (b.bottom > roomHeight) entity.position.y -= (b.bottom - roomHeight);
    }

    // Check if two rectangles overlap. Return True or False
    static rectCollision(boundsA, boundsB) {
        return (
            boundsA.left <= boundsB.right &&
            boundsA.right >= boundsB.left &&
            boundsA.top <= boundsB.bottom &&
            boundsA.bottom >= boundsB.top
        );
    }

    // Calculates how many pixels the two objects are overlapping
    static getOverlap(boundsA, boundsB) {
        const overlapX = Math.min(boundsA.right, boundsB.right) - Math.max(boundsA.left, boundsB.left);
        const overlapY = Math.min(boundsA.bottom, boundsB.bottom) - Math.max(boundsA.top, boundsB.top);

        return { overlapX, overlapY };
    }

    // Main function to stop objects from passing through each other
    // It moves objectA out of objectB using the smallest overlap
    static resolve(objectA, objectB) {
        const boundsA = objectA.getBounds();
        const boundsB = objectB.getBounds();

        // If there is no collision, do nothing
        if (!this.rectCollision(boundsA, boundsB)) return;

        const { overlapX, overlapY } = this.getOverlap(boundsA, boundsB);

        // Check if the collision is more horizontal or vertical
        if (overlapX < overlapY) {
            // Horizontal: move object left or right
            if (objectA.position.x < objectB.position.x) {
                objectA.position.x -= overlapX;
            } else { objectA.position.x += overlapX; }

            objectA.velocity.x = 0;

        } else {
            // Vertical: move object up or down
            if (objectA.position.y < objectB.position.y) {
                objectA.position.y -= overlapY;
            } else { objectA.position.y += overlapY }

            objectA.velocity.y = 0;
        }
    }
}