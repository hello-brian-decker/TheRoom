/**
 * BroadPhase - Broad Phase Collision Detection
 * 
 * Quickly eliminates pairs of objects that cannot possibly collide.
 * Uses spatial partitioning to reduce O(n²) checks to O(n + k) where k is potential pairs.
 * 
 * Mathematical Foundation:
 * - Sweep and Prune: Sort objects by axis, check overlapping intervals
 * - Spatial Hashing: Hash objects into grid cells, check objects in same cells
 * - BVH/Octree: Use tree structures to quickly eliminate distant objects
 * 
 * Complexity:
 * - Brute force: O(n²)
 * - With spatial partitioning: O(n + k) where k << n²
 * 
 * @example
 * // Create broad phase with spatial grid
 * const broadPhase = new BroadPhase('grid');
 * broadPhase.initialize({ min: new Vector3(-50, -50, -50), max: new Vector3(50, 50, 50) }, 2.0);
 * 
 * // Update with objects
 * broadPhase.update(bodies);
 * 
 * // Get potential collision pairs
 * const pairs = broadPhase.getPotentialPairs(bodies);
 */
import { SpatialGrid } from '../spatial/SpatialGrid.js';
import { BVH } from '../spatial/BVH.js';

export class BroadPhase {
    /**
     * Creates a new BroadPhase collision detector
     * 
     * @param {string} [method='grid'] - Broad phase method: 'grid', 'bvh', or 'brute'
     */
    constructor(method = 'grid') {
        /** @type {string} Broad phase method being used */
        this.method = method;
        
        /** @type {SpatialGrid|null} Spatial grid instance (if using grid method) */
        this.spatialGrid = null;
        
        /** @type {BVH|null} BVH instance (if using BVH method) */
        this.bvh = null;
        
        /** @type {Object|null} World bounds */
        this.bounds = null;
    }

    /**
     * Initialize broad phase with world bounds
     * 
     * Sets up the spatial partitioning structure based on the chosen method.
     * Must be called before using the broad phase.
     * 
     * @param {Object} bounds - World bounds with min and max Vector3 properties
     * @param {number} [cellSize=2.0] - Cell size for spatial grid (only used with 'grid' method)
     * @example
     * broadPhase.initialize(
     *     { min: new Vector3(-100, -100, -100), max: new Vector3(100, 100, 100) },
     *     2.0
     * );
     */
    initialize(bounds, cellSize = 2.0) {
        this.bounds = bounds;

        if (this.method === 'grid') {
            this.spatialGrid = new SpatialGrid(bounds, cellSize);
        } else if (this.method === 'bvh') {
            this.bvh = new BVH();
        }
    }

    /**
     * Update broad phase (insert/update objects)
     * 
     * Updates the spatial partitioning structure with current object positions.
     * Should be called every frame before collision detection.
     * 
     * @param {Array<Body>} objects - Array of physics bodies to update
     * @example
     * broadPhase.update(world.bodies);
     */
    update(objects) {
        if (this.method === 'grid' && this.spatialGrid) {
            this.spatialGrid.clear();
            for (const obj of objects) {
                this.spatialGrid.insert(obj);
            }
        } else if (this.method === 'bvh' && this.bvh) {
            this.bvh.build(objects);
        }
    }

    /**
     * Get potential collision pairs
     * 
     * Returns pairs of objects that might be colliding based on spatial proximity.
     * These pairs should be tested in narrow phase for actual collision.
     * 
     * @param {Array<Body>} objects - Array of physics bodies
     * @returns {Array<Array<Body>>} Array of [bodyA, bodyB] pairs
     * @example
     * const pairs = broadPhase.getPotentialPairs(bodies);
     * for (const [bodyA, bodyB] of pairs) {
     *     // Test for actual collision in narrow phase
     * }
     */
    getPotentialPairs(objects) {
        const pairs = [];

        if (this.method === 'brute') {
            // Brute force: check all pairs
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    const bodyA = objects[i];
                    const bodyB = objects[j];

                    // Skip if collision filtering says they shouldn't collide
                    if (!this.shouldCollide(bodyA, bodyB)) {
                        continue;
                    }

                    // Quick AABB check
                    if (this.aabbIntersect(bodyA, bodyB)) {
                        pairs.push([bodyA, bodyB]);
                    }
                }
            }
        } else if (this.method === 'grid' && this.spatialGrid) {
            // Use spatial grid
            const checkedPairs = new Set();

            for (const obj of objects) {
                const bbox = obj.getBoundingBox();
                const candidates = this.spatialGrid.query(bbox);

                for (const candidate of candidates) {
                    if (obj === candidate) continue;

                    // Create unique pair key
                    const pairKey = obj < candidate ? `${obj}-${candidate}` : `${candidate}-${obj}`;
                    if (checkedPairs.has(pairKey)) continue;
                    checkedPairs.add(pairKey);

                    if (!this.shouldCollide(obj, candidate)) continue;

                    if (this.aabbIntersect(obj, candidate)) {
                        pairs.push([obj, candidate]);
                    }
                }
            }
        } else if (this.method === 'bvh' && this.bvh) {
            // Use BVH
            const checkedPairs = new Set();

            for (const obj of objects) {
                const bbox = obj.getBoundingBox();
                const candidates = this.bvh.query(bbox);

                for (const candidate of candidates) {
                    if (obj === candidate) continue;

                    const pairKey = obj < candidate ? `${obj}-${candidate}` : `${candidate}-${obj}`;
                    if (checkedPairs.has(pairKey)) continue;
                    checkedPairs.add(pairKey);

                    if (!this.shouldCollide(obj, candidate)) continue;

                    pairs.push([obj, candidate]);
                }
            }
        }

        return pairs;
    }

    /**
     * Check if two bodies should collide based on collision groups
     * 
     * Uses collision groups and masks to filter collisions.
     * Bodies only collide if their groups match each other's masks.
     * 
     * @param {Body} bodyA - First body
     * @param {Body} bodyB - Second body
     * @returns {boolean} True if bodies should collide
     * @example
     * // Set collision groups
     * bodyA.collisionGroup = 1; // Group 1
     * bodyA.collisionMask = 2;   // Can collide with group 2
     * bodyB.collisionGroup = 2; // Group 2
     * bodyB.collisionMask = 1;   // Can collide with group 1
     * // These bodies will collide
     */
    shouldCollide(bodyA, bodyB) {
        // Check collision groups/masks
        const groupA = bodyA.collisionGroup || 1;
        const groupB = bodyB.collisionGroup || 1;
        const maskA = bodyA.collisionMask !== undefined ? bodyA.collisionMask : -1;
        const maskB = bodyB.collisionMask !== undefined ? bodyB.collisionMask : -1;

        return (groupA & maskB) !== 0 && (groupB & maskA) !== 0;
    }

    /**
     * Quick AABB intersection test
     * 
     * Tests if two bodies' axis-aligned bounding boxes intersect.
     * Used as a quick rejection test in broad phase.
     * 
     * @param {Body} bodyA - First body
     * @param {Body} bodyB - Second body
     * @returns {boolean} True if AABBs intersect
     * @example
     * if (broadPhase.aabbIntersect(bodyA, bodyB)) {
     *     // Bodies might be colliding, test in narrow phase
     * }
     */
    aabbIntersect(bodyA, bodyB) {
        try {
            const bboxA = bodyA.getBoundingBox();
            const bboxB = bodyB.getBoundingBox();
            
            if (!bboxA || !bboxB || !bboxA.min || !bboxA.max || !bboxB.min || !bboxB.max) {
                return false;
            }

            return (
                bboxA.min.x <= bboxB.max.x && bboxA.max.x >= bboxB.min.x &&
                bboxA.min.y <= bboxB.max.y && bboxA.max.y >= bboxB.min.y &&
                bboxA.min.z <= bboxB.max.z && bboxA.max.z >= bboxB.min.z
            );
        } catch (error) {
            console.warn('Error in aabbIntersect:', error);
            return false;
        }
    }

    /**
     * Get statistics
     * 
     * Returns performance and usage statistics for the broad phase.
     * 
     * @returns {Object} Statistics object (contents depend on method)
     * @example
     * const stats = broadPhase.getStats();
     * console.log(`Used cells: ${stats.usedCells}`);
     */
    getStats() {
        if (this.method === 'grid' && this.spatialGrid) {
            return this.spatialGrid.getStats();
        }
        return {};
    }
}

