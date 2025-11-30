/**
 * Matrix3 - 3x3 Matrix Mathematics
 * 
 * A 3x3 matrix class for linear transformations in 3D space.
 * Used for rotations, scaling, and other linear transformations.
 * 
 * Mathematical Foundation:
 * A 3x3 matrix M represents a linear transformation T: ℝ³ → ℝ³
 * Matrix multiplication: (M * v) applies transformation T to vector v
 * 
 * Storage: Column-major order (like OpenGL)
 * [0 3 6]
 * [1 4 7]
 * [2 5 8]
 */

export class Matrix3 {
    constructor() {
        this.elements = new Float32Array(9);
        this.identity();
    }

    /**
     * Set to identity matrix
     * Mathematical: I = [1 0 0; 0 1 0; 0 0 1]
     * Identity matrix leaves vectors unchanged: I * v = v
     */
    identity() {
        const e = this.elements;
        e[0] = 1; e[1] = 0; e[2] = 0;
        e[3] = 0; e[4] = 1; e[5] = 0;
        e[6] = 0; e[7] = 0; e[8] = 1;
        return this;
    }

    /**
     * Copy from another matrix
     */
    copy(m) {
        this.elements.set(m.elements);
        return this;
    }

    /**
     * Clone this matrix
     */
    clone() {
        return new Matrix3().copy(this);
    }

    /**
     * Set matrix elements
     */
    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
        const e = this.elements;
        e[0] = n11; e[3] = n12; e[6] = n13;
        e[1] = n21; e[4] = n22; e[7] = n23;
        e[2] = n31; e[5] = n32; e[8] = n33;
        return this;
    }

    /**
     * Multiply by another matrix
     * Mathematical: C = A * B where C[i][j] = Σ A[i][k] * B[k][j]
     * Composition of transformations
     */
    multiply(m) {
        return this.multiplyMatrices(this, m);
    }

    /**
     * Multiply two matrices: this = A * B
     */
    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];

        const b11 = be[0], b12 = be[3], b13 = be[6];
        const b21 = be[1], b22 = be[4], b23 = be[7];
        const b31 = be[2], b32 = be[5], b33 = be[8];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;

        return this;
    }

    /**
     * Determinant
     * Mathematical: det(M) = M[0][0]*(M[1][1]*M[2][2] - M[1][2]*M[2][1])
     *                  - M[0][1]*(M[1][0]*M[2][2] - M[1][2]*M[2][0])
     *                  + M[0][2]*(M[1][0]*M[2][1] - M[1][1]*M[2][0])
     * 
     * Geometric meaning: Scaling factor of transformation
     * If det(M) = 0, matrix is singular (not invertible)
     */
    determinant() {
        const e = this.elements;
        const a = e[0], b = e[3], c = e[6];
        const d = e[1], e_val = e[4], f = e[7];
        const g = e[2], h = e[5], i = e[8];
        return a * (e_val * i - f * h) - b * (d * i - f * g) + c * (d * h - e_val * g);
    }

    /**
     * Transpose matrix
     * Mathematical: M^T where M^T[i][j] = M[j][i]
     * Swaps rows and columns
     */
    transpose() {
        const e = this.elements;
        let tmp;

        tmp = e[1]; e[1] = e[3]; e[3] = tmp;
        tmp = e[2]; e[2] = e[6]; e[6] = tmp;
        tmp = e[5]; e[5] = e[7]; e[7] = tmp;

        return this;
    }

    /**
     * Invert matrix
     * Mathematical: M^(-1) such that M * M^(-1) = I
     * 
     * For 3x3 matrix:
     * M^(-1) = (1/det(M)) * adj(M)
     * where adj(M) is the adjugate (transpose of cofactor matrix)
     */
    invert() {
        const e = this.elements;
        const det = this.determinant();

        if (Math.abs(det) < 0.0001) {
            console.warn('Matrix3.invert: Matrix is singular (determinant = 0)');
            return this.identity();
        }

        const invDet = 1 / det;

        const a = e[0], b = e[3], c = e[6];
        const d = e[1], e_val = e[4], f = e[7];
        const g = e[2], h = e[5], i = e[8];

        e[0] = (e_val * i - f * h) * invDet;
        e[3] = (c * h - b * i) * invDet;
        e[6] = (b * f - c * e_val) * invDet;

        e[1] = (f * g - d * i) * invDet;
        e[4] = (a * i - c * g) * invDet;
        e[7] = (c * d - a * f) * invDet;

        e[2] = (d * h - e_val * g) * invDet;
        e[5] = (b * g - a * h) * invDet;
        e[8] = (a * e_val - b * d) * invDet;

        return this;
    }

    /**
     * Scale matrix (diagonal scaling)
     */
    scale(sx, sy, sz) {
        const e = this.elements;
        e[0] *= sx; e[4] *= sy; e[8] *= sz;
        return this;
    }

    /**
     * Create rotation matrix around X axis
     * Mathematical: R_x(θ) = [1  0     0   ]
     *                        [0 cos(θ) -sin(θ)]
     *                        [0 sin(θ) cos(θ) ]
     */
    makeRotationX(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            1, 0, 0,
            0, c, -s,
            0, s, c
        );
    }

    /**
     * Create rotation matrix around Y axis
     */
    makeRotationY(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            c, 0, s,
            0, 1, 0,
            -s, 0, c
        );
    }

    /**
     * Create rotation matrix around Z axis
     */
    makeRotationZ(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            c, -s, 0,
            s, c, 0,
            0, 0, 1
        );
    }
}

