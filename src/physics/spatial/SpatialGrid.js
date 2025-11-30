/**
 * SpatialGrid - Uniform Grid Spatial Partitioning
 * 
 * Divides space into a uniform grid of cells for efficient collision detection.
 * Objects are stored in cells based on their position.
 * 
 * Mathematical Foundation:
 * Grid cell index: (floor(x/cellSize), floor(y/cellSize), floor(z/cellSize))
 * Hash function: hash(i, j, k) = i + j * gridWidth + k * gridWidth * gridHeight
 * 
 * Complexity:
 * - Insertion: O(1) per object
 * - Query: O(1) per cell, O(k) where k is objects in nearby cells
 * - Space: O(n + gridSize³) where n is number of objects
 */

import { Vector3 } from '../math/Vector3.js';

export class SpatialGrid {
    constructor(bounds, cellSize) {
        this.bounds = {
            min: bounds.min.clone(),
            max: bounds.max.clone()
        };
        this.cellSize = cellSize;

        // Calculate grid dimensions
        const size = new Vector3().subVectors(bounds.max, bounds.min);
        this.gridWidth = Math.ceil(size.x / cellSize);
        this.gridHeight = Math.ceil(size.y / cellSize);
        this.gridDepth = Math.ceil(size.z / cellSize);

        // Initialize grid (sparse - only create cells that are used)
        this.grid = new Map();
        this.objectCells = new Map(); // Track which cells each object is in
    }

    /**
     * Get cell coordinates from world position
     */
    getCellCoords(position) {
        const x = Math.floor((position.x - this.bounds.min.x) / this.cellSize);
        const y = Math.floor((position.y - this.bounds.min.y) / this.cellSize);
        const z = Math.floor((position.z - this.bounds.min.z) / this.cellSize);
        return { x, y, z };
    }

    /**
     * Hash cell coordinates to index
     */
    hashCell(x, y, z) {
        // Clamp to valid range
        x = Math.max(0, Math.min(x, this.gridWidth - 1));
        y = Math.max(0, Math.min(y, this.gridHeight - 1));
        z = Math.max(0, Math.min(z, this.gridDepth - 1));
        return `${x},${y},${z}`;
    }

    /**
     * Get cell at coordinates
     */
    getCell(x, y, z) {
        const key = this.hashCell(x, y, z);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        return this.grid.get(key);
    }

    /**
     * Insert object into grid
     * Object must have getBoundingBox() method
     */
    insert(object) {
        // Remove from old cells first
        this.remove(object);

        const bbox = object.getBoundingBox();
        const minCell = this.getCellCoords(bbox.min);
        const maxCell = this.getCellCoords(bbox.max);

        const cells = [];

        // Insert into all cells the object overlaps
        for (let x = minCell.x; x <= maxCell.x; x++) {
            for (let y = minCell.y; y <= maxCell.y; y++) {
                for (let z = minCell.z; z <= maxCell.z; z++) {
                    const cell = this.getCell(x, y, z);
                    cell.push(object);
                    cells.push(this.hashCell(x, y, z));
                }
            }
        }

        this.objectCells.set(object, cells);
    }

    /**
     * Remove object from grid
     */
    remove(object) {
        const cells = this.objectCells.get(object);
        if (!cells) return;

        for (const cellKey of cells) {
            const cell = this.grid.get(cellKey);
            if (cell) {
                const index = cell.indexOf(object);
                if (index !== -1) {
                    cell.splice(index, 1);
                }
            }
        }

        this.objectCells.delete(object);
    }

    /**
     * Query objects in a region
     * Returns set of objects (to avoid duplicates from multiple cells)
     */
    query(bbox) {
        const minCell = this.getCellCoords(bbox.min);
        const maxCell = this.getCellCoords(bbox.max);

        const results = new Set();

        for (let x = minCell.x; x <= maxCell.x; x++) {
            for (let y = minCell.y; y <= maxCell.y; y++) {
                for (let z = minCell.z; z <= maxCell.z; z++) {
                    const cell = this.getCell(x, y, z);
                    for (const obj of cell) {
                        results.add(obj);
                    }
                }
            }
        }

        return Array.from(results);
    }

    /**
     * Query objects near a point
     */
    queryPoint(point, radius) {
        const bbox = {
            min: point.clone().sub(new Vector3(radius, radius, radius)),
            max: point.clone().add(new Vector3(radius, radius, radius))
        };
        return this.query(bbox);
    }

    /**
     * Clear all objects from grid
     */
    clear() {
        this.grid.clear();
        this.objectCells.clear();
    }

    /**
     * Get statistics
     */
    getStats() {
        let totalObjects = 0;
        let usedCells = 0;
        let maxObjectsInCell = 0;

        for (const [key, cell] of this.grid) {
            if (cell.length > 0) {
                usedCells++;
                totalObjects += cell.length;
                maxObjectsInCell = Math.max(maxObjectsInCell, cell.length);
            }
        }

        return {
            totalCells: this.gridWidth * this.gridHeight * this.gridDepth,
            usedCells: usedCells,
            totalObjects: totalObjects,
            maxObjectsInCell: maxObjectsInCell,
            averageObjectsPerCell: usedCells > 0 ? totalObjects / usedCells : 0
        };
    }
}

