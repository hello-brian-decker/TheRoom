/**
 * Waterfall Effect using Physics Engine
 * 
 * Creates a waterfall of colored circles using the physics particle system.
 */

import * as THREE from 'three';
import { Engine } from './physics/core/Engine.js';
import { ParticleEngine } from './physics/engines/ParticleEngine.js';
import { Vector3 } from './physics/math/Vector3.js';

export class Waterfall {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Gravity control (fall speed) - must be set before creating engine
        this.gravityMultiplier = 1.0; // Can be adjusted via UI
        this.baseGravity = -9.81;
        
        // Initialize physics engine
        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = this.baseGravity * this.gravityMultiplier; // Set initial gravity
        this.particleEngine = new ParticleEngine(world);
        
        // Register particle engine
        // Note: Ground collision is handled directly in update() - no collision detector needed
        this.physicsEngine.registerEngine('particles', this.particleEngine);
        
        // Three.js objects for rendering
        this.particleMeshes = new Map();
        this.particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        
        // Force vector arrows
        this.forceArrows = new Map(); // Map<particle, ArrowHelper>
        this.arrowVisibility = new Map(); // Map<particle, boolean>
        this.globalArrowsVisible = false; // Global toggle state
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Arrow parameters
        this.maxForce = 50.0; // Maximum expected force for normalization
        this.baseArrowLength = 0.5;
        this.maxArrowLength = 2.0;
        this.arrowScaleFactor = 0.1;
        
        // Waterfall parameters
        this.spawnRate = 0.15; // Spawn every 0.15 seconds (slower for rubber balls)
        this.spawnTimer = 0;
        this.spawnPosition = new Vector3(0, 5, 0); // Top of waterfall
        this.maxParticles = 100; // Fewer particles for memory efficiency and ball-ball collisions
        
        // Create ground plane
        this.createGround();
        
        // Create UI controls
        this.createControls();
        
        // Setup click handler for raycasting
        this.setupClickHandler();
        
        // Colors for rubber balls (bright, vibrant colors)
        this.colors = [
            new THREE.Color(0xff0000), // Red
            new THREE.Color(0x00ff00), // Green
            new THREE.Color(0x0000ff), // Blue
            new THREE.Color(0xffff00), // Yellow
            new THREE.Color(0xff00ff), // Magenta
            new THREE.Color(0x00ffff), // Cyan
            new THREE.Color(0xff8800), // Orange
            new THREE.Color(0x8800ff), // Purple
        ];
    }

    /**
     * Create UI controls for adjusting fall speed
     */
    createControls() {
        // Create control panel
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'waterfall-controls';
        controlsDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            z-index: 1000;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px 20px;
            border-radius: 5px;
            border: 1px solid #333333;
            font-family: 'Arial', sans-serif;
            color: #333333;
            min-width: 250px;
        `;
        
        // Title
        const title = document.createElement('div');
        title.textContent = 'Rubber Ball Controls';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);
        
        // Gravity slider
        const gravityLabel = document.createElement('div');
        gravityLabel.textContent = 'Fall Speed:';
        gravityLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(gravityLabel);
        
        const gravitySlider = document.createElement('input');
        gravitySlider.type = 'range';
        gravitySlider.min = '0.1';
        gravitySlider.max = '5.0';
        gravitySlider.step = '0.1';
        gravitySlider.value = '1.0';
        gravitySlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        controlsDiv.appendChild(gravitySlider);
        
        const gravityValue = document.createElement('div');
        gravityValue.textContent = `1.0x (Normal)`;
        gravityValue.style.cssText = 'font-size: 11px; color: #0066cc; text-align: center;';
        controlsDiv.appendChild(gravityValue);
        
        // Update gravity when slider changes
        gravitySlider.addEventListener('input', (e) => {
            this.gravityMultiplier = parseFloat(e.target.value);
            const world = this.physicsEngine.getWorld();
            world.gravity.y = this.baseGravity * this.gravityMultiplier;
            
            // Update display
            const speedText = this.gravityMultiplier.toFixed(1);
            let speedLabel = '';
            if (this.gravityMultiplier < 0.5) speedLabel = ' (Very Slow)';
            else if (this.gravityMultiplier < 1.0) speedLabel = ' (Slow)';
            else if (this.gravityMultiplier === 1.0) speedLabel = ' (Normal)';
            else if (this.gravityMultiplier < 2.0) speedLabel = ' (Fast)';
            else speedLabel = ' (Very Fast)';
            
            gravityValue.textContent = `${speedText}x${speedLabel}`;
        });
        
        // Global force vectors toggle button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Show Force Vectors';
        toggleButton.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-top: 10px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
        `;
        toggleButton.addEventListener('click', () => {
            this.globalArrowsVisible = !this.globalArrowsVisible;
            toggleButton.textContent = this.globalArrowsVisible ? 'Hide Force Vectors' : 'Show Force Vectors';
            
            // Update all arrow visibility
            for (const particle of this.particleEngine.particles) {
                if (this.globalArrowsVisible) {
                    this.arrowVisibility.set(particle, true);
                    this.createArrowForParticle(particle);
                } else {
                    this.arrowVisibility.set(particle, false);
                    this.removeArrowForParticle(particle);
                }
            }
        });
        controlsDiv.appendChild(toggleButton);

        // Documentation toggle button
        const docBtn = document.createElement('button');
        docBtn.textContent = '📚 Show Documentation';
        docBtn.style.cssText = 'width: 100%; padding: 8px; margin-top: 10px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;';
        docBtn.addEventListener('click', () => {
            const doc = window.currentDocumentation;
            if (doc) doc.toggle();
        });
        controlsDiv.appendChild(docBtn);
        
        document.body.appendChild(controlsDiv);
        this.controlsDiv = controlsDiv;
    }
    
    /**
     * Setup click handler for raycasting to balls
     */
    setupClickHandler() {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        canvas.addEventListener('click', (event) => {
            // Convert mouse coordinates to normalized device coordinates
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // Update raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Find intersected particle
            const intersectedParticle = this.findIntersectedParticle();
            if (intersectedParticle) {
                // Toggle arrow visibility for this particle
                const currentVisibility = this.arrowVisibility.get(intersectedParticle) || false;
                const newVisibility = !currentVisibility;
                this.arrowVisibility.set(intersectedParticle, newVisibility);
                
                if (newVisibility) {
                    this.createArrowForParticle(intersectedParticle);
                } else {
                    this.removeArrowForParticle(intersectedParticle);
                }
            }
        });
    }
    
    /**
     * Find particle intersected by raycast
     */
    findIntersectedParticle() {
        const particles = this.particleEngine.particles;
        let closestParticle = null;
        let closestDistance = Infinity;
        
        for (const particle of particles) {
            const shape = particle.collisionShape;
            if (!shape) continue;
            
            const radius = shape.radius;
            const center = particle.position;
            
            // Ray-sphere intersection
            const rayOrigin = this.raycaster.ray.origin;
            const rayDirection = this.raycaster.ray.direction;
            
            // Vector from ray origin to sphere center
            const oc = new THREE.Vector3(
                center.x - rayOrigin.x,
                center.y - rayOrigin.y,
                center.z - rayOrigin.z
            );
            
            const a = rayDirection.dot(rayDirection);
            const b = 2.0 * oc.dot(rayDirection);
            const c = oc.dot(oc) - radius * radius;
            const discriminant = b * b - 4 * a * c;
            
            if (discriminant >= 0) {
                const t = (-b - Math.sqrt(discriminant)) / (2 * a);
                if (t > 0 && t < closestDistance) {
                    closestDistance = t;
                    closestParticle = particle;
                }
            }
        }
        
        return closestParticle;
    }
    
    /**
     * Create arrow helper for a particle
     */
    createArrowForParticle(particle) {
        // Don't create if already exists
        if (this.forceArrows.has(particle)) {
            return;
        }
        
        // Create arrow helper (will be updated each frame)
        const direction = new THREE.Vector3(0, -1, 0); // Default direction (downward for gravity)
        const origin = new THREE.Vector3(
            particle.position.x,
            particle.position.y,
            particle.position.z
        );
        const length = this.baseArrowLength;
        const hex = 0x0000ff; // Default blue
        
        const arrow = new THREE.ArrowHelper(direction, origin, length, hex, 0.2, 0.1);
        this.scene.add(arrow);
        this.forceArrows.set(particle, arrow);
    }
    
    /**
     * Remove arrow helper for a particle
     */
    removeArrowForParticle(particle) {
        const arrow = this.forceArrows.get(particle);
        if (arrow) {
            this.scene.remove(arrow);
            // Dispose arrow geometry and material
            if (arrow.line) {
                arrow.line.geometry.dispose();
                arrow.line.material.dispose();
            }
            if (arrow.cone) {
                arrow.cone.geometry.dispose();
                arrow.cone.material.dispose();
            }
            this.forceArrows.delete(particle);
        }
    }
    
    /**
     * Calculate color based on force magnitude
     */
    getForceColor(magnitude) {
        const normalizedMagnitude = Math.min(magnitude / this.maxForce, 1.0);
        
        let color;
        if (normalizedMagnitude < 0.5) {
            // Blue to Yellow
            const t = normalizedMagnitude * 2;
            color = new THREE.Color(0x0000ff).lerp(new THREE.Color(0xffff00), t);
        } else {
            // Yellow to Red
            const t = (normalizedMagnitude - 0.5) * 2;
            color = new THREE.Color(0xffff00).lerp(new THREE.Color(0xff0000), t);
        }
        
        return color.getHex();
    }

    /**
     * Create ground plane for particles to collide with
     * Simplified to a single Y plane for reliability
     */
    createGround() {
        // Ground surface Y position - single line/plane
        this.groundY = -4.0;
        this.groundRestitution = 0.95; // Bounciness
        this.groundFriction = 0.8;
        
        // Visual ground - Physics lab floor
        const groundThickness = 0.2;
        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8, // Light gray lab floor
            roughness: 0.7,
            metalness: 0.1,
            side: THREE.DoubleSide,
            receiveShadow: true
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2; // Rotate to horizontal
        groundMesh.position.y = this.groundY; // Position at ground plane
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);
        this.groundMesh = groundMesh;
        
        // Add grid pattern to floor for lab look
        const gridHelper = new THREE.GridHelper(30, 30, 0xcccccc, 0xcccccc);
        gridHelper.position.y = this.groundY + 0.01; // Slightly above ground
        this.scene.add(gridHelper);
        this.gridHelper = gridHelper;
        
        console.log('Ground plane created at y =', this.groundY);
    }

    /**
     * Spawn a new particle
     */
    spawnParticle() {
        if (this.particleEngine.particles.length >= this.maxParticles) {
            // Remove oldest particle
            const oldest = this.particleEngine.particles[0];
            this.removeParticle(oldest);
        }

        // Random spawn position at top
        const spawnX = this.spawnPosition.x + (Math.random() - 0.5) * 2;
        const spawnZ = this.spawnPosition.z + (Math.random() - 0.5) * 2;
        const position = new Vector3(spawnX, this.spawnPosition.y, spawnZ);
        
        // Random initial velocity (mostly downward, speed depends on gravity)
        // Higher gravity = faster initial fall
        const baseSpeed = Math.abs(this.baseGravity * this.gravityMultiplier) * 0.1;
        const velocity = new Vector3(
            (Math.random() - 0.5) * 0.3,
            -baseSpeed - Math.random() * 0.5, // Downward velocity based on gravity
            (Math.random() - 0.5) * 0.3
        );
        
        // Random size (rubber balls)
        const radius = 0.12 + Math.random() * 0.08; // Slightly larger balls
        const mass = radius * 0.8; // Heavier for more realistic bounce
        
        // Create physics particle
        const particle = this.particleEngine.createParticle(position, velocity, radius, mass);
        
        // Set particle properties for rubber ball behavior
        particle.restitution = 0.85 + Math.random() * 0.1; // High bounce (0.85-0.95) like rubber
        particle.friction = 0.6 + Math.random() * 0.2; // Moderate friction (rubber on surface)
        particle.damping = 0.995; // Very low air resistance (rubber balls maintain energy)
        
        // Create visual representation (rubber ball)
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3, // Shiny like rubber
            metalness: 0.1,
            transparent: false,
            opacity: 1.0
        });
        const mesh = new THREE.Mesh(this.particleGeometry, material);
        mesh.scale.set(radius * 10, radius * 10, radius * 10);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        
        this.particleMeshes.set(particle, mesh);
        
        // Create arrow if global toggle is on
        if (this.globalArrowsVisible) {
            this.arrowVisibility.set(particle, true);
            this.createArrowForParticle(particle);
        }
    }

    /**
     * Remove a particle
     */
    removeParticle(particle) {
        const mesh = this.particleMeshes.get(particle);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.particleMeshes.delete(particle);
        }
        
        // Remove arrow if it exists
        this.removeArrowForParticle(particle);
        this.arrowVisibility.delete(particle);
        
        this.particleEngine.removeParticle(particle);
    }

    /**
     * Update waterfall
     */
    update(deltaTime) {
        // Spawn new particles
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnParticle();
        }

        // Update physics (applies forces, integrates motion, clears forces)
        const world = this.physicsEngine.getWorld();
        const particles = this.particleEngine.particles;
        
        // Calculate forces that will be applied (before physics step clears them)
        const forceSnapshot = new Map();
        for (const particle of particles) {
            if (!particle.isStatic) {
                // Gravity force: F = mg
                const gravityForce = world.gravity.clone().multiplyScalar(particle.mass);
                
                // Get current accumulated force (before clearing)
                const currentForce = particle.force;
                
                // Total force = gravity + any other accumulated forces
                forceSnapshot.set(particle, {
                    x: gravityForce.x + currentForce.x,
                    y: gravityForce.y + currentForce.y,
                    z: gravityForce.z + currentForce.z
                });
            }
        }
        
        // Now do physics step (which will clear forces)
        this.physicsEngine.step(deltaTime);
        
        // Update collision shape centers for ball-ball collision detection
        for (const particle of particles) {
            if (particle.collisionShape && particle.collisionShape.updateCenter) {
                particle.collisionShape.updateCenter(particle.position);
            }
        }
        
        // Simple ground plane collision - check each particle directly
        for (const particle of particles) {
            if (particle.isStatic) continue;
            
            const radius = particle.collisionShape?.radius || 0.1;
            const particleBottom = particle.position.y - radius;
            
            // Check if particle is below or intersecting ground plane
            if (particleBottom <= this.groundY) {
                // Move particle up to ground level
                particle.position.y = this.groundY + radius;
                
                // Bounce: reverse Y velocity and apply restitution
                if (particle.velocity.y < 0) { // Only bounce if moving down
                    const e = particle.restitution || 0.85;
                    particle.velocity.y = -particle.velocity.y * e;
                    
                    // Apply friction to horizontal velocity
                    const friction = this.groundFriction;
                    particle.velocity.x *= (1 - friction * 0.1);
                    particle.velocity.z *= (1 - friction * 0.1);
                }
            }
        }
        
        // Ball-ball collisions - efficient pairwise check
        // Only check pairs once (i < j) to avoid duplicate checks
        for (let i = 0; i < particles.length; i++) {
            const particleA = particles[i];
            if (particleA.isStatic) continue;
            
            const shapeA = particleA.collisionShape;
            if (!shapeA) continue;
            
            const radiusA = shapeA.radius;
            const posA = particleA.position;
            
            for (let j = i + 1; j < particles.length; j++) {
                const particleB = particles[j];
                if (particleB.isStatic) continue;
                
                const shapeB = particleB.collisionShape;
                if (!shapeB) continue;
                
                const radiusB = shapeB.radius;
                const posB = particleB.position;
                
                // Quick distance check (squared for efficiency)
                const dx = posB.x - posA.x;
                const dy = posB.y - posA.y;
                const dz = posB.z - posA.z;
                const distanceSq = dx * dx + dy * dy + dz * dz;
                const sumRadii = radiusA + radiusB;
                const sumRadiiSq = sumRadii * sumRadii;
                
                // Check collision
                if (distanceSq < sumRadiiSq && distanceSq > 0.0001) {
                    // Collision detected - resolve using impulse method
                    const distance = Math.sqrt(distanceSq);
                    const penetration = sumRadii - distance;
                    
                    // Normal from A to B
                    const normal = new Vector3(dx, dy, dz).normalize();
                    
                    // Relative velocity
                    const relativeVel = new Vector3().subVectors(particleB.velocity, particleA.velocity);
                    const velocityAlongNormal = relativeVel.dot(normal);
                    
                    // Don't resolve if separating
                    if (velocityAlongNormal > 0) continue;
                    
                    // Calculate restitution (use minimum of both)
                    const e = Math.min(particleA.restitution || 0.85, particleB.restitution || 0.85);
                    
                    // Calculate impulse scalar
                    // J = -(1 + e) * v_rel · n / (1/mA + 1/mB)
                    const invMassA = particleA.inverseMass;
                    const invMassB = particleB.inverseMass;
                    const invMassSum = invMassA + invMassB;
                    
                    if (invMassSum === 0) continue;
                    
                    const j = -(1 + e) * velocityAlongNormal / invMassSum;
                    
                    // Apply impulse
                    const impulse = normal.clone().multiplyScalar(j);
                    
                    // Update velocities
                    particleA.velocity.add(impulse.clone().multiplyScalar(invMassA));
                    particleB.velocity.sub(impulse.clone().multiplyScalar(invMassB));
                    
                    // Position correction to separate balls
                    const correctionPercent = 0.5;
                    const correction = penetration * correctionPercent / invMassSum;
                    const correctionVector = normal.clone().multiplyScalar(correction);
                    
                    particleA.position.sub(correctionVector.clone().multiplyScalar(invMassA));
                    particleB.position.add(correctionVector.clone().multiplyScalar(invMassB));
                    
                    // Update collision shape centers
                    shapeA.updateCenter(particleA.position);
                    shapeB.updateCenter(particleB.position);
                }
            }
        }

        // Update visual meshes and remove out-of-bounds particles
        const bounds = {
            x: 15,  // Horizontal bounds
            y: 10,  // Vertical bounds (above)
            z: 15   // Depth bounds
        };
        
        const particlesToRemove = [];
        
        for (const [particle, mesh] of this.particleMeshes) {
            mesh.position.set(
                particle.position.x,
                particle.position.y,
                particle.position.z
            );
            
            // Remove particles that go out of bounds (off screen)
            if (
                Math.abs(particle.position.x) > bounds.x ||
                particle.position.y > bounds.y ||
                particle.position.y < -10 ||
                Math.abs(particle.position.z) > bounds.z
            ) {
                particlesToRemove.push(particle);
            }
        }
        
        // Remove out-of-bounds particles
        for (const particle of particlesToRemove) {
            this.removeParticle(particle);
        }
        
        // Update force vector arrows (pass force snapshot)
        this.updateForceArrows(forceSnapshot);
    }
    
    /**
     * Update force vector arrows each frame
     */
    updateForceArrows(forceSnapshot = null) {
        for (const [particle, arrow] of this.forceArrows) {
            const isVisible = this.arrowVisibility.get(particle) || false;
            
            if (!isVisible) {
                arrow.visible = false;
                continue;
            }
            
            // Get force from snapshot if available, otherwise calculate from current state
            let forceX, forceY, forceZ;
            
            if (forceSnapshot && forceSnapshot.has(particle)) {
                const force = forceSnapshot.get(particle);
                forceX = force.x;
                forceY = force.y;
                forceZ = force.z;
            } else {
                // Fallback: calculate gravity force directly (F = mg)
                const world = this.physicsEngine.getWorld();
                const gravityForce = world.gravity.clone().multiplyScalar(particle.mass);
                forceX = gravityForce.x;
                forceY = gravityForce.y;
                forceZ = gravityForce.z;
            }
            
            const forceMagnitude = Math.sqrt(
                forceX * forceX + 
                forceY * forceY + 
                forceZ * forceZ
            );
            
            // Always show arrow if visibility is enabled (even for small forces)
            arrow.visible = true;
            
            // Calculate arrow direction (normalized force, or default downward if zero)
            let direction;
            if (forceMagnitude > 0.001) {
                direction = new THREE.Vector3(forceX, forceY, forceZ).normalize();
            } else {
                // Default to downward (gravity direction)
                direction = new THREE.Vector3(0, -1, 0);
            }
            
            // Calculate arrow length (scaled by magnitude, with minimum length)
            const arrowLength = Math.max(
                this.baseArrowLength,
                Math.min(
                    this.baseArrowLength + forceMagnitude * this.arrowScaleFactor,
                    this.maxArrowLength
                )
            );
            
            // Calculate color based on magnitude
            const color = this.getForceColor(forceMagnitude);
            
            // Update arrow position (at particle center)
            arrow.position.set(
                particle.position.x,
                particle.position.y,
                particle.position.z
            );
            
            // Update arrow direction and length
            arrow.setDirection(direction);
            arrow.setLength(arrowLength, 0.2, 0.1);
            
            // Update arrow color
            arrow.setColor(color);
        }
    }

    /**
     * Clean up
     */
    dispose() {
        // Remove controls
        if (this.controlsDiv && this.controlsDiv.parentNode) {
            this.controlsDiv.parentNode.removeChild(this.controlsDiv);
        }
        
        // Remove grid helper
        if (this.gridHelper) {
            this.scene.remove(this.gridHelper);
        }
        
        // Remove all arrows
        for (const [particle, arrow] of this.forceArrows) {
            this.scene.remove(arrow);
            // Dispose arrow geometry and material
            if (arrow.line) {
                arrow.line.geometry.dispose();
                arrow.line.material.dispose();
            }
            if (arrow.cone) {
                arrow.cone.geometry.dispose();
                arrow.cone.material.dispose();
            }
        }
        this.forceArrows.clear();
        this.arrowVisibility.clear();
        
        // Remove click event listener
        const canvas = document.querySelector('canvas');
        if (canvas) {
            // Note: We can't easily remove the listener without storing a reference
            // This is acceptable as the scene will be disposed when navigating away
        }
        
        for (const [particle, mesh] of this.particleMeshes) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.particleMeshes.clear();
        this.particleEngine.clear();
    }
}

