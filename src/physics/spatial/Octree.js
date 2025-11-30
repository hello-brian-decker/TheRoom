/**
 * Octree - 3D Space Subdivision Tree
 * 
 * Recursively subdivides 3D space into 8 octants.
 * Each node has 8 children representing the 8 octants.
 * 
 * Mathematical Foundation:
 * - Space is divided at each level into 8 equal octants
 * - Each octant is a cube: (x±size/2, y±size/2, z±size/2)
 * - Objects are stored in the smallest node that contains them
 * 
 * Complexity:
 * - Query: O(log n + k) where k is objects in result
 * - Insert: O(log n)
 * - Space: O(n)
 */

import { Vector3 } from '../math/Vector3.js';

class OctreeNode {
    constructor(bounds, depth = 0, maxDepth = 8) {
        this.bounds = {
            min: bounds.min.clone(),
            max: bounds.max.clone()
        };
        this.center = new Vector3().addVectors(bounds.min, bounds.max).multiplyScalar(0.5);
        this.size = bounds.max.x - bounds.min.x;
        this.depth = depth;
        this.maxDepth = maxDepth;
        this.objects = [];
        this.children = [];
        this.isLeaf = true;
    }

    /**
     * Subdivide into 8 children
     */
    subdivide() {
        if (this.depth >= this.maxDepth) return;
        if (this.children.length > 0) return; // Already subdivided

        const halfSize = this.size / 2;
        const quarterSize = halfSize / 2;

        const childrenBounds = [
            // Bottom front left
            {
                min: new Vector3(this.center.x - quarterSize, this.center.y - quarterSize, this.center.z - quarterSize),
                max: new Vector3(this.center.x + quarterSize, this.center.y + quarterSize, this.center.z + quarterSize)
            },
            // Bottom front right
            {
                min: new Vector3(this.center.x + quarterSize, this.center.y - quarterSize, this.center.z - quarterSize),
                max: new Vector3(this.center.x + halfSize, this.center.y + quarterSize, this.center.z + quarterSize)
            },
            // Bottom back left
            {
                min: new Vector3(this.center.x - quarterSize, this.center.y - quarterSize, this.center.z + quarterSize),
                max: new Vector3(this.center.x + quarterSize, this.center.y + quarterSize, this.center.z + halfSize)
            },
            // Bottom back right
            {
                min: new Vector3(this.center.x + quarterSize, this.center.y - quarterSize, this.center.z + quarterSize),
                max: new Vector3(this.center.x + halfSize, this.center.y + quarterSize, this.center.z + halfSize)
            },
            // Top front left
            {
                min: new Vector3(this.center.x - quarterSize, this.center.y + quarterSize, this.center.z - quarterSize),
                max: new Vector3(this.center.x + quarterSize, this.center.y + halfSize, this.center.z + quarterSize)
            },
            // Top front right
            {
                min: new Vector3(this.center.x + quarterSize, this.center.y + quarterSize, this.center.z - quarterSize),
                max: new Vector3(this.center.x + halfSize, this.center.y + halfSize, this.center.z + quarterSize)
            },
            // Top back left
            {
                min: new Vector3(this.center.x - quarterSize, this.center.y + quarterSize, this.center.z + quarterSize),
                max: new Vector3(this.center.x + quarterSize, this.center.y + halfSize, this.center.z + halfSize)
            },
            // Top back right
            {
                min: new Vector3(this.center.x + quarterSize, this.center.y + quarterSize, this.center.z + quarterSize),
                max: new Vector3(this.center.x + halfSize, this.center.y + halfSize, this.center.z + halfSize)
            }
        ];

        for (const childBounds of childrenBounds) {
            this.children.push(new OctreeNode(childBounds, this.depth + 1, this.maxDepth));
        }

        this.isLeaf = false;
    }

    /**
     * Get which child contains a point
     */
    getChildIndex(point) {
        let index = 0;
        if (point.x >= this.center.x) index |= 1;
        if (point.y >= this.center.y) index |= 2;
        if (point.z >= this.center.z) index |= 4;
        return index;
    }

    /**
     * Check if point is in bounds
     */
    containsPoint(point) {
        return (
            point.x >= this.bounds.min.x && point.x <= this.bounds.max.x &&
            point.y >= this.bounds.min.y && point.y <= this.bounds.max.y &&
            point.z >= this.bounds.min.z && point.z <= this.bounds.max.z
        );
    }

    /**
     * Check if bounding box intersects this node
     */
    intersectsBounds(bbox) {
        return (
            bbox.min.x <= this.bounds.max.x && bbox.max.x >= this.bounds.min.x &&
            bbox.min.y <= this.bounds.max.y && bbox.max.y >= this.bounds.min.y &&
            bbox.min.z <= this.bounds.max.z && bbox.max.z >= this.bounds.min.z
        );
    }
}

export class Octree {
    constructor(bounds, maxObjectsPerNode = 10, maxDepth = 8) {
        this.root = new OctreeNode(bounds, 0, maxDepth);
        this.maxObjectsPerNode = maxObjectsPerNode;
    }

    /**
     * Insert object into octree
     */
    insert(object) {
        this.insertNode(this.root, object);
    }

    /**
     * Recursively insert object into node
     */
    insertNode(node, object) {
        const bbox = object.getBoundingBox();

        if (!node.intersectsBounds(bbox)) {
            return false; // Object doesn't fit in this node
        }

        if (node.isLeaf) {
            node.objects.push(object);

            // Subdivide if too many objects
            if (node.objects.length > this.maxObjectsPerNode && node.depth < node.maxDepth) {
                node.subdivide();

                // Redistribute objects to children
                const objects = [...node.objects];
                node.objects = [];

                for (const obj of objects) {
                    this.insertNode(node, obj);
                }
            }

            return true;
        } else {
            // Try to insert into children
            let inserted = false;
            for (const child of node.children) {
                if (this.insertNode(child, object)) {
                    inserted = true;
                    // Object can span multiple children, so don't break
                }
            }

            // If object spans multiple children or doesn't fit, store in parent
            if (!inserted || this.objectSpansChildren(node, bbox)) {
                node.objects.push(object);
                inserted = true;
            }

            return inserted;
        }
    }

    /**
     * Check if object spans multiple children
     */
    objectSpansChildren(node, bbox) {
        let childCount = 0;
        for (const child of node.children) {
            if (child.intersectsBounds(bbox)) {
                childCount++;
            }
        }
        return childCount > 1;
    }

    /**
     * Query objects in region
     */
    query(bbox) {
        const results = [];
        this.queryNode(this.root, bbox, results);
        return results;
    }

    /**
     * Recursively query node
     */
    queryNode(node, bbox, results) {
        if (!node.intersectsBounds(bbox)) {
            return; // No intersection
        }

        // Add objects in this node
        for (const obj of node.objects) {
            const objBbox = obj.getBoundingBox();
            if (this.intersectsBounds(objBbox, bbox)) {
                results.push(obj);
            }
        }

        // Query children
        if (!node.isLeaf) {
            for (const child of node.children) {
                this.queryNode(child, bbox, results);
            }
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
     * Remove object
     */
    remove(object) {
        this.removeNode(this.root, object);
    }

    /**
     * Recursively remove object from node
     */
    removeNode(node, object) {
        const index = node.objects.indexOf(object);
        if (index !== -1) {
            node.objects.splice(index, 1);
        }

        if (!node.isLeaf) {
            for (const child of node.children) {
                this.removeNode(child, object);
            }
        }
    }

    /**
     * Clear octree
     */
    clear() {
        this.root = new OctreeNode(this.root.bounds, 0, this.root.maxDepth);
    }
}

