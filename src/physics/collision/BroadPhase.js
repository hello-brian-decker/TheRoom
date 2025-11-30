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
 */

import { SpatialGrid } from '../spatial/SpatialGrid.js';
import { BVH } from '../spatial/BVH.js';

export class BroadPhase {
    constructor(method = 'grid') {
        this.method = method; // 'grid', 'bvh', 'brute'
        this.spatialGrid = null;
        this.bvh = null;
        this.bounds = null;
    }

    /**
     * Initialize with bounds
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
     * Returns array of [bodyA, bodyB] pairs
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
     */
    getStats() {
        if (this.method === 'grid' && this.spatialGrid) {
            return this.spatialGrid.getStats();
        }
        return {};
    }
}

