/**
 * CollisionDetector - Main Collision Detection System
 * 
 * Coordinates broad phase and narrow phase collision detection.
 * This is the main interface for collision detection in the physics engine.
 * 
 * Process:
 * 1. Broad phase: Quickly eliminate impossible pairs (O(n²) -> O(n + k))
 * 2. Narrow phase: Precise collision detection on remaining pairs
 * 3. Generate contacts: Create contact information for collision resolution
 * 
 * @example
 * // Create collision detector
 * const detector = new CollisionDetector('grid');
 * detector.initialize({ min: new Vector3(-50, -50, -50), max: new Vector3(50, 50, 50) });
 * 
 * // Detect collisions
 * const contacts = detector.detectCollisions(world.bodies);
 */
import { BroadPhase } from './BroadPhase.js';
import { NarrowPhase } from './NarrowPhase.js';

export class CollisionDetector {
    /**
     * Creates a new CollisionDetector
     * 
     * @param {string} [broadPhaseMethod='grid'] - Broad phase method: 'grid', 'bvh', or 'brute'
     */
    constructor(broadPhaseMethod = 'grid') {
        /** @type {BroadPhase} Broad phase collision detector */
        this.broadPhase = new BroadPhase(broadPhaseMethod);
        
        /** @type {NarrowPhase} Narrow phase collision detector */
        this.narrowPhase = new NarrowPhase();
        
        /** @type {Array<Object>} Array of detected contacts */
        this.contacts = [];
    }

    /**
     * Initialize collision detector with world bounds
     * 
     * @param {Object} bounds - World bounds with min and max Vector3 properties
     * @param {number} [cellSize=2.0] - Cell size for spatial grid
     * @example
     * detector.initialize(
     *     { min: new Vector3(-100, -100, -100), max: new Vector3(100, 100, 100) },
     *     2.0
     * );
     */
    initialize(bounds, cellSize = 2.0) {
        this.broadPhase.initialize(bounds, cellSize);
    }

    /**
     * Detect all collisions in the world
     * 
     * Performs both broad phase and narrow phase collision detection,
     * returning an array of contact objects for collision resolution.
     * 
     * @param {Array<Body>} bodies - Array of physics bodies
     * @returns {Array<Object>} Array of contact objects with bodyA, bodyB, normal, penetration, contactPoint
     * @example
     * const contacts = detector.detectCollisions(world.bodies);
     * for (const contact of contacts) {
     *     console.log(`Collision between bodies at ${contact.contactPoint}`);
     * }
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
     * 
     * Returns collision detection statistics including number of contacts.
     * 
     * @returns {Object} Statistics object with contact count
     * @example
     * const stats = detector.getStats();
     * console.log(`Contacts: ${stats.contacts}`);
     */
    getStats() {
        return {
            contacts: this.contacts.length
        };
    }
}

