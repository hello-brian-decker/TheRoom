/**
 * Body - Base Physics Body Class
 * 
 * Represents a physical object in the physics simulation.
 * Contains position, velocity, acceleration, mass, and other physical properties.
 * 
 * Mathematical Foundation:
 * - Position: p(t) - location in 3D space
 * - Velocity: v(t) = dp/dt - rate of change of position
 * - Acceleration: a(t) = dv/dt = d²p/dt² - rate of change of velocity
 * - Force: F = ma (Newton's second law)
 * - Momentum: p = mv
 * - Torque: τ = r × F (rotational force)
 * - Angular momentum: L = Iω (moment of inertia × angular velocity)
 * 
 * @example
 * // Create a physics body
 * const body = new Body();
 * body.position.set(0, 10, 0);
 * body.setMass(1.0);
 * body.velocity.set(5, 0, 0);
 * 
 * // Apply a force
 * body.applyForce(new Vector3(0, -9.81, 0));
 * 
 * // Make it static (immovable)
 * body.setStatic();
 */
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

export class Body {
    constructor() {
        // Position and orientation
        this.position = new Vector3();
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        // Linear motion
        this.velocity = new Vector3();
        this.acceleration = new Vector3();
        this.force = new Vector3();

        // Angular motion
        this.angularVelocity = new Vector3();
        this.angularAcceleration = new Vector3();
        this.torque = new Vector3();

        // Physical properties
        this.mass = 1.0;
        this.inverseMass = 1.0; // 1/mass (for efficiency)
        this.restitution = 0.5; // Bounciness (0 = no bounce, 1 = perfect bounce)
        this.friction = 0.5; // Friction coefficient
        this.damping = 0.99; // Velocity damping (0-1, 1 = no damping)
        this.angularDamping = 0.99; // Angular velocity damping

        // Inertia tensor (for rotational dynamics)
        // For a box: I = (1/12) * m * (h² + d²) for each axis
        this.inertia = new Vector3(1, 1, 1);
        this.inverseInertia = new Vector3(1, 1, 1);

        // State flags
        this.isStatic = false; // Static bodies don't move
        this.isKinematic = false; // Kinematic bodies move but aren't affected by forces
        this.isAwake = true; // Sleeping bodies don't update

        // Collision properties
        this.collisionShape = null;
        this.collisionGroup = 1; // Bitmask for collision filtering
        this.collisionMask = -1; // What groups this body can collide with

        // Previous state (for Verlet integration)
        this.previousPosition = new Vector3();
    }

    /**
     * Set mass and update inverse mass and inertia
     * 
     * Updates the body's mass and automatically recalculates:
     * - Inverse mass (1/mass) for efficient force calculations
     * - Inertia tensor based on current scale
     * 
     * @param {number} mass - Mass value (must be positive)
     * @example
     * body.setMass(2.5); // Set mass to 2.5 kg
     */
    setMass(mass) {
        if (mass <= 0) {
            console.warn('Body.setMass: Mass must be positive');
            return;
        }
        this.mass = mass;
        this.inverseMass = 1.0 / mass;
        this.updateInertia();
    }

    /**
     * Set as static (infinite mass, doesn't move)
     * 
     * Static bodies are immovable objects like walls, floors, or fixed platforms.
     * They have infinite mass and zero velocity, and are not affected by forces.
     * 
     * @example
     * // Create a ground plane
     * const ground = new Body();
     * ground.setStatic();
     * ground.position.set(0, 0, 0);
     */
    setStatic() {
        this.isStatic = true;
        this.mass = Infinity;
        this.inverseMass = 0;
        this.velocity.zero();
        this.angularVelocity.zero();
        this.updateInertia();
    }

    /**
     * Set as kinematic (moves but not affected by forces)
     * 
     * Kinematic bodies can be moved programmatically but are not affected
     * by physics forces. Useful for moving platforms, elevators, or objects
     * controlled by animation.
     * 
     * @example
     * // Create a moving platform
     * const platform = new Body();
     * platform.setKinematic();
     * // Move it programmatically
     * platform.position.y = Math.sin(time) * 2;
     */
    setKinematic() {
        this.isKinematic = true;
        this.mass = Infinity;
        this.inverseMass = 0;
        this.updateInertia();
    }

    /**
     * Update inertia tensor based on shape and mass
     * 
     * Calculates the moment of inertia tensor for rotational dynamics.
     * Currently uses a box inertia approximation:
     * I = (1/12) * m * (h² + d²) for each axis
     * 
     * For static/kinematic bodies, sets inertia to infinity.
     * 
     * @example
     * body.scale.set(2, 1, 1); // Change scale
     * body.updateInertia(); // Recalculate inertia
     */
    updateInertia() {
        if (this.isStatic || this.isKinematic) {
            this.inertia.set(Infinity, Infinity, Infinity);
            this.inverseInertia.set(0, 0, 0);
            return;
        }

        // Simple box inertia approximation
        // I = (1/12) * m * (h² + d²) for each axis
        const sx = this.scale.x;
        const sy = this.scale.y;
        const sz = this.scale.z;

        this.inertia.x = (1 / 12) * this.mass * (sy * sy + sz * sz);
        this.inertia.y = (1 / 12) * this.mass * (sx * sx + sz * sz);
        this.inertia.z = (1 / 12) * this.mass * (sx * sx + sy * sy);

        this.inverseInertia.x = 1 / this.inertia.x;
        this.inverseInertia.y = 1 / this.inertia.y;
        this.inverseInertia.z = 1 / this.inertia.z;
    }

    /**
     * Apply force to body
     * 
     * Forces accumulate and are applied during integration.
     * Mathematical: F = ma, so a = F/m
     * 
     * @param {Vector3} force - Force vector to apply
     * @example
     * // Apply gravity
     * body.applyForce(new Vector3(0, -9.81 * body.mass, 0));
     */
    applyForce(force) {
        if (this.isStatic || this.isKinematic) return;
        this.force.add(force);
    }

    /**
     * Apply force at a point (creates torque)
     * 
     * Applies both linear force and rotational torque.
     * Mathematical: τ = r × F where r is vector from center to point
     * 
     * @param {Vector3} force - Force vector to apply
     * @param {Vector3} point - World-space point where force is applied
     * @example
     * // Push a box at its corner to make it rotate
     * const corner = body.position.clone().add(new Vector3(0.5, 0.5, 0));
     * body.applyForceAtPoint(new Vector3(10, 0, 0), corner);
     */
    applyForceAtPoint(force, point) {
        if (this.isStatic || this.isKinematic) return;
        
        // Apply linear force
        this.force.add(force);

        // Calculate torque: τ = r × F
        const r = new Vector3().subVectors(point, this.position);
        const torque = new Vector3().crossVectors(r, force);
        this.torque.add(torque);
    }

    /**
     * Apply impulse (instantaneous change in momentum)
     * 
     * Impulses are applied immediately, unlike forces which accumulate.
     * Useful for collisions, jumps, or instant velocity changes.
     * Mathematical: Δv = J / m where J is impulse
     * 
     * @param {Vector3} impulse - Impulse vector
     * @example
     * // Make body jump
     * body.applyImpulse(new Vector3(0, 10, 0));
     */
    applyImpulse(impulse) {
        if (this.isStatic || this.isKinematic) return;
        const deltaV = impulse.clone().multiplyScalar(this.inverseMass);
        this.velocity.add(deltaV);
    }

    /**
     * Apply angular impulse (instantaneous change in angular momentum)
     * 
     * Applies an instantaneous change to angular velocity.
     * Mathematical: Δω = J_angular / I where I is moment of inertia
     * 
     * @param {Vector3} impulse - Angular impulse vector
     * @example
     * // Spin the body
     * body.applyAngularImpulse(new Vector3(0, 5, 0));
     */
    applyAngularImpulse(impulse) {
        if (this.isStatic || this.isKinematic) return;
        const deltaW = new Vector3(
            impulse.x * this.inverseInertia.x,
            impulse.y * this.inverseInertia.y,
            impulse.z * this.inverseInertia.z
        );
        this.angularVelocity.add(deltaW);
    }

    /**
     * Clear accumulated forces and torques
     * 
     * Called automatically after each integration step.
     * Can be called manually to reset forces.
     * 
     * @example
     * body.clearForces(); // Reset all forces
     */
    clearForces() {
        this.force.zero();
        this.torque.zero();
    }

    /**
     * Update acceleration from forces
     * 
     * Calculates acceleration from accumulated forces using Newton's second law.
     * Mathematical: a = F / m (linear), α = τ / I (angular)
     * 
     * Called automatically during physics integration.
     * 
     * @example
     * body.applyForce(new Vector3(10, 0, 0));
     * body.updateAcceleration(); // Calculate acceleration
     */
    updateAcceleration() {
        if (this.isStatic || this.isKinematic) {
            this.acceleration.zero();
            this.angularAcceleration.zero();
            return;
        }

        // Linear acceleration: a = F / m
        this.acceleration.copy(this.force).multiplyScalar(this.inverseMass);

        // Angular acceleration: α = τ / I
        this.angularAcceleration.set(
            this.torque.x * this.inverseInertia.x,
            this.torque.y * this.inverseInertia.y,
            this.torque.z * this.inverseInertia.z
        );
    }

    /**
     * Get world-space bounding box
     * 
     * Returns an axis-aligned bounding box (AABB) for collision detection.
     * Uses the collision shape if available, otherwise returns a default box.
     * 
     * @returns {Object} Bounding box with min and max Vector3 properties
     * @example
     * const bbox = body.getBoundingBox();
     * console.log(`Bounds: ${bbox.min} to ${bbox.max}`);
     */
    getBoundingBox() {
        if (this.collisionShape) {
            // Update shape bounds if needed
            if (this.collisionShape.updateBounds) {
                this.collisionShape.updateBounds(this.position, this.rotation, this.scale);
            }
            if (this.collisionShape.updateCenter) {
                this.collisionShape.updateCenter(this.position);
            }
            
            // Use shape's bounding box
            if (this.collisionShape.min && this.collisionShape.max) {
                return {
                    min: this.collisionShape.min.clone(),
                    max: this.collisionShape.max.clone()
                };
            }
            if (this.collisionShape.center && this.collisionShape.radius !== undefined) {
                const r = this.collisionShape.radius;
                return {
                    min: this.collisionShape.center.clone().sub(new Vector3(r, r, r)),
                    max: this.collisionShape.center.clone().add(new Vector3(r, r, r))
                };
            }
        }
        
        // Default implementation
        return {
            min: this.position.clone().sub(new Vector3(0.5, 0.5, 0.5)),
            max: this.position.clone().add(new Vector3(0.5, 0.5, 0.5))
        };
    }

    /**
     * Clone this body
     * 
     * Creates a deep copy of the body with all properties duplicated.
     * Useful for creating templates or duplicating objects.
     * 
     * @returns {Body} A new Body instance with copied properties
     * @example
     * const original = new Body();
     * original.setMass(5);
     * const copy = original.clone();
     */
    clone() {
        const body = new Body();
        body.position.copy(this.position);
        body.rotation.copy(this.rotation);
        body.scale.copy(this.scale);
        body.velocity.copy(this.velocity);
        body.angularVelocity.copy(this.angularVelocity);
        body.mass = this.mass;
        body.inverseMass = this.inverseMass;
        body.restitution = this.restitution;
        body.friction = this.friction;
        body.damping = this.damping;
        body.angularDamping = this.angularDamping;
        body.isStatic = this.isStatic;
        body.isKinematic = this.isKinematic;
        return body;
    }
}

