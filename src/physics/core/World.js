/**
 * World - Physics World Container
 * 
 * Manages all physics bodies, handles collisions, and updates the simulation.
 * 
 * Mathematical Foundation:
 * The world integrates Newton's laws of motion:
 * 1. F = ma (force equals mass times acceleration)
 * 2. Every action has an equal and opposite reaction
 * 3. Conservation of momentum: Σ(mv) = constant
 */

import { Vector3 } from '../math/Vector3.js';
import { Body } from './Body.js';

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
     */
    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index !== -1) {
            this.bodies.splice(index, 1);
            this.stats.bodies = this.bodies.length;
        }
    }

    /**
     * Clear all bodies
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
     * This is a placeholder - actual integration is done by engines
     */
    integrate(deltaTime) {
        // Integration is handled by specific physics engines
        // This is a placeholder for the base world
    }

    /**
     * Detect collisions between bodies
     * Placeholder - actual detection is done by collision system
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
     * Mathematical Foundation:
     * When two bodies collide, we apply impulses to separate them.
     * Impulse: J = -(1 + e) * (v_rel · n) / (1/m1 + 1/m2)
     * where e is coefficient of restitution, v_rel is relative velocity, n is collision normal
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
     */
    getRelativeVelocity(bodyA, bodyB, normal) {
        const vA = bodyA.velocity.clone();
        const vB = bodyB.velocity.clone();
        const relativeV = vA.sub(vB);
        return relativeV.dot(normal);
    }

    /**
     * Calculate friction impulse
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
     * Returns first body hit by ray
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

