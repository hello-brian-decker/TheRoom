/**
 * EulerIntegrator - Euler Integration Method
 * 
 * The simplest numerical integration method for solving differential equations.
 * 
 * Mathematical Foundation:
 * Given a differential equation: dx/dt = f(x, t)
 * Euler's method approximates: x(t + h) ≈ x(t) + h * f(x(t), t)
 * where h is the time step (deltaTime)
 * 
 * For physics: 
 * - Position: p(t+dt) = p(t) + v(t) * dt
 * - Velocity: v(t+dt) = v(t) + a(t) * dt
 * 
 * Properties:
 * - First-order method (error O(h²))
 * - Simple and fast
 * - Can be unstable for large time steps
 * - Energy may not be conserved (can gain/lose energy)
 * 
 * @example
 * // Integrate motion for one time step
 * EulerIntegrator.integrate(
 *     body.position,
 *     body.velocity,
 *     body.acceleration,
 *     1/60 // 60 FPS
 * );
 */
import { Vector3 } from '../math/Vector3.js';

export class EulerIntegrator {
    /**
     * Integrate position and velocity using explicit Euler method
     * 
     * Updates position and velocity in-place based on acceleration.
     * Mathematical:
     * v(t+dt) = v(t) + a(t) * dt
     * p(t+dt) = p(t) + v(t) * dt
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} velocity - Current velocity (modified in-place)
     * @param {Vector3} acceleration - Current acceleration
     * @param {number} deltaTime - Time step in seconds
     * @example
     * EulerIntegrator.integrate(position, velocity, acceleration, 0.016);
     */
    static integrate(position, velocity, acceleration, deltaTime) {
        // Update velocity: v = v + a * dt
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
        velocity.z += acceleration.z * deltaTime;

        // Update position: p = p + v * dt
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;
        position.z += velocity.z * deltaTime;
    }

    /**
     * Semi-implicit Euler (Symplectic Euler)
     * 
     * Updates position first, then velocity. Better energy conservation
     * than explicit Euler method. Also known as Symplectic Euler.
     * 
     * Mathematical:
     * p(t+dt) = p(t) + v(t) * dt
     * v(t+dt) = v(t) + a(t+dt) * dt
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} velocity - Current velocity (modified in-place)
     * @param {Vector3} acceleration - Current acceleration
     * @param {number} deltaTime - Time step in seconds
     * @example
     * EulerIntegrator.integrateSemiImplicit(position, velocity, acceleration, 0.016);
     */
    static integrateSemiImplicit(position, velocity, acceleration, deltaTime) {
        // Update position first: p = p + v * dt
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;
        position.z += velocity.z * deltaTime;

        // Then update velocity: v = v + a * dt
        velocity.x += acceleration.x * deltaTime;
        velocity.y += acceleration.y * deltaTime;
        velocity.z += acceleration.z * deltaTime;
    }
}

