/**
 * CollisionDetector - Main Collision Detection System
 * 
 * Coordinates broad phase and narrow phase collision detection.
 * 
 * Process:
 * 1. Broad phase: Quickly eliminate impossible pairs (O(n²) -> O(n + k))
 * 2. Narrow phase: Precise collision detection on remaining pairs
 * 3. Generate contacts: Create contact information for collision resolution
 */

import { BroadPhase } from './BroadPhase.js';
import { NarrowPhase } from './NarrowPhase.js';

export class CollisionDetector {
    constructor(broadPhaseMethod = 'grid') {
        this.broadPhase = new BroadPhase(broadPhaseMethod);
        this.narrowPhase = new NarrowPhase();
        this.contacts = [];
    }

    /**
     * Initialize collision detector
     */
    initialize(bounds, cellSize = 2.0) {
        this.broadPhase.initialize(bounds, cellSize);
    }

    /**
     * Detect all collisions in the world
     * @param {Array} bodies - Array of physics bodies
     * @returns {Array} Array of contact objects
     */
    detectCollisions(bodies) {
        this.contacts = [];

        // Filter out bodies without collision shapes
        const collidableBodies = bodies.filter(body => body.collisionShape);

        if (collidableBodies.length < 2) {
            return this.contacts;
        }

        // Update broad phase
        this.broadPhase.update(collidableBodies);

        // Get potential collision pairs from broad phase
        const potentialPairs = this.broadPhase.getPotentialPairs(collidableBodies);

        // Narrow phase: precise collision detection
        for (const [bodyA, bodyB] of potentialPairs) {
            const contact = this.narrowPhase.checkCollision(bodyA, bodyB);
            if (contact) {
                contact.bodyA = bodyA;
                contact.bodyB = bodyB;
                this.contacts.push(contact);
            }
        }

        return this.contacts;
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            contacts: this.contacts.length
        };
    }
}

