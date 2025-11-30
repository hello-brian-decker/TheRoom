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
 */

import { Vector3 } from '../math/Vector3.js';

export class EulerIntegrator {
    /**
     * Integrate position and velocity using explicit Euler method
     * 
     * Mathematical:
     * v(t+dt) = v(t) + a(t) * dt
     * p(t+dt) = p(t) + v(t) * dt
     * 
     * @param {Vector3} position - Current position
     * @param {Vector3} velocity - Current velocity
     * @param {Vector3} acceleration - Current acceleration
     * @param {number} deltaTime - Time step
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
     * Updates position first, then velocity
     * Better energy conservation than explicit Euler
     * 
     * Mathematical:
     * p(t+dt) = p(t) + v(t) * dt
     * v(t+dt) = v(t) + a(t+dt) * dt
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

