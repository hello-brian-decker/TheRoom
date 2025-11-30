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
 */

import { Vector3 } from '../../math/Vector3.js';

export class Sphere {
    constructor(radius = 0.5) {
        this.radius = radius;
        this.center = new Vector3(); // World-space center (updated each frame)
        this.body = null; // Reference to physics body
    }

    /**
     * Set radius
     */
    setRadius(radius) {
        this.radius = radius;
    }

    /**
     * Get radius
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
     * Mathematical: |p - c| ≤ r
     */
    containsPoint(point) {
        const distanceSq = point.distanceToSquared(this.center);
        return distanceSq <= this.radius * this.radius;
    }

    /**
     * Check if this sphere intersects another sphere
     * Mathematical: Two spheres intersect if distance between centers ≤ sum of radii
     * |c1 - c2| ≤ r1 + r2
     */
    intersectsSphere(other) {
        const distance = this.center.distanceTo(other.center);
        return distance <= (this.radius + other.radius);
    }

    /**
     * Get intersection with another sphere
     * Returns penetration depth and normal
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
     * Mathematical: V = (4/3) * π * r³
     */
    getVolume() {
        return (4 / 3) * Math.PI * this.radius * this.radius * this.radius;
    }

    /**
     * Clone this sphere
     */
    clone() {
        return new Sphere(this.radius);
    }
}

