/**
 * World - Physics World Container
 * 
 * Manages all physics bodies, handles collisions, and updates the simulation.
 * The World class is the central coordinator for all physics simulation.
 * 
 * Mathematical Foundation:
 * The world integrates Newton's laws of motion:
 * 1. F = ma (force equals mass times acceleration)
 * 2. Every action has an equal and opposite reaction
 * 3. Conservation of momentum: Σ(mv) = constant
 * 
 * Simulation Process:
 * 1. Apply forces (gravity, etc.)
 * 2. Integrate motion (update positions/velocities)
 * 3. Detect collisions
 * 4. Resolve collisions (apply impulses)
 * 5. Update constraints
 * 
 * @example
 * // Create a physics world
 * const world = new World();
 * world.gravity.set(0, -9.81, 0);
 * 
 * // Add bodies
 * const body = new Body();
 * world.addBody(body);
 * 
 * // Step simulation
 * world.step(1/60); // 60 FPS
 */
import { Vector3 } from '../math/Vector3.js';
import { Body } from './Body.js';
import { EulerIntegrator } from '../integrators/EulerIntegrator.js';

export class World {
    constructor() {
        // Bodies in the world
        this.bodies = [];

        // Gravity (default: Earth gravity in -Y direction)
        this.gravity = new Vector3(0, -9.81, 0);

        // Time step and accumulator for fixed timestep
        this.timeStep = 1 / 60; // 60 FPS
        this.maxSubSteps = 10; // Maximum substeps per frame
        this.timeAccumulator = 0;

        // Collision pairs (pairs of bodies that are colliding)
        this.collisionPairs = [];

        // Contact constraints (for collision resolution)
        this.contacts = [];

        // Spatial partitioning (will be set by collision detector)
        this.broadPhase = null;
        this.narrowPhase = null;

        // Performance stats
        this.stats = {
            bodies: 0,
            collisions: 0,
            contacts: 0,
            updateTime: 0
        };
    }

    /**
     * Add a body to the world
     * 
     * Adds a physics body to the simulation. The body will be affected by
     * gravity, collisions, and other physics forces.
     * 
     * @param {Body} body - The physics body to add
     * @example
     * const body = new Body();
     * body.position.set(0, 10, 0);
     * world.addBody(body);
     */
    addBody(body) {
        if (!(body instanceof Body)) {
            console.error('World.addBody: body must be an instance of Body');
            return;
        }
        this.bodies.push(body);
        this.stats.bodies = this.bodies.length;
    }

    /**
     * Remove a body from the world
     * 
     * Removes a physics body from the simulation. The body will no longer
     * be updated or participate in collisions.
     * 
     * @param {Body} body - The physics body to remove
     * @example
     * world.removeBody(body);
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
            this.stats.bodies = this.bodies.length;
        }
    }

    /**
     * Clear all bodies from the world
     * 
     * Removes all bodies and resets collision data.
     * Useful for resetting the simulation.
     * 
     * @example
     * world.clear(); // Remove all bodies
     */
    clear() {
        this.bodies = [];
        this.collisionPairs = [];
        this.contacts = [];
        this.stats.bodies = 0;
    }

    /**
     * Step the simulation forward
     * 
     * Mathematical Process:
     * 1. Apply forces (gravity, etc.)
     * 2. Integrate motion (update positions/velocities)
     * 3. Detect collisions
     * 4. Resolve collisions (apply impulses)
     * 5. Update constraints
     * 
     * @param {number} deltaTime - Time elapsed since last step
     */
    step(deltaTime) {
        const startTime = performance.now();

        // Fixed timestep with accumulator
        this.timeAccumulator += deltaTime;
        const steps = Math.min(
            Math.floor(this.timeAccumulator / this.timeStep),
            this.maxSubSteps
        );
        this.timeAccumulator -= steps * this.timeStep;

        // Perform fixed timestep updates
        for (let i = 0; i < steps; i++) {
            this.fixedStep(this.timeStep);
        }

        this.stats.updateTime = performance.now() - startTime;
    }

    /**
     * Fixed timestep update
     * 
     * Performs a single fixed timestep of the physics simulation.
     * This ensures deterministic physics regardless of frame rate.
     * 
     * @param {number} deltaTime - Fixed time step in seconds
     * @private
     */
    fixedStep(deltaTime) {
        // 1. Apply forces (gravity, etc.)
        this.applyForces(deltaTime);

        // 2. Integrate motion
        this.integrate(deltaTime);

        // 3. Detect collisions
        this.detectCollisions();

        // 4. Resolve collisions
        this.resolveCollisions(deltaTime);

        // 5. Update constraints (if any)
        // This would be called here if we had constraints
    }

    /**
     * Apply forces to all bodies
     * 
     * Applies gravity and damping to all dynamic bodies.
     * Called automatically during simulation step.
     * 
     * @param {number} deltaTime - Time step in seconds
     * @private
     */
    applyForces(deltaTime) {
        for (const body of this.bodies) {
            if (body.isStatic || body.isKinematic) continue;

            // Apply gravity
            const gravityForce = this.gravity.clone().multiplyScalar(body.mass);
            body.applyForce(gravityForce);

            // Apply damping
            body.velocity.multiplyScalar(body.damping);
            body.angularVelocity.multiplyScalar(body.angularDamping);
        }
    }

    /**
     * Integrate motion for all bodies
     * 
     * Updates positions and velocities based on forces and acceleration.
     * Uses Euler integration by default.
     * Called automatically during simulation step.
     * 
     * @param {number} deltaTime - Time step in seconds
     * @private
     */
    integrate(deltaTime) {
        for (const body of this.bodies) {
            if (body.isStatic || body.isKinematic) continue;

            // Update acceleration from accumulated forces
            body.updateAcceleration();

            // Integrate motion using Euler method
            EulerIntegrator.integrate(
                body.position,
                body.velocity,
                body.acceleration,
                deltaTime
            );

            // Clear forces for next frame
            body.clearForces();
        }
    }

    /**
     * Detect collisions between bodies
     * 
     * Placeholder method - actual collision detection is handled by
     * the collision system (CollisionDetector). This method clears
     * previous collision data.
     * 
     * @private
     */
    detectCollisions() {
        // Collision detection is handled by collision system
        // This clears previous collisions
        this.collisionPairs = [];
        this.contacts = [];
    }

    /**
     * Resolve collisions using impulse-based method
     * 
     * Applies impulses to colliding bodies to separate them and simulate
     * realistic collision response with friction and restitution.
     * 
     * Mathematical Foundation:
     * When two bodies collide, we apply impulses to separate them.
     * Impulse: J = -(1 + e) * (v_rel · n) / (1/m1 + 1/m2)
     * where e is coefficient of restitution, v_rel is relative velocity, n is collision normal
     * 
     * @param {number} deltaTime - Time step in seconds
     * @private
     */
    resolveCollisions(deltaTime) {
        for (const contact of this.contacts) {
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;

            // Relative velocity at contact point
            const relativeVelocity = this.getRelativeVelocity(bodyA, bodyB, contact.normal);

            // Don't resolve if separating
            if (relativeVelocity > 0) continue;

            // Calculate impulse magnitude
            const e = Math.min(bodyA.restitution, bodyB.restitution); // Coefficient of restitution
            const j = -(1 + e) * relativeVelocity;
            const denominator = bodyA.inverseMass + bodyB.inverseMass;
            if (denominator === 0) continue; // Both static

            const impulseMagnitude = j / denominator;

            // Apply impulse
            const impulse = contact.normal.clone().multiplyScalar(impulseMagnitude);
            bodyA.applyImpulse(impulse.clone().negate());
            bodyB.applyImpulse(impulse);

            // Friction impulse (simplified)
            const frictionImpulse = this.calculateFrictionImpulse(bodyA, bodyB, contact);
            bodyA.applyImpulse(frictionImpulse.clone().negate());
            bodyB.applyImpulse(frictionImpulse);

            // Position correction (penetration resolution)
            const penetration = contact.penetration || 0;
            if (penetration > 0) {
                const correction = contact.normal.clone().multiplyScalar(penetration * 0.2);
                const totalMass = bodyA.mass + bodyB.mass;
                if (totalMass > 0) {
                    bodyA.position.sub(correction.clone().multiplyScalar(bodyA.mass / totalMass));
                    bodyB.position.add(correction.clone().multiplyScalar(bodyB.mass / totalMass));
                }
            }
        }

        this.stats.contacts = this.contacts.length;
    }

    /**
     * Get relative velocity between two bodies at contact point
     * 
     * Calculates the relative velocity along the collision normal.
     * Used for collision resolution.
     * 
     * @param {Body} bodyA - First body
     * @param {Body} bodyB - Second body
     * @param {Vector3} normal - Collision normal
     * @returns {number} Relative velocity along normal
     * @private
     */
    getRelativeVelocity(bodyA, bodyB, normal) {
        const vA = bodyA.velocity.clone();
        const vB = bodyB.velocity.clone();
        const relativeV = vA.sub(vB);
        return relativeV.dot(normal);
    }

    /**
     * Calculate friction impulse
     * 
     * Calculates the friction impulse to apply during collision resolution.
     * Uses Coulomb friction model.
     * 
     * @param {Body} bodyA - First body
     * @param {Body} bodyB - Second body
     * @param {Object} contact - Contact information
     * @returns {Vector3} Friction impulse vector
     * @private
     */
    calculateFrictionImpulse(bodyA, bodyB, contact) {
        const relativeVelocity = new Vector3().subVectors(bodyA.velocity, bodyB.velocity);
        const tangent = relativeVelocity.clone().sub(
            contact.normal.clone().multiplyScalar(relativeVelocity.dot(contact.normal))
        ).normalize();

        const frictionCoeff = Math.sqrt(bodyA.friction * bodyB.friction);
        const jt = -relativeVelocity.dot(tangent);
        const denominator = bodyA.inverseMass + bodyB.inverseMass;
        if (denominator === 0) return new Vector3();

        const frictionMagnitude = Math.min(jt / denominator, frictionCoeff);
        return tangent.multiplyScalar(frictionMagnitude);
    }

    /**
     * Raycast into the world
     * 
     * Casts a ray into the world and returns the first body hit.
     * Currently a placeholder - full implementation would test against
     * all collision shapes.
     * 
     * @param {Vector3} origin - Ray origin point
     * @param {Vector3} direction - Ray direction (should be normalized)
     * @param {number} [maxDistance=Infinity] - Maximum ray distance
     * @returns {Object|null} Hit information or null if no hit
     * @example
     * const hit = world.raycast(
     *     new Vector3(0, 10, 0),
     *     new Vector3(0, -1, 0),
     *     20
     * );
     */
    raycast(origin, direction, maxDistance = Infinity) {
        let closestHit = null;
        let closestDistance = maxDistance;

        for (const body of this.bodies) {
            if (!body.collisionShape) continue;
            // Raycast would be implemented by collision shapes
            // This is a placeholder
        }

        return closestHit;
    }
}

