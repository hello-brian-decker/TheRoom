/**
 * Matrix4 - 4x4 Matrix Mathematics
 * 
 * A 4x4 matrix class for affine transformations in 3D space.
 * Used for combined rotation, scaling, and translation (homogeneous coordinates).
 * 
 * Mathematical Foundation:
 * Homogeneous coordinates allow translation to be represented as matrix multiplication.
 * A 4x4 matrix can represent any affine transformation: rotation, scale, translation.
 * 
 * Storage: Column-major order
 * [0  4  8  12]
 * [1  5  9  13]
 * [2  6  10 14]
 * [3  7  11 15]
 */

import { Vector3 } from './Vector3.js';

export class Matrix4 {
    constructor() {
        this.elements = new Float32Array(16);
        this.identity();
    }

    /**
     * Set to identity matrix
     */
    identity() {
        const e = this.elements;
        e[0] = 1; e[1] = 0; e[2] = 0; e[3] = 0;
        e[4] = 0; e[5] = 1; e[6] = 0; e[7] = 0;
        e[8] = 0; e[9] = 0; e[10] = 1; e[11] = 0;
        e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;
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
        return new Matrix4().copy(this);
    }

    /**
     * Set matrix elements
     */
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        const e = this.elements;
        e[0] = n11; e[4] = n12; e[8] = n13; e[12] = n14;
        e[1] = n21; e[5] = n22; e[9] = n23; e[13] = n24;
        e[2] = n31; e[6] = n32; e[10] = n33; e[14] = n34;
        e[3] = n41; e[7] = n42; e[11] = n43; e[15] = n44;
        return this;
    }

    /**
     * Multiply by another matrix
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

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    /**
     * Create translation matrix
     * Mathematical: T(tx, ty, tz) = [1 0 0 tx]
     *                               [0 1 0 ty]
     *                               [0 0 1 tz]
     *                               [0 0 0 1 ]
     */
    makeTranslation(x, y, z) {
        return this.set(
            1, 0, 0, x,
            0, 1, 0, y,
            0, 0, 1, z,
            0, 0, 0, 1
        );
    }

    /**
     * Create rotation matrix around X axis
     */
    makeRotationX(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * Create rotation matrix around Y axis
     */
    makeRotationY(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );
    }

    /**
     * Create rotation matrix around Z axis
     */
    makeRotationZ(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        return this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    /**
     * Create scale matrix
     */
    makeScale(x, y, z) {
        return this.set(
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        );
    }

    /**
     * Compose: translation * rotation * scale
     */
    compose(position, quaternion, scale) {
        const te = this.elements;

        const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        const sx = scale.x, sy = scale.y, sz = scale.z;

        te[0] = (1 - (yy + zz)) * sx;
        te[1] = (xy + wz) * sx;
        te[2] = (xz - wy) * sx;
        te[3] = 0;

        te[4] = (xy - wz) * sy;
        te[5] = (1 - (xx + zz)) * sy;
        te[6] = (yz + wx) * sy;
        te[7] = 0;

        te[8] = (xz + wy) * sz;
        te[9] = (yz - wx) * sz;
        te[10] = (1 - (xx + yy)) * sz;
        te[11] = 0;

        te[12] = position.x;
        te[13] = position.y;
        te[14] = position.z;
        te[15] = 1;

        return this;
    }

    /**
     * Decompose matrix into position, quaternion, scale
     */
    decompose(position, quaternion, scale) {
        const te = this.elements;
        const sx = new Vector3(te[0], te[1], te[2]).length();
        const sy = new Vector3(te[4], te[5], te[6]).length();
        const sz = new Vector3(te[8], te[9], te[10]).length();

        const det = this.determinant();
        if (det < 0) sx = -sx;

        position.x = te[12];
        position.y = te[13];
        position.z = te[14];

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        const m11 = te[0] * invSX, m12 = te[4] * invSY, m13 = te[8] * invSZ;
        const m21 = te[1] * invSX, m22 = te[5] * invSY, m23 = te[9] * invSZ;
        const m31 = te[2] * invSX, m32 = te[6] * invSY, m33 = te[10] * invSZ;

        const trace = m11 + m22 + m33;
        let s;

        if (trace > 0) {
            s = Math.sqrt(trace + 1.0) * 2;
            quaternion.w = 0.25 * s;
            quaternion.x = (m32 - m23) / s;
            quaternion.y = (m13 - m31) / s;
            quaternion.z = (m21 - m12) / s;
        } else if ((m11 > m22) && (m11 > m33)) {
            s = Math.sqrt(1.0 + m11 - m22 - m33) * 2;
            quaternion.w = (m32 - m23) / s;
            quaternion.x = 0.25 * s;
            quaternion.y = (m12 + m21) / s;
            quaternion.z = (m13 + m31) / s;
        } else if (m22 > m33) {
            s = Math.sqrt(1.0 + m22 - m11 - m33) * 2;
            quaternion.w = (m13 - m31) / s;
            quaternion.x = (m12 + m21) / s;
            quaternion.y = 0.25 * s;
            quaternion.z = (m23 + m32) / s;
        } else {
            s = Math.sqrt(1.0 + m33 - m11 - m22) * 2;
            quaternion.w = (m21 - m12) / s;
            quaternion.x = (m13 + m31) / s;
            quaternion.y = (m23 + m32) / s;
            quaternion.z = 0.25 * s;
        }

        scale.x = sx;
        scale.y = sy;
        scale.z = sz;

        return this;
    }

    /**
     * Determinant of 4x4 matrix
     */
    determinant() {
        const e = this.elements;
        const n11 = e[0], n12 = e[4], n13 = e[8], n14 = e[12];
        const n21 = e[1], n22 = e[5], n23 = e[9], n24 = e[13];
        const n31 = e[2], n32 = e[6], n33 = e[10], n34 = e[14];
        const n41 = e[3], n42 = e[7], n43 = e[11], n44 = e[15];

        return (
            n41 * (n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
            n42 * (n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 - n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
            n43 * (n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 + n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
            n44 * (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 + n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)
        );
    }

    /**
     * Transpose matrix
     */
    transpose() {
        const e = this.elements;
        let tmp;

        tmp = e[1]; e[1] = e[4]; e[4] = tmp;
        tmp = e[2]; e[2] = e[8]; e[8] = tmp;
        tmp = e[3]; e[3] = e[12]; e[12] = tmp;
        tmp = e[6]; e[6] = e[9]; e[9] = tmp;
        tmp = e[7]; e[7] = e[13]; e[13] = tmp;
        tmp = e[11]; e[11] = e[14]; e[14] = tmp;

        return this;
    }

    /**
     * Invert matrix (for affine transformations)
     */
    invert() {
        // Simplified inversion for affine transformation matrices
        const e = this.elements;
        const a = e[0], b = e[4], c = e[8], d = e[12];
        const e_val = e[1], f = e[5], g = e[9], h = e[13];
        const i = e[2], j = e[6], k = e[10], l = e[14];
        const m = e[3], n = e[7], o = e[11], p = e[15];

        // For affine matrices, bottom row is [0, 0, 0, 1]
        if (Math.abs(m) > 0.0001 || Math.abs(n) > 0.0001 || Math.abs(o) > 0.0001 || Math.abs(p - 1) > 0.0001) {
            console.warn('Matrix4.invert: Matrix may not be affine');
        }

        // Invert 3x3 rotation/scale part
        const det = a * (f * k - g * j) - b * (e_val * k - g * i) + c * (e_val * j - f * i);
        if (Math.abs(det) < 0.0001) {
            console.warn('Matrix4.invert: Matrix is singular');
            return this.identity();
        }

        const invDet = 1 / det;

        // Calculate inverse of 3x3 part
        const inv11 = (f * k - g * j) * invDet;
        const inv12 = (c * j - b * k) * invDet;
        const inv13 = (b * g - c * f) * invDet;
        const inv21 = (g * i - e_val * k) * invDet;
        const inv22 = (a * k - c * i) * invDet;
        const inv23 = (c * e_val - a * g) * invDet;
        const inv31 = (e_val * j - f * i) * invDet;
        const inv32 = (b * i - a * j) * invDet;
        const inv33 = (a * f - b * e_val) * invDet;

        // Calculate translation part
        const tx = -(inv11 * d + inv12 * h + inv13 * l);
        const ty = -(inv21 * d + inv22 * h + inv23 * l);
        const tz = -(inv31 * d + inv32 * h + inv33 * l);

        return this.set(
            inv11, inv12, inv13, tx,
            inv21, inv22, inv23, ty,
            inv31, inv32, inv33, tz,
            0, 0, 0, 1
        );
    }
}

