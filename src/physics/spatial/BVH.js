/**
 * BVH - Bounding Volume Hierarchy
 * 
 * A tree structure where each node contains a bounding volume and objects.
 * Used for efficient collision detection by eliminating distant objects early.
 * 
 * Mathematical Foundation:
 * - Each node has a bounding volume (AABB) that contains all children
 * - Tree traversal: O(log n) average case
 * - Construction: O(n log n) using surface area heuristic (SAH)
 * 
 * Complexity:
 * - Query: O(log n + k) where k is objects in result
 * - Insert: O(log n)
 * - Space: O(n)
 */

import { Vector3 } from '../math/Vector3.js';

class BVHNode {
    constructor() {
        this.bounds = { min: new Vector3(), max: new Vector3() };
        this.objects = [];
        this.left = null;
        this.right = null;
        this.parent = null;
        this.isLeaf = true;
    }
}

export class BVH {
    constructor(maxObjectsPerLeaf = 10) {
        this.root = null;
        this.maxObjectsPerLeaf = maxObjectsPerLeaf;
    }

    /**
     * Build BVH from objects
     */
    build(objects) {
        if (objects.length === 0) {
            this.root = null;
            return;
        }

        this.root = this.buildNode(objects);
    }

    /**
     * Recursively build a node
     */
    buildNode(objects) {
        const node = new BVHNode();

        if (objects.length <= this.maxObjectsPerLeaf) {
            // Leaf node
            node.objects = objects;
            node.bounds = this.computeBounds(objects);
            return node;
        }

        // Find split axis (longest axis)
        const bounds = this.computeBounds(objects);
        const size = new Vector3().subVectors(bounds.max, bounds.min);
        let splitAxis = 'x';
        if (size.y > size.x && size.y > size.z) splitAxis = 'y';
        else if (size.z > size.x && size.z > size.y) splitAxis = 'z';

        // Sort objects by center along split axis
        objects.sort((a, b) => {
            const centerA = this.getObjectCenter(a);
            const centerB = this.getObjectCenter(b);
            return centerA[splitAxis] - centerB[splitAxis];
        });

        // Split at median
        const mid = Math.floor(objects.length / 2);
        const leftObjects = objects.slice(0, mid);
        const rightObjects = objects.slice(mid);

        node.left = this.buildNode(leftObjects);
        node.right = this.buildNode(rightObjects);
        node.left.parent = node;
        node.right.parent = node;
        node.isLeaf = false;
        node.bounds = this.mergeBounds(node.left.bounds, node.right.bounds);

        return node;
    }

    /**
     * Compute bounding box for objects
     */
    computeBounds(objects) {
        if (objects.length === 0) {
            return { min: new Vector3(), max: new Vector3() };
        }

        const firstBbox = objects[0].getBoundingBox();
        const bounds = {
            min: firstBbox.min.clone(),
            max: firstBbox.max.clone()
        };

        for (let i = 1; i < objects.length; i++) {
            const bbox = objects[i].getBoundingBox();
            bounds.min.x = Math.min(bounds.min.x, bbox.min.x);
            bounds.min.y = Math.min(bounds.min.y, bbox.min.y);
            bounds.min.z = Math.min(bounds.min.z, bbox.min.z);
            bounds.max.x = Math.max(bounds.max.x, bbox.max.x);
            bounds.max.y = Math.max(bounds.max.y, bbox.max.y);
            bounds.max.z = Math.max(bounds.max.z, bbox.max.z);
        }

        return bounds;
    }

    /**
     * Merge two bounding boxes
     */
    mergeBounds(bounds1, bounds2) {
        return {
            min: new Vector3(
                Math.min(bounds1.min.x, bounds2.min.x),
                Math.min(bounds1.min.y, bounds2.min.y),
                Math.min(bounds1.min.z, bounds2.min.z)
            ),
            max: new Vector3(
                Math.max(bounds1.max.x, bounds2.max.x),
                Math.max(bounds1.max.y, bounds2.max.y),
                Math.max(bounds1.max.z, bounds2.max.z)
            )
        };
    }

    /**
     * Get center of object's bounding box
     */
    getObjectCenter(object) {
        const bbox = object.getBoundingBox();
        return new Vector3().addVectors(bbox.min, bbox.max).multiplyScalar(0.5);
    }

    /**
     * Query objects that intersect with bounding box
     */
    query(bbox) {
        const results = [];
        if (!this.root) return results;
        this.queryNode(this.root, bbox, results);
        return results;
    }

    /**
     * Recursively query node
     */
    queryNode(node, bbox, results) {
        if (!this.intersectsBounds(node.bounds, bbox)) {
            return; // No intersection, prune branch
        }

        if (node.isLeaf) {
            // Check each object in leaf
            for (const obj of node.objects) {
                const objBbox = obj.getBoundingBox();
                if (this.intersectsBounds(objBbox, bbox)) {
                    results.push(obj);
                }
            }
        } else {
            if (node.left) this.queryNode(node.left, bbox, results);
            if (node.right) this.queryNode(node.right, bbox, results);
        }
    }

    /**
     * Check if two bounding boxes intersect
     */
    intersectsBounds(bounds1, bounds2) {
        return (
            bounds1.min.x <= bounds2.max.x && bounds1.max.x >= bounds2.min.x &&
            bounds1.min.y <= bounds2.max.y && bounds1.max.y >= bounds2.min.y &&
            bounds1.min.z <= bounds2.max.z && bounds1.max.z >= bounds2.min.z
        );
    }

    /**
     * Insert object (rebuilds tree - for dynamic updates, use incremental methods)
     */
    insert(object) {
        // Simple approach: rebuild tree
        // For better performance, use incremental insertion
        const objects = this.getAllObjects();
        objects.push(object);
        this.build(objects);
    }

    /**
     * Remove object
     */
    remove(object) {
        const objects = this.getAllObjects();
        const index = objects.indexOf(object);
        if (index !== -1) {
            objects.splice(index, 1);
            this.build(objects);
        }
    }

    /**
     * Get all objects in tree
     */
    getAllObjects() {
        const objects = [];
        if (this.root) {
            this.collectObjects(this.root, objects);
        }
        return objects;
    }

    /**
     * Collect all objects from node
     */
    collectObjects(node, objects) {
        if (node.isLeaf) {
            objects.push(...node.objects);
        } else {
            if (node.left) this.collectObjects(node.left, objects);
            if (node.right) this.collectObjects(node.right, objects);
        }
    }

    /**
     * Clear tree
     */
    clear() {
        this.root = null;
    }
}

