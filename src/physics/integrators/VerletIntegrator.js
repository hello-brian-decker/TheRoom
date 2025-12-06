/**
 * VerletIntegrator - Verlet Integration Method
 * 
 * A velocity-less integration method that is more stable than Euler.
 * Commonly used in molecular dynamics and particle simulations.
 * 
 * Mathematical Foundation:
 * Verlet integration uses Taylor expansion:
 * p(t+dt) = p(t) + v(t)*dt + (1/2)*a(t)*dt² + O(dt³)
 * p(t-dt) = p(t) - v(t)*dt + (1/2)*a(t)*dt² + O(dt³)
 * 
 * Adding these: p(t+dt) = 2*p(t) - p(t-dt) + a(t)*dt²
 * 
 * Properties:
 * - Second-order method (error O(dt³))
 * - More stable than Euler
 * - Better energy conservation
 * - Doesn't explicitly track velocity (can be computed if needed)
 * - Time-reversible (symplectic)
 * 
 * @example
 * // Standard Verlet (requires previous position)
 * VerletIntegrator.integrate(position, previousPosition, acceleration, deltaTime);
 * 
 * // Velocity Verlet (tracks velocity)
 * VerletIntegrator.integrateVelocityVerlet(position, velocity, acceleration, newAcceleration, deltaTime);
 */
import { Vector3 } from '../math/Vector3.js';

export class VerletIntegrator {
    /**
     * Standard Verlet integration
     * 
     * Requires storing previous position. More stable than Euler and
     * better for long-term simulations.
     * 
     * Mathematical:
     * p(t+dt) = 2*p(t) - p(t-dt) + a(t)*dt²
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} previousPosition - Position at previous time step (modified in-place)
     * @param {Vector3} acceleration - Current acceleration
     * @param {number} deltaTime - Time step in seconds
     * @example
     * VerletIntegrator.integrate(position, previousPosition, acceleration, 0.016);
     */
    static integrate(position, previousPosition, acceleration, deltaTime) {
        const dt2 = deltaTime * deltaTime;
        const newX = 2 * position.x - previousPosition.x + acceleration.x * dt2;
        const newY = 2 * position.y - previousPosition.y + acceleration.y * dt2;
        const newZ = 2 * position.z - previousPosition.z + acceleration.z * dt2;

        // Update previous position before updating current
        previousPosition.copy(position);
        
        // Update current position
        position.set(newX, newY, newZ);
    }

    /**
     * Velocity Verlet (explicitly tracks velocity)
     * 
     * More commonly used variant that explicitly tracks velocity.
     * Requires knowing acceleration at the next time step.
     * 
     * Mathematical:
     * v(t+dt/2) = v(t) + (1/2)*a(t)*dt
     * p(t+dt) = p(t) + v(t+dt/2)*dt
     * v(t+dt) = v(t+dt/2) + (1/2)*a(t+dt)*dt
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} velocity - Current velocity (modified in-place)
     * @param {Vector3} acceleration - Current acceleration
     * @param {Vector3} newAcceleration - Acceleration at next time step (must be computed)
     * @param {number} deltaTime - Time step in seconds
     * @example
     * const newAccel = computeAcceleration(position, velocity);
     * VerletIntegrator.integrateVelocityVerlet(position, velocity, acceleration, newAccel, deltaTime);
     */
    static integrateVelocityVerlet(position, velocity, acceleration, newAcceleration, deltaTime) {
        // Half-step velocity update
        velocity.x += 0.5 * acceleration.x * deltaTime;
        velocity.y += 0.5 * acceleration.y * deltaTime;
        velocity.z += 0.5 * acceleration.z * deltaTime;

        // Position update
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;
        position.z += velocity.z * deltaTime;

        // Complete velocity update with new acceleration
        velocity.x += 0.5 * newAcceleration.x * deltaTime;
        velocity.y += 0.5 * newAcceleration.y * deltaTime;
        velocity.z += 0.5 * newAcceleration.z * deltaTime;
    }

    /**
     * Compute velocity from Verlet positions
     * 
     * Calculates velocity from current and previous positions.
     * Useful when using standard Verlet integration which doesn't track velocity.
     * 
     * Mathematical:
     * v(t) = (p(t+dt) - p(t-dt)) / (2*dt)
     * 
     * @param {Vector3} currentPosition - Current position
     * @param {Vector3} previousPosition - Previous position
     * @param {number} deltaTime - Time step in seconds
     * @returns {Vector3} Computed velocity vector
     * @example
     * const velocity = VerletIntegrator.computeVelocity(position, previousPosition, deltaTime);
     */
    static computeVelocity(currentPosition, previousPosition, deltaTime) {
        const velocity = new Vector3();
        velocity.subVectors(currentPosition, previousPosition);
        velocity.divideScalar(2 * deltaTime);
        return velocity;
    }
}

