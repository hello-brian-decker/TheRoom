/**
 * Vector3 - 3D Vector Mathematics
 * 
 * A comprehensive 3D vector class with full mathematical documentation.
 * Vectors represent points, directions, velocities, forces, etc. in 3D space.
 * 
 * Mathematical Foundation:
 * A 3D vector v = (x, y, z) represents a point or direction in ℝ³ space.
 * Operations follow standard linear algebra rules.
 */

export class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Set vector components
     */
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    /**
     * Copy from another vector
     */
    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    /**
     * Clone this vector
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Add another vector
     * Mathematical: v + w = (vx + wx, vy + wy, vz + wz)
     * Geometric: Translates the vector by another vector
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    /**
     * Add vectors and return new vector
     */
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }

    /**
     * Subtract another vector
     * Mathematical: v - w = (vx - wx, vy - wy, vz - wz)
     * Geometric: Vector from w to v
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    /**
     * Subtract vectors and return new vector
     */
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    /**
     * Multiply by scalar
     * Mathematical: s * v = (s * vx, s * vy, s * vz)
     * Geometric: Scales the vector length by factor s
     */
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    /**
     * Divide by scalar
     */
    divideScalar(scalar) {
        if (scalar !== 0) {
            return this.multiplyScalar(1 / scalar);
        }
        console.warn('Division by zero in Vector3.divideScalar');
        return this;
    }

    /**
     * Dot Product (Scalar Product)
     * Mathematical: v · w = vx*wx + vy*wy + vz*wz
     * 
     * Geometric Interpretation:
     * - Result is a scalar (number)
     * - v · w = |v| * |w| * cos(θ) where θ is the angle between vectors
     * - If vectors are perpendicular: v · w = 0
     * - If vectors point same direction: v · w = |v| * |w|
     * - Used for: angle calculation, projection, determining if vectors face same direction
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Cross Product (Vector Product)
     * Mathematical: v × w = (vy*wz - vz*wy, vz*wx - vx*wz, vx*wy - vy*wx)
     * 
     * Geometric Interpretation:
     * - Result is a vector perpendicular to both v and w
     * - |v × w| = |v| * |w| * sin(θ) = area of parallelogram formed by v and w
     * - Direction follows right-hand rule
     * - Used for: calculating normals, torque, determining orientation
     */
    cross(v) {
        const x = this.x, y = this.y, z = this.z;
        this.x = y * v.z - z * v.y;
        this.y = z * v.x - x * v.z;
        this.z = x * v.y - y * v.x;
        return this;
    }

    /**
     * Cross vectors and return new vector
     */
    crossVectors(a, b) {
        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;
        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;
        return this;
    }

    /**
     * Length (Magnitude) of vector
     * Mathematical: |v| = √(x² + y² + z²)
     * Geometric: Distance from origin to point, or length of direction vector
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Squared length (avoids square root for performance)
     * Mathematical: |v|² = x² + y² + z²
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * Normalize vector (make unit vector)
     * Mathematical: v̂ = v / |v|
     * Geometric: Creates a vector pointing in same direction but with length 1
     * Used for: direction vectors, normals
     */
    normalize() {
        const len = this.length();
        if (len > 0) {
            return this.divideScalar(len);
        }
        console.warn('Cannot normalize zero vector');
        return this;
    }

    /**
     * Distance to another vector
     * Mathematical: |v - w| = √((vx-wx)² + (vy-wy)² + (vz-wz)²)
     */
    distanceTo(v) {
        return Math.sqrt(
            (this.x - v.x) ** 2 +
            (this.y - v.y) ** 2 +
            (this.z - v.z) ** 2
        );
    }

    /**
     * Squared distance (avoids square root)
     */
    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Linear Interpolation (Lerp)
     * Mathematical: lerp(v, w, t) = v + t * (w - v) = (1-t) * v + t * w
     * Geometric: Interpolates between two vectors
     * t ∈ [0, 1]: t=0 returns v, t=1 returns w
     */
    lerp(v, t) {
        this.x += (v.x - this.x) * t;
        this.y += (v.y - this.y) * t;
        this.z += (v.z - this.z) * t;
        return this;
    }

    /**
     * Lerp between two vectors
     */
    lerpVectors(v1, v2, t) {
        this.x = v1.x + (v2.x - v1.x) * t;
        this.y = v1.y + (v2.y - v1.y) * t;
        this.z = v1.z + (v2.z - v1.z) * t;
        return this;
    }

    /**
     * Negate vector (multiply by -1)
     */
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    /**
     * Zero vector
     */
    zero() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        return this;
    }

    /**
     * Check if vector equals another (within epsilon)
     */
    equals(v, epsilon = 0.0001) {
        return (
            Math.abs(this.x - v.x) < epsilon &&
            Math.abs(this.y - v.y) < epsilon &&
            Math.abs(this.z - v.z) < epsilon
        );
    }

    /**
     * Apply matrix transformation (3x3)
     */
    applyMatrix3(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;
        return this;
    }

    /**
     * Apply matrix transformation (4x4)
     */
    applyMatrix4(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        return this;
    }

    /**
     * Transform direction (ignores translation)
     */
    transformDirection(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
    }

    /**
     * To array
     */
    toArray() {
        return [this.x, this.y, this.z];
    }

    /**
     * From array
     */
    fromArray(array, offset = 0) {
        this.x = array[offset];
        this.y = array[offset + 1];
        this.z = array[offset + 2];
        return this;
    }
}

// Static methods
Vector3.ZERO = new Vector3(0, 0, 0);
Vector3.ONE = new Vector3(1, 1, 1);
Vector3.UP = new Vector3(0, 1, 0);
Vector3.DOWN = new Vector3(0, -1, 0);
Vector3.LEFT = new Vector3(-1, 0, 0);
Vector3.RIGHT = new Vector3(1, 0, 0);
Vector3.FORWARD = new Vector3(0, 0, -1);
Vector3.BACK = new Vector3(0, 0, 1);

