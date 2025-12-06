/**
 * Box - Axis-Aligned Bounding Box (AABB) Collision Shape
 * 
 * A box-shaped collision volume aligned with the coordinate axes.
 * Fast collision detection but limited to axis-aligned orientations.
 * 
 * Mathematical Foundation:
 * An AABB is defined by minimum and maximum points:
 * min = (x_min, y_min, z_min)
 * max = (x_max, y_max, z_max)
 * 
 * A point p is inside the box if:
 * x_min ≤ p.x ≤ x_max AND y_min ≤ p.y ≤ y_max AND z_min ≤ p.z ≤ z_max
 * 
 * @example
 * // Create a 2x2x2 box (half extents are 1x1x1)
 * const box = new Box(new Vector3(1, 1, 1));
 * 
 * // Attach to body
 * body.collisionShape = box;
 * box.body = body;
 */
import { Vector3 } from '../../math/Vector3.js';

export class Box {
    /**
     * Creates a new Box collision shape
     * 
     * @param {Vector3} [halfExtents] - Half extents (half width, half height, half depth). Defaults to (0.5, 0.5, 0.5)
     */
    constructor(halfExtents) {
        /** @type {Vector3} Half extents (half width, half height, half depth) */
        this.halfExtents = halfExtents ? halfExtents.clone() : new Vector3(0.5, 0.5, 0.5);
        
        /** @type {Vector3} World-space minimum point (updated each frame) */
        this.min = new Vector3();
        
        /** @type {Vector3} World-space maximum point (updated each frame) */
        this.max = new Vector3();
        
        /** @type {Body|null} Reference to physics body */
        this.body = null;
    }

    /**
     * Set half extents
     * 
     * @param {Vector3} halfExtents - New half extents
     * @example
     * box.setHalfExtents(new Vector3(2, 1, 1)); // 4x2x2 box
     */
    setHalfExtents(halfExtents) {
        this.halfExtents.copy(halfExtents);
    }

    /**
     * Get half extents
     * 
     * @returns {Vector3} Current half extents
     */
    getHalfExtents() {
        return this.halfExtents;
    }

    /**
     * Update world-space bounding box
     * @param {Vector3} position - World position
     * @param {Quaternion} rotation - World rotation (ignored for AABB)
     * @param {Vector3} scale - World scale
     */
    updateBounds(position, rotation, scale) {
        const sx = this.halfExtents.x * scale.x;
        const sy = this.halfExtents.y * scale.y;
        const sz = this.halfExtents.z * scale.z;

        this.min.set(
            position.x - sx,
            position.y - sy,
            position.z - sz
        );

        this.max.set(
            position.x + sx,
            position.y + sy,
            position.z + sz
        );
    }

    /**
     * Check if point is inside box
     * 
     * @param {Vector3} point - Point to test
     * @returns {boolean} True if point is inside box
     * @example
     * if (box.containsPoint(point)) {
     *     console.log('Point is inside box');
     * }
     */
    containsPoint(point) {
        return (
            point.x >= this.min.x && point.x <= this.max.x &&
            point.y >= this.min.y && point.y <= this.max.y &&
            point.z >= this.min.z && point.z <= this.max.z
        );
    }

    /**
     * Check if this box intersects another box
     * 
     * Mathematical: Two AABBs intersect if they overlap on all axes
     * 
     * @param {Box} other - Other box to test
     * @returns {boolean} True if boxes intersect
     */
    intersectsBox(other) {
        return (
            this.min.x <= other.max.x && this.max.x >= other.min.x &&
            this.min.y <= other.max.y && this.max.y >= other.min.y &&
            this.min.z <= other.max.z && this.max.z >= other.min.z
        );
    }

    /**
     * Get intersection with another box
     * 
     * Calculates penetration depth, collision normal, and contact point.
     * 
     * @param {Box} other - Other box to test
     * @returns {Object|null} Intersection data with penetration, normal, contactPoint, or null if no intersection
     */
    getIntersection(other) {
        if (!this.intersectsBox(other)) {
            return null;
        }

        // Calculate overlap on each axis
        const overlapX = Math.min(this.max.x, other.max.x) - Math.max(this.min.x, other.min.x);
        const overlapY = Math.min(this.max.y, other.max.y) - Math.max(this.min.y, other.min.y);
        const overlapZ = Math.min(this.max.z, other.max.z) - Math.max(this.min.z, other.min.z);

        // Find minimum overlap (separation axis)
        let minOverlap = overlapX;
        let normal = new Vector3(1, 0, 0);

        if (overlapY < minOverlap) {
            minOverlap = overlapY;
            normal.set(0, 1, 0);
        }

        if (overlapZ < minOverlap) {
            minOverlap = overlapZ;
            normal.set(0, 0, 1);
        }

        // Determine normal direction (point from this to other)
        const centerA = new Vector3().addVectors(this.min, this.max).multiplyScalar(0.5);
        const centerB = new Vector3().addVectors(other.min, other.max).multiplyScalar(0.5);
        const direction = new Vector3().subVectors(centerB, centerA);

        if (direction.dot(normal) < 0) {
            normal.negate();
        }

        return {
            penetration: minOverlap,
            normal: normal,
            contactPoint: new Vector3().addVectors(centerA, centerB).multiplyScalar(0.5)
        };
    }

    /**
     * Get volume
     * 
     * Calculates the volume of the box.
     * 
     * @returns {number} Volume in cubic units
     */
    getVolume() {
        const size = new Vector3().subVectors(this.max, this.min);
        return size.x * size.y * size.z;
    }

    /**
     * Clone this box
     * 
     * Creates a copy of the box with the same half extents.
     * 
     * @returns {Box} New Box instance
     */
    clone() {
        return new Box(this.halfExtents);
    }
}

