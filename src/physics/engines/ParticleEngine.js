/**
 * ParticleEngine - Particle System Physics Engine
 * 
 * Manages particles with physics simulation.
 * Each particle is a simple body with position, velocity, and forces.
 * 
 * Mathematical Foundation:
 * - Each particle follows: F = ma
 * - Forces: gravity, damping, springs (for particle interactions)
 * - Integration: Uses Euler or Verlet for position updates
 */

import { Body } from '../core/Body.js';
import { Vector3 } from '../math/Vector3.js';
import { Sphere } from '../collision/shapes/Sphere.js';
import { EulerIntegrator } from '../integrators/EulerIntegrator.js';

export class ParticleEngine {
    constructor(world) {
        this.world = world;
        this.particles = [];
        this.gravity = new Vector3(0, -9.81, 0);
        this.damping = 0.98;
    }

    /**
     * Create a particle
     */
    createParticle(position, velocity = new Vector3(), radius = 0.1, mass = 0.1) {
        const particle = new Body();
        particle.position.copy(position);
        particle.velocity.copy(velocity);
        particle.mass = mass;
        particle.inverseMass = 1 / mass;
        particle.damping = this.damping;
        
        // Add sphere collision shape
        particle.collisionShape = new Sphere(radius);
        particle.collisionShape.body = particle;
        particle.collisionShape.updateCenter(particle.position);
        
        // Set collision groups for particles
        particle.collisionGroup = 1;
        particle.collisionMask = -1; // Collide with everything
        
        this.particles.push(particle);
        this.world.addBody(particle);
        
        return particle;
    }

    /**
     * Update particles
     */
    update(deltaTime) {
        for (const particle of this.particles) {
            if (particle.isStatic) continue;

            // Apply gravity
            const gravityForce = this.gravity.clone().multiplyScalar(particle.mass);
            particle.applyForce(gravityForce);

            // Update acceleration
            particle.updateAcceleration();

            // Integrate motion
            EulerIntegrator.integrate(
                particle.position,
                particle.velocity,
                particle.acceleration,
                deltaTime
            );

            // Update collision shape position
            if (particle.collisionShape) {
                if (particle.collisionShape.updateCenter) {
                    particle.collisionShape.updateCenter(particle.position);
                }
                if (particle.collisionShape.updateBounds) {
                    particle.collisionShape.updateBounds(
                        particle.position,
                        particle.rotation,
                        particle.scale
                    );
                }
            }

            // Clear forces for next frame
            particle.clearForces();
        }
    }

    /**
     * Remove particle
     */
    removeParticle(particle) {
        const index = this.particles.indexOf(particle);
        if (index !== -1) {
            this.particles.splice(index, 1);
            this.world.removeBody(particle);
        }
    }

    /**
     * Clear all particles
     */
    clear() {
        for (const particle of this.particles) {
            this.world.removeBody(particle);
        }
        this.particles = [];
    }
}

