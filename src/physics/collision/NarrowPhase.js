/**
 * NarrowPhase - Narrow Phase Collision Detection
 * 
 * Performs precise collision detection on pairs identified by broad phase.
 * Determines contact points, normals, and penetration depths.
 * 
 * Mathematical Foundation:
 * - SAT (Separating Axis Theorem): For convex shapes, if there exists an axis
 *   where projections don't overlap, shapes don't intersect
 * - GJK (Gilbert-Johnson-Keerthi): Uses Minkowski difference to find closest points
 * - EPA (Expanding Polytope Algorithm): Finds penetration depth and contact normal
 * 
 * Algorithms:
 * - Box-Box: SAT
 * - Sphere-Sphere: Distance check
 * - Sphere-Box: Closest point on box
 * - Mesh-Mesh: Triangle-triangle intersection (expensive)
 * 
 * @example
 * const narrowPhase = new NarrowPhase();
 * const contact = narrowPhase.checkCollision(bodyA, bodyB);
 * if (contact) {
 *     console.log(`Penetration: ${contact.penetration}`);
 * }
 */
import { Vector3 } from '../math/Vector3.js';
import { Box } from './shapes/Box.js';
import { Sphere } from './shapes/Sphere.js';

export class NarrowPhase {
    /**
     * Check collision between two bodies
     * 
     * Performs precise collision detection and returns contact information
     * if a collision is detected. Dispatches to appropriate collision function
     * based on shape types.
     * 
     * @param {Body} bodyA - First physics body
     * @param {Body} bodyB - Second physics body
     * @returns {Object|null} Contact information with normal, penetration, contactPoint, or null if no collision
     * @example
     * const contact = narrowPhase.checkCollision(bodyA, bodyB);
     * if (contact) {
     *     // Bodies are colliding
     *     console.log(`Normal: ${contact.normal}, Penetration: ${contact.penetration}`);
     * }
     */
    checkCollision(bodyA, bodyB) {
        const shapeA = bodyA.collisionShape;
        const shapeB = bodyB.collisionShape;

        if (!shapeA || !shapeB) {
            return null;
        }

        // Update shape bounds (ensure they're current)
        if (shapeA.updateBounds) {
            shapeA.updateBounds(bodyA.position, bodyA.rotation, bodyA.scale);
        }
        if (shapeB.updateBounds) {
            shapeB.updateBounds(bodyB.position, bodyB.rotation, bodyB.scale);
        }
        if (shapeA.updateCenter) {
            shapeA.updateCenter(bodyA.position);
        }
        if (shapeB.updateCenter) {
            shapeB.updateCenter(bodyB.position);
        }

        // Dispatch to appropriate collision function
        if (shapeA instanceof Box && shapeB instanceof Box) {
            return this.boxBoxCollision(shapeA, shapeB);
        } else if (shapeA instanceof Sphere && shapeB instanceof Sphere) {
            return this.sphereSphereCollision(shapeA, shapeB);
        } else if (shapeA instanceof Box && shapeB instanceof Sphere) {
            return this.boxSphereCollision(shapeA, shapeB);
        } else if (shapeA instanceof Sphere && shapeB instanceof Box) {
            const contact = this.boxSphereCollision(shapeB, shapeA);
            if (contact) {
                contact.normal.negate();
                // Swap bodies
                const temp = contact.bodyA;
                contact.bodyA = contact.bodyB;
                contact.bodyB = temp;
            }
            return contact;
        }

        // Fallback: use bounding box intersection
        return this.fallbackCollision(bodyA, bodyB);
    }

    /**
     * Box-Box collision using SAT (Separating Axis Theorem)
     * 
     * Tests collision between two box shapes using the Separating Axis Theorem.
     * 
     * Mathematical:
     * For each axis (6 face normals + 9 edge cross products = 15 axes):
     * - Project both boxes onto axis
     * - Check if projections overlap
     * - If any axis has no overlap, boxes don't intersect
     * 
     * @param {Box} boxA - First box shape
     * @param {Box} boxB - Second box shape
     * @returns {Object|null} Contact information or null if no collision
     * @private
     */
    boxBoxCollision(boxA, boxB) {
        const intersection = boxA.getIntersection(boxB);
        if (!intersection) {
            return null;
        }

        return {
            bodyA: boxA.body || null,
            bodyB: boxB.body || null,
            normal: intersection.normal,
            penetration: intersection.penetration,
            contactPoint: intersection.contactPoint
        };
    }

    /**
     * Sphere-Sphere collision
     * 
     * Tests collision between two sphere shapes using distance calculation.
     * 
     * Mathematical:
     * Distance between centers: d = |c1 - c2|
     * Intersection if: d < r1 + r2
     * Penetration: p = (r1 + r2) - d
     * 
     * @param {Sphere} sphereA - First sphere shape
     * @param {Sphere} sphereB - Second sphere shape
     * @returns {Object|null} Contact information or null if no collision
     * @private
     */
    sphereSphereCollision(sphereA, sphereB) {
        const intersection = sphereA.getIntersection(sphereB);
        if (!intersection) {
            return null;
        }

        return {
            bodyA: sphereA.body || null,
            bodyB: sphereB.body || null,
            normal: intersection.normal,
            penetration: intersection.penetration,
            contactPoint: intersection.contactPoint
        };
    }

    /**
     * Box-Sphere collision
     * 
     * Tests collision between a box and a sphere by finding the closest
     * point on the box to the sphere center.
     * 
     * @param {Box} box - Box shape
     * @param {Sphere} sphere - Sphere shape
     * @returns {Object|null} Contact information or null if no collision
     * @private
     */
    boxSphereCollision(box, sphere) {
        // Ensure box bounds are updated
        if (!box.min || !box.max) {
            console.warn('Box bounds not initialized');
            return null;
        }
        
        // Verify bounds are valid
        if (box.min.y > box.max.y || box.min.x > box.max.x || box.min.z > box.max.z) {
            console.warn('Invalid box bounds:', box.min, box.max);
            return null;
        }
        
        // Find closest point on box to sphere center
        const closestPoint = new Vector3(
            Math.max(box.min.x, Math.min(sphere.center.x, box.max.x)),
            Math.max(box.min.y, Math.min(sphere.center.y, box.max.y)),
            Math.max(box.min.z, Math.min(sphere.center.z, box.max.z))
        );

        const distanceSq = closestPoint.distanceToSquared(sphere.center);
        const radiusSq = sphere.radius * sphere.radius;

        if (distanceSq > radiusSq) {
            return null; // No collision
        }

        const distance = Math.sqrt(distanceSq);
        const penetration = sphere.radius - distance;

        // Normal points from box to sphere
        // For ground collisions, this should point upward (positive Y)
        let normal;
        if (distance < 0.0001) {
            // Sphere center is inside box, use direction from box center to sphere center
            const boxCenter = new Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);
            normal = new Vector3().subVectors(sphere.center, boxCenter);
            if (normal.lengthSq() < 0.0001) {
                // If sphere is exactly at center, use up vector
                normal.set(0, 1, 0);
            } else {
                normal.normalize();
            }
        } else {
            normal = new Vector3().subVectors(sphere.center, closestPoint);
            const normalLength = normal.length();
            if (normalLength < 0.0001) {
                normal.set(0, 1, 0); // Default to up
            } else {
                normal.normalize();
            }
        }
        
        // For ground (box is static/ground), ensure normal points up if sphere is above
        // This handles the case where sphere hits the top surface of the box
        if (sphere.center.y > box.max.y - 0.01 && normal.y < 0) {
            normal.set(0, 1, 0); // Force upward normal for top surface collision
        }

        return {
            bodyA: box.body || null,
            bodyB: sphere.body || null,
            normal: normal,
            penetration: Math.max(penetration, 0.01), // Ensure minimum penetration
            contactPoint: closestPoint
        };
    }

    /**
     * Fallback collision detection using bounding boxes
     * 
     * Used when no specific collision function exists for the shape combination.
     * Performs a simple AABB intersection test.
     * 
     * @param {Body} bodyA - First body
     * @param {Body} bodyB - Second body
     * @returns {Object|null} Contact information or null if no collision
     * @private
     */
    fallbackCollision(bodyA, bodyB) {
        const bboxA = bodyA.getBoundingBox();
        const bboxB = bodyB.getBoundingBox();

        // Check intersection
        if (
            bboxA.min.x > bboxB.max.x || bboxA.max.x < bboxB.min.x ||
            bboxA.min.y > bboxB.max.y || bboxA.max.y < bboxB.min.y ||
            bboxA.min.z > bboxB.max.z || bboxA.max.z < bboxB.min.z
        ) {
            return null;
        }

        // Calculate penetration and normal
        const centerA = new Vector3().addVectors(bboxA.min, bboxA.max).multiplyScalar(0.5);
        const centerB = new Vector3().addVectors(bboxB.min, bboxB.max).multiplyScalar(0.5);
        const direction = new Vector3().subVectors(centerB, centerA);

        // Find minimum overlap axis
        const overlapX = Math.min(bboxA.max.x, bboxB.max.x) - Math.max(bboxA.min.x, bboxB.min.x);
        const overlapY = Math.min(bboxA.max.y, bboxB.max.y) - Math.max(bboxA.min.y, bboxB.min.y);
        const overlapZ = Math.min(bboxA.max.z, bboxB.max.z) - Math.max(bboxA.min.z, bboxB.min.z);

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

        // Set normal direction
        if (direction.dot(normal) < 0) {
            normal.negate();
        }

        return {
            bodyA: bodyA,
            bodyB: bodyB,
            normal: normal,
            penetration: minOverlap,
            contactPoint: centerA.clone().add(centerB).multiplyScalar(0.5)
        };
    }
}

