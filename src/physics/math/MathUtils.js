/**
 * MathUtils - Mathematical Utility Functions
 * 
 * Common mathematical functions used throughout the physics engine.
 */

export class MathUtils {
    /**
     * Clamp value between min and max
     * Mathematical: clamp(x, a, b) = max(a, min(b, x))
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * Linear interpolation
     * Mathematical: lerp(a, b, t) = a + t * (b - a) = (1-t) * a + t * b
     * t ∈ [0, 1]
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    /**
     * Smoothstep interpolation (S-curve)
     * Mathematical: smoothstep(t) = t² * (3 - 2t)
     * Creates smooth S-curve interpolation
     */
    static smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    /**
     * Smootherstep interpolation (even smoother S-curve)
     * Mathematical: smootherstep(t) = t³ * (t * (t * 6 - 15) + 10)
     */
    static smootherstep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    /**
     * Map value from one range to another
     * Mathematical: map(x, a1, b1, a2, b2) = a2 + (b2 - a2) * (x - a1) / (b1 - a1)
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
    }

    /**
     * Degrees to radians
     * Mathematical: radians = degrees * π / 180
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    /**
     * Radians to degrees
     * Mathematical: degrees = radians * 180 / π
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    /**
     * Check if two numbers are approximately equal
     */
    static equals(a, b, epsilon = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }

    /**
     * Sign function
     * Returns -1 if negative, 1 if positive, 0 if zero
     */
    static sign(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    }

    /**
     * Modulo that handles negative numbers correctly
     */
    static mod(x, n) {
        return ((x % n) + n) % n;
    }

    /**
     * Random number between min and max
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Gaussian random number (normal distribution)
     * Uses Box-Muller transform
     */
    static randomGaussian(mean = 0, stdDev = 1) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * stdDev + mean;
    }

    /**
     * Fast inverse square root (Quake III algorithm)
     * Approximates 1/√x using bit manipulation
     */
    static fastInvSqrt(x) {
        const xhalf = 0.5 * x;
        let i = new Float32Array(1);
        i[0] = x;
        i = new Int32Array(i.buffer);
        i[0] = 0x5f3759df - (i[0] >> 1);
        let y = new Float32Array(1);
        y = new Int32Array(y.buffer);
        y[0] = i[0];
        y = new Float32Array(y.buffer);
        y = y[0];
        y = y * (1.5 - xhalf * y * y); // Newton iteration
        return y;
    }

    /**
     * Clamp angle to [0, 2π]
     */
    static clampAngle(angle) {
        while (angle < 0) angle += 2 * Math.PI;
        while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
        return angle;
    }

    /**
     * Shortest angle difference between two angles
     */
    static angleDifference(a, b) {
        let diff = b - a;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        return diff;
    }
}

