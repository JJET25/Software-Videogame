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

        if (!this.rectCollision(boundsA, boundsB)) return;

        const { overlapX, overlapY } = this.getOverlap(boundsA, boundsB);

        // Use hitbox centres for push direction — entity.position is the
        // sprite centre which can differ from the hitbox centre (e.g. Player
        // has a 16 px downward hitbox offset), so comparing positions directly
        // gives the wrong push direction when the hitbox is offset.
        if (overlapX < overlapY) {
            const cAx = (boundsA.left + boundsA.right)  / 2;
            const cBx = (boundsB.left + boundsB.right)  / 2;
            objectA.position.x += cAx < cBx ? -overlapX : overlapX;
            objectA.velocity.x  = 0;
        } else {
            const cAy = (boundsA.top  + boundsA.bottom) / 2;
            const cBy = (boundsB.top  + boundsB.bottom) / 2;
            objectA.position.y += cAy < cBy ? -overlapY : overlapY;
            objectA.velocity.y  = 0;
        }
    }
}