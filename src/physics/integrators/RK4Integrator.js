/**
 * RK4Integrator - Runge-Kutta 4th Order Integration
 * 
 * A high-accuracy numerical integration method.
 * Uses four evaluations of the derivative function per time step.
 * 
 * Mathematical Foundation:
 * Given dx/dt = f(x, t), RK4 computes:
 * 
 * k1 = f(x(t), t) * dt
 * k2 = f(x(t) + k1/2, t + dt/2) * dt
 * k3 = f(x(t) + k2/2, t + dt/2) * dt
 * k4 = f(x(t) + k3, t + dt) * dt
 * 
 * x(t+dt) = x(t) + (k1 + 2*k2 + 2*k3 + k4) / 6
 * 
 * Properties:
 * - Fourth-order method (error O(dt⁵))
 * - Very accurate for smooth functions
 * - More expensive than Euler (4 function evaluations vs 1)
 * - Excellent for high-precision simulations
 * - Good energy conservation
 * 
 * @example
 * // Use RK4 for orbital mechanics
 * const accelFunc = (pos, vel, t) => {
 *     const r = pos.length();
 *     const force = pos.clone().negate().multiplyScalar(GM / (r * r * r));
 *     return force;
 * };
 * RK4Integrator.integrate(position, velocity, accelFunc, deltaTime, currentTime);
 */
import { Vector3 } from '../math/Vector3.js';

export class RK4Integrator {
    /**
     * Integrate using Runge-Kutta 4th order method
     * 
     * Performs high-accuracy integration using four function evaluations.
     * Best for systems requiring high precision (orbital mechanics, etc.).
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} velocity - Current velocity (modified in-place)
     * @param {Function} accelerationFunction - Function that computes acceleration: a(p, v, t) -> Vector3
     * @param {number} deltaTime - Time step in seconds
     * @param {number} [currentTime=0] - Current time (for time-dependent forces)
     * @example
     * RK4Integrator.integrate(position, velocity, accelFunc, 0.016, time);
     */
    static integrate(position, velocity, accelerationFunction, deltaTime, currentTime = 0) {
        // k1: evaluate at current state
        const k1v = accelerationFunction(position, velocity, currentTime);
        const k1p = velocity.clone();

        // k2: evaluate at midpoint using k1
        const midPos1 = position.clone().add(k1p.clone().multiplyScalar(0.5 * deltaTime));
        const midVel1 = velocity.clone().add(k1v.clone().multiplyScalar(0.5 * deltaTime));
        const k2v = accelerationFunction(midPos1, midVel1, currentTime + 0.5 * deltaTime);
        const k2p = midVel1.clone();

        // k3: evaluate at midpoint using k2
        const midPos2 = position.clone().add(k2p.clone().multiplyScalar(0.5 * deltaTime));
        const midVel2 = velocity.clone().add(k2v.clone().multiplyScalar(0.5 * deltaTime));
        const k3v = accelerationFunction(midPos2, midVel2, currentTime + 0.5 * deltaTime);
        const k3p = midVel2.clone();

        // k4: evaluate at end using k3
        const endPos = position.clone().add(k3p.clone().multiplyScalar(deltaTime));
        const endVel = velocity.clone().add(k3v.clone().multiplyScalar(deltaTime));
        const k4v = accelerationFunction(endPos, endVel, currentTime + deltaTime);
        const k4p = endVel.clone();

        // Combine: x(t+dt) = x(t) + (k1 + 2*k2 + 2*k3 + k4) / 6
        const dt6 = deltaTime / 6;

        // Update velocity
        velocity.x += (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x) * dt6;
        velocity.y += (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y) * dt6;
        velocity.z += (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z) * dt6;

        // Update position
        position.x += (k1p.x + 2 * k2p.x + 2 * k3p.x + k4p.x) * dt6;
        position.y += (k1p.y + 2 * k2p.y + 2 * k3p.y + k4p.y) * dt6;
        position.z += (k1p.z + 2 * k2p.z + 2 * k3p.z + k4p.z) * dt6;
    }

    /**
     * Simplified RK4 for position-velocity systems
     * 
     * Assumes acceleration is a function of position and velocity only
     * (no explicit time dependence). Updates the acceleration parameter
     * for use in the next step.
     * 
     * @param {Vector3} position - Current position (modified in-place)
     * @param {Vector3} velocity - Current velocity (modified in-place)
     * @param {Vector3} acceleration - Current acceleration (will be recomputed)
     * @param {Function} accelerationFunction - Function: a(p, v) -> Vector3
     * @param {number} deltaTime - Time step in seconds
     * @example
     * RK4Integrator.integrateSimple(position, velocity, acceleration, accelFunc, 0.016);
     */
    static integrateSimple(position, velocity, acceleration, accelerationFunction, deltaTime) {
        // k1
        const k1v = accelerationFunction(position, velocity);
        const k1p = velocity.clone();

        // k2
        const midPos1 = position.clone().add(k1p.clone().multiplyScalar(0.5 * deltaTime));
        const midVel1 = velocity.clone().add(k1v.clone().multiplyScalar(0.5 * deltaTime));
        const k2v = accelerationFunction(midPos1, midVel1);
        const k2p = midVel1.clone();

        // k3
        const midPos2 = position.clone().add(k2p.clone().multiplyScalar(0.5 * deltaTime));
        const midVel2 = velocity.clone().add(k2v.clone().multiplyScalar(0.5 * deltaTime));
        const k3v = accelerationFunction(midPos2, midVel2);
        const k3p = midVel2.clone();

        // k4
        const endPos = position.clone().add(k3p.clone().multiplyScalar(deltaTime));
        const endVel = velocity.clone().add(k3v.clone().multiplyScalar(deltaTime));
        const k4v = accelerationFunction(endPos, endVel);
        const k4p = endVel.clone();

        // Combine
        const dt6 = deltaTime / 6;

        velocity.x += (k1v.x + 2 * k2v.x + 2 * k3v.x + k4v.x) * dt6;
        velocity.y += (k1v.y + 2 * k2v.y + 2 * k3v.y + k4v.y) * dt6;
        velocity.z += (k1v.z + 2 * k2v.z + 2 * k3v.z + k4v.z) * dt6;

        position.x += (k1p.x + 2 * k2p.x + 2 * k3p.x + k4p.x) * dt6;
        position.y += (k1p.y + 2 * k2p.y + 2 * k3p.y + k4p.y) * dt6;
        position.z += (k1p.z + 2 * k2p.z + 2 * k3p.z + k4p.z) * dt6;

        // Update acceleration for next step
        acceleration.copy(accelerationFunction(position, velocity));
    }
}

