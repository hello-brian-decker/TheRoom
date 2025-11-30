/**
 * Mesh - Mesh Collision Shape
 * 
 * A collision shape defined by a collection of triangles.
 * More accurate but slower than primitive shapes.
 * 
 * Mathematical Foundation:
 * A mesh is composed of triangles. Each triangle is defined by three vertices.
 * Triangle normal: n = (v2 - v1) × (v3 - v1), normalized
 * Triangle area: A = (1/2) * |(v2 - v1) × (v3 - v1)|
 * 
 * Point-in-triangle test uses barycentric coordinates:
 * p = α*v1 + β*v2 + γ*v3 where α + β + γ = 1
 * Point is inside if α, β, γ ≥ 0
 */

import { Vector3 } from '../../math/Vector3.js';

export class Mesh {
    constructor(vertices = [], indices = []) {
        this.vertices = vertices; // Array of Vector3
        this.indices = indices; // Array of triangle indices [i1, i2, i3, i4, i5, i6, ...]
        this.triangles = []; // Precomputed triangles
        this.bounds = { min: new Vector3(), max: new Vector3() };
        
        this.updateTriangles();
        this.updateBounds();
    }

    /**
     * Update triangle data from vertices and indices
     */
    updateTriangles() {
        this.triangles = [];
        
        for (let i = 0; i < this.indices.length; i += 3) {
            const i0 = this.indices[i];
            const i1 = this.indices[i + 1];
            const i2 = this.indices[i + 2];

            if (i0 >= this.vertices.length || i1 >= this.vertices.length || i2 >= this.vertices.length) {
                continue;
            }

            const triangle = {
                v0: this.vertices[i0],
                v1: this.vertices[i1],
                v2: this.vertices[i2],
                normal: null,
                area: 0
            };

            // Calculate normal
            const edge1 = new Vector3().subVectors(triangle.v1, triangle.v0);
            const edge2 = new Vector3().subVectors(triangle.v2, triangle.v0);
            triangle.normal = new Vector3().crossVectors(edge1, edge2).normalize();
            triangle.area = 0.5 * edge1.cross(edge2).length();

            this.triangles.push(triangle);
        }
    }

    /**
     * Update bounding box
     */
    updateBounds() {
        if (this.vertices.length === 0) {
            this.bounds.min.set(0, 0, 0);
            this.bounds.max.set(0, 0, 0);
            return;
        }

        this.bounds.min.copy(this.vertices[0]);
        this.bounds.max.copy(this.vertices[0]);

        for (const vertex of this.vertices) {
            this.bounds.min.x = Math.min(this.bounds.min.x, vertex.x);
            this.bounds.min.y = Math.min(this.bounds.min.y, vertex.y);
            this.bounds.min.z = Math.min(this.bounds.min.z, vertex.z);

            this.bounds.max.x = Math.max(this.bounds.max.x, vertex.x);
            this.bounds.max.y = Math.max(this.bounds.max.y, vertex.y);
            this.bounds.max.z = Math.max(this.bounds.max.z, vertex.z);
        }
    }

    /**
     * Check if point is inside mesh (using ray casting)
     * Casts a ray from point and counts intersections
     * Odd number of intersections = inside, even = outside
     */
    containsPoint(point) {
        // Simple bounding box check first
        if (!this.pointInBounds(point)) {
            return false;
        }

        // Ray casting algorithm
        const rayDir = new Vector3(1, 0, 0); // Cast ray in +X direction
        let intersections = 0;

        for (const triangle of this.triangles) {
            const hit = this.rayTriangleIntersect(point, rayDir, triangle);
            if (hit) {
                intersections++;
            }
        }

        return (intersections % 2) === 1; // Odd = inside
    }

    /**
     * Check if point is in bounding box
     */
    pointInBounds(point) {
        return (
            point.x >= this.bounds.min.x && point.x <= this.bounds.max.x &&
            point.y >= this.bounds.min.y && point.y <= this.bounds.max.y &&
            point.z >= this.bounds.min.z && point.z <= this.bounds.max.z
        );
    }

    /**
     * Ray-triangle intersection test
     * Uses Möller-Trumbore algorithm
     * 
     * Mathematical:
     * Ray: R(t) = O + t*D where O is origin, D is direction
     * Triangle: T(u,v) = v0 + u*(v1-v0) + v*(v2-v0)
     * Solve: O + t*D = v0 + u*(v1-v0) + v*(v2-v0)
     */
    rayTriangleIntersect(rayOrigin, rayDir, triangle) {
        const edge1 = new Vector3().subVectors(triangle.v1, triangle.v0);
        const edge2 = new Vector3().subVectors(triangle.v2, triangle.v0);
        const h = new Vector3().crossVectors(rayDir, edge2);
        const a = edge1.dot(h);

        if (Math.abs(a) < 0.0001) {
            return null; // Ray parallel to triangle
        }

        const f = 1 / a;
        const s = new Vector3().subVectors(rayOrigin, triangle.v0);
        const u = f * s.dot(h);

        if (u < 0 || u > 1) {
            return null;
        }

        const q = new Vector3().crossVectors(s, edge1);
        const v = f * rayDir.dot(q);

        if (v < 0 || u + v > 1) {
            return null;
        }

        const t = f * edge2.dot(q);

        if (t > 0.0001) { // Ray intersection
            return {
                t: t,
                point: rayOrigin.clone().add(rayDir.clone().multiplyScalar(t)),
                normal: triangle.normal
            };
        }

        return null;
    }

    /**
     * Get closest point on mesh surface to given point
     */
    getClosestPoint(point) {
        let closestPoint = null;
        let closestDistanceSq = Infinity;

        for (const triangle of this.triangles) {
            const closest = this.closestPointOnTriangle(point, triangle);
            const distSq = point.distanceToSquared(closest);
            
            if (distSq < closestDistanceSq) {
                closestDistanceSq = distSq;
                closestPoint = closest;
            }
        }

        return closestPoint;
    }

    /**
     * Get closest point on triangle to given point
     * Projects point onto triangle plane, then clamps to triangle bounds
     */
    closestPointOnTriangle(point, triangle) {
        const edge1 = new Vector3().subVectors(triangle.v1, triangle.v0);
        const edge2 = new Vector3().subVectors(triangle.v2, triangle.v0);
        const normal = new Vector3().crossVectors(edge1, edge2).normalize();

        // Project point onto triangle plane
        const v0ToPoint = new Vector3().subVectors(point, triangle.v0);
        const distance = v0ToPoint.dot(normal);
        const projectedPoint = point.clone().sub(normal.clone().multiplyScalar(distance));

        // Check if projected point is inside triangle using barycentric coordinates
        const v0v1 = edge1;
        const v0v2 = edge2;
        const v0p = new Vector3().subVectors(projectedPoint, triangle.v0);

        const dot00 = v0v1.dot(v0v1);
        const dot01 = v0v1.dot(v0v2);
        const dot02 = v0v1.dot(v0p);
        const dot11 = v0v2.dot(v0v2);
        const dot12 = v0v2.dot(v0p);

        const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        // Clamp to triangle
        if (u < 0) {
            if (v < 0) return triangle.v0.clone();
            if (u + v > 1) return triangle.v2.clone();
            return triangle.v0.clone().add(v0v2.clone().multiplyScalar(v));
        }
        if (v < 0) {
            if (u > 1) return triangle.v1.clone();
            return triangle.v0.clone().add(v0v1.clone().multiplyScalar(u));
        }
        if (u + v > 1) {
            const w = 1 - u - v;
            return triangle.v0.clone()
                .add(v0v1.clone().multiplyScalar(u))
                .add(v0v2.clone().multiplyScalar(v));
        }

        return projectedPoint;
    }

    /**
     * Clone this mesh
     */
    clone() {
        const clonedVertices = this.vertices.map(v => v.clone());
        const clonedIndices = [...this.indices];
        return new Mesh(clonedVertices, clonedIndices);
    }
}

