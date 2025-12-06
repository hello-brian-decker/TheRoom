/**
 * Sphere - Spherical Collision Shape
 * 
 * A sphere-shaped collision volume defined by a center and radius.
 * Very fast collision detection and works in any orientation.
 * 
 * Mathematical Foundation:
 * A sphere is defined by center c and radius r.
 * A point p is inside the sphere if: |p - c| ≤ r
 * 
 * Distance from point to sphere center: d = |p - c|
 * If d < r: point is inside
 * If d = r: point is on surface
 * If d > r: point is outside
 * 
 * @example
 * // Create a sphere with radius 1.0
 * const sphere = new Sphere(1.0);
 * 
 * // Attach to body
 * body.collisionShape = sphere;
 * sphere.body = body;
 */
import { Vector3 } from '../../math/Vector3.js';

export class Sphere {
    /**
     * Creates a new Sphere collision shape
     * 
     * @param {number} [radius=0.5] - Radius of the sphere
     */
    constructor(radius = 0.5) {
        /** @type {number} Radius of the sphere */
        this.radius = radius;
        
        /** @type {Vector3} World-space center (updated each frame) */
        this.center = new Vector3();
        
        /** @type {Body|null} Reference to physics body */
        this.body = null;
    }

    /**
     * Set radius
     * 
     * @param {number} radius - New radius value
     * @example
     * sphere.setRadius(2.0); // Set radius to 2.0
     */
    setRadius(radius) {
        this.radius = radius;
    }

    /**
     * Get radius
     * 
     * @returns {number} Current radius
     */
    getRadius() {
        return this.radius;
    }

    /**
     * Update world-space center
     * @param {Vector3} position - World position
     */
    updateCenter(position) {
        this.center.copy(position);
    }

    /**
     * Check if point is inside sphere
     * 
     * Mathematical: |p - c| ≤ r
     * 
     * @param {Vector3} point - Point to test
     * @returns {boolean} True if point is inside sphere
     * @example
     * if (sphere.containsPoint(point)) {
     *     console.log('Point is inside sphere');
     * }
     */
    containsPoint(point) {
        const distanceSq = point.distanceToSquared(this.center);
        return distanceSq <= this.radius * this.radius;
    }

    /**
     * Check if this sphere intersects another sphere
     * 
     * Mathematical: Two spheres intersect if distance between centers ≤ sum of radii
     * |c1 - c2| ≤ r1 + r2
     * 
     * @param {Sphere} other - Other sphere to test
     * @returns {boolean} True if spheres intersect
     */
    intersectsSphere(other) {
        const distance = this.center.distanceTo(other.center);
        return distance <= (this.radius + other.radius);
    }

    /**
     * Get intersection with another sphere
     * 
     * Calculates penetration depth, collision normal, and contact point.
     * 
     * @param {Sphere} other - Other sphere to test
     * @returns {Object|null} Intersection data with penetration, normal, contactPoint, or null if no intersection
     */
    getIntersection(other) {
        const distance = this.center.distanceTo(other.center);
        const sumRadii = this.radius + other.radius;

        if (distance >= sumRadii) {
            return null; // No intersection
        }

        const penetration = sumRadii - distance;
        
        // Normal points from this center to other center
        const normal = new Vector3().subVectors(other.center, this.center);
        if (normal.lengthSq() > 0.0001) {
            normal.normalize();
        } else {
            // Spheres are at same position, use arbitrary normal
            normal.set(1, 0, 0);
        }

        // Contact point is on the line between centers, closer to smaller sphere
        const contactPoint = new Vector3().lerpVectors(
            this.center,
            other.center,
            this.radius / sumRadii
        );

        return {
            penetration: penetration,
            normal: normal,
            contactPoint: contactPoint
        };
    }

    /**
     * Check if sphere intersects box (AABB)
     * 
     * Tests collision between sphere and axis-aligned bounding box.
     * 
     * @param {Box} box - Box to test
     * @returns {boolean} True if sphere intersects box
     */
    intersectsBox(box) {
        // Find closest point on box to sphere center
        const closestPoint = new Vector3(
            Math.max(box.min.x, Math.min(this.center.x, box.max.x)),
            Math.max(box.min.y, Math.min(this.center.y, box.max.y)),
            Math.max(box.min.z, Math.min(this.center.z, box.max.z))
        );

        // Check if closest point is inside sphere
        const distanceSq = closestPoint.distanceToSquared(this.center);
        return distanceSq <= this.radius * this.radius;
    }

    /**
     * Get volume
     * 
     * Calculates the volume of the sphere.
     * Mathematical: V = (4/3) * π * r³
     * 
     * @returns {number} Volume in cubic units
     */
    getVolume() {
        return (4 / 3) * Math.PI * this.radius * this.radius * this.radius;
    }

    /**
     * Clone this sphere
     * 
     * Creates a copy of the sphere with the same radius.
     * 
     * @returns {Sphere} New Sphere instance
     */
    clone() {
        return new Sphere(this.radius);
    }
}

