/**
 * Quaternion - Quaternion Mathematics for Rotations
 * 
 * Quaternions are a number system that extends complex numbers.
 * They are superior to Euler angles for 3D rotations because they:
 * - Avoid gimbal lock
 * - Are more efficient to compute
 * - Interpolate smoothly (SLERP)
 * 
 * Mathematical Foundation:
 * A quaternion q = w + xi + yj + zk where i² = j² = k² = ijk = -1
 * Can represent rotation: q = cos(θ/2) + sin(θ/2)(xi + yj + zk)
 * where (x, y, z) is the rotation axis and θ is the rotation angle
 * 
 * Why Quaternions vs Euler Angles:
 * - Euler angles suffer from gimbal lock (loss of a degree of freedom)
 * - Quaternions avoid this and are more numerically stable
 * - Quaternion multiplication composes rotations efficiently
 */

import { Vector3 } from './Vector3.js';
import { MathUtils } from './MathUtils.js';

export class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    /**
     * Set quaternion components
     */
    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    /**
     * Copy from another quaternion
     */
    copy(q) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }

    /**
     * Clone this quaternion
     */
    clone() {
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    /**
     * Set to identity quaternion (no rotation)
     * Mathematical: q = 1 + 0i + 0j + 0k
     */
    identity() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this;
    }

    /**
     * Set quaternion from axis-angle representation
     * Mathematical: q = cos(θ/2) + sin(θ/2)(axis_x*i + axis_y*j + axis_z*k)
     * 
     * @param {Vector3} axis - Rotation axis (must be normalized)
     * @param {number} angle - Rotation angle in radians
     */
    setFromAxisAngle(axis, angle) {
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle);
        this.x = axis.x * s;
        this.y = axis.y * s;
        this.z = axis.z * s;
        this.w = Math.cos(halfAngle);
        return this;
    }

    /**
     * Set quaternion from Euler angles (XYZ order)
     * Mathematical: Converts Euler angles to quaternion
     * 
     * Euler angles have gimbal lock issues, quaternions avoid this
     */
    setFromEuler(euler) {
        const x = euler.x / 2, y = euler.y / 2, z = euler.z / 2;
        const cx = Math.cos(x), sx = Math.sin(x);
        const cy = Math.cos(y), sy = Math.sin(y);
        const cz = Math.cos(z), sz = Math.sin(z);

        this.x = sx * cy * cz - cx * sy * sz;
        this.y = cx * sy * cz + sx * cy * sz;
        this.z = cx * cy * sz - sx * sy * cz;
        this.w = cx * cy * cz + sx * sy * sz;
        return this;
    }

    /**
     * Multiply by another quaternion
     * Mathematical: q1 * q2 = (w1*w2 - v1·v2) + (w1*v2 + w2*v1 + v1×v2)
     * where v is the vector part (x, y, z) and w is the scalar part
     * 
     * Quaternion multiplication composes rotations
     */
    multiply(q) {
        return this.multiplyQuaternions(this, q);
    }

    /**
     * Multiply two quaternions: this = a * b
     */
    multiplyQuaternions(a, b) {
        const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

        this.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        this.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        this.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        this.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
        return this;
    }

    /**
     * Length (magnitude) of quaternion
     * Mathematical: |q| = √(x² + y² + z² + w²)
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    /**
     * Squared length
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    /**
     * Normalize quaternion (make unit quaternion)
     * Mathematical: q̂ = q / |q|
     * Unit quaternions represent rotations
     */
    normalize() {
        const len = this.length();
        if (len === 0) {
            console.warn('Quaternion.normalize: Quaternion has zero length');
            this.identity();
            return this;
        }
        const invLen = 1 / len;
        this.x *= invLen;
        this.y *= invLen;
        this.z *= invLen;
        this.w *= invLen;
        return this;
    }

    /**
     * Conjugate quaternion
     * Mathematical: q* = w - xi - yj - zk
     * For unit quaternions, conjugate is the inverse rotation
     */
    conjugate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    /**
     * Inverse quaternion
     * Mathematical: q^(-1) = q* / |q|²
     * For unit quaternions: q^(-1) = q*
     */
    invert() {
        const lenSq = this.lengthSq();
        if (lenSq === 0) {
            console.warn('Quaternion.invert: Quaternion has zero length');
            this.identity();
            return this;
        }
        this.conjugate().multiplyScalar(1 / lenSq);
        return this;
    }

    /**
     * Multiply by scalar
     */
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        this.w *= s;
        return this;
    }

    /**
     * SLERP - Spherical Linear Interpolation
     * Mathematical: slerp(q1, q2, t) = (sin((1-t)θ)/sin(θ)) * q1 + (sin(tθ)/sin(θ)) * q2
     * where θ is the angle between q1 and q2
     * 
     * SLERP interpolates rotations along the shortest path on the unit sphere
     * Provides smooth rotation interpolation without gimbal lock
     */
    slerp(qb, t) {
        if (t === 0) return this;
        if (t === 1) return this.copy(qb);

        const x = this.x, y = this.y, z = this.z, w = this.w;

        // Calculate angle between quaternions using dot product
        let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

        // If qa and qb are on opposite hemispheres, negate one
        if (cosHalfTheta < 0) {
            this.w = -qb.w;
            this.x = -qb.x;
            this.y = -qb.y;
            this.z = -qb.z;
            cosHalfTheta = -cosHalfTheta;
        } else {
            this.copy(qb);
        }

        // If quaternions are very close, use linear interpolation
        if (cosHalfTheta >= 1.0) {
            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }

        const halfTheta = Math.acos(cosHalfTheta);
        const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

        // If angle is very small, use linear interpolation
        if (Math.abs(sinHalfTheta) < 0.001) {
            this.w = w * (1 - t) + this.w * t;
            this.x = x * (1 - t) + this.x * t;
            this.y = y * (1 - t) + this.y * t;
            this.z = z * (1 - t) + this.z * t;
            return this.normalize();
        }

        const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
        const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

        this.w = w * ratioA + this.w * ratioB;
        this.x = x * ratioA + this.x * ratioB;
        this.y = y * ratioA + this.y * ratioB;
        this.z = z * ratioA + this.z * ratioB;

        return this;
    }

    /**
     * Rotate a vector by this quaternion
     * Mathematical: v' = q * v * q^(-1)
     * For unit quaternions: v' = q * v * q*
     */
    rotateVector(v) {
        // q * v (treating v as quaternion with w=0)
        const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
        const vx = v.x, vy = v.y, vz = v.z;

        const ix = qw * vx + qy * vz - qz * vy;
        const iy = qw * vy + qz * vx - qx * vz;
        const iz = qw * vz + qx * vy - qy * vx;
        const iw = -qx * vx - qy * vy - qz * vz;

        // Result * q^(-1) = Result * q* (since q is unit)
        v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return v;
    }

    /**
     * Get rotation axis and angle from quaternion
     */
    getAxisAngle(targetAxis, targetAngle) {
        this.normalize();
        const angle = 2 * Math.acos(this.w);
        const s = Math.sqrt(1 - this.w * this.w);

        if (s < 0.001) {
            // Angle is 0 or 180, axis doesn't matter
            targetAxis.x = 1;
            targetAxis.y = 0;
            targetAxis.z = 0;
        } else {
            targetAxis.x = this.x / s;
            targetAxis.y = this.y / s;
            targetAxis.z = this.z / s;
        }

        targetAngle.value = angle;
        return this;
    }

    /**
     * Check if quaternion equals another (within epsilon)
     */
    equals(q, epsilon = 0.0001) {
        return (
            Math.abs(this.x - q.x) < epsilon &&
            Math.abs(this.y - q.y) < epsilon &&
            Math.abs(this.z - q.z) < epsilon &&
            Math.abs(this.w - q.w) < epsilon
        );
    }
}

