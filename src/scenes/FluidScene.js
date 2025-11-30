/**
 * FluidScene - Fluid Simulation Demonstration
 * 
 * Demonstrates SPH (Smoothed Particle Hydrodynamics) fluid simulation
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { ParticleEngine } from '../physics/engines/ParticleEngine.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { fluidDocumentation } from '../docs/fluid.js';

export class FluidScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.particleEngine = null;
        this.particles = [];
        this.particleMeshes = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.smoothingRadius = 0.5;
        this.pressureConstant = 1000.0;
        this.viscosity = 0.1;
        this.documentation = null;
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = -9.81;

        this.particleEngine = new ParticleEngine(world);
        this.physicsEngine.registerEngine('particles', this.particleEngine);

        this.createContainer();
        this.createControls();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(fluidDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createContainer() {
        const containerSize = 4;
        const containerHeight = 3;
        const wallThickness = 0.2;

        // Bottom
        const bottomGeometry = new THREE.PlaneGeometry(containerSize, containerSize);
        const bottomMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
        const bottom = new THREE.Mesh(bottomGeometry, bottomMaterial);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.y = -containerHeight / 2;
        bottom.receiveShadow = true;
        this.scene.add(bottom);

        // Walls (simplified visual representation)
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            transparent: true,
            opacity: 0.5
        });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(containerSize, containerHeight),
            wallMaterial
        );
        backWall.position.z = -containerSize / 2;
        backWall.position.y = 0;
        this.scene.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(containerSize, containerHeight),
            wallMaterial
        );
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -containerSize / 2;
        leftWall.position.y = 0;
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(containerSize, containerHeight),
            wallMaterial
        );
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = containerSize / 2;
        rightWall.position.y = 0;
        this.scene.add(rightWall);

        this.containerBounds = {
            min: new Vector3(-containerSize / 2, -containerHeight / 2, -containerSize / 2),
            max: new Vector3(containerSize / 2, containerHeight / 2, containerSize / 2)
        };
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'fluid-controls';
        controlsDiv.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 20px;
            border-radius: 5px;
            border: 1px solid #ddd;
            font-family: 'Arial', sans-serif;
            color: #333;
            min-width: 250px;
        `;

        const title = document.createElement('div');
        title.textContent = 'Fluid Simulation';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Pour fluid button
        const pourBtn = document.createElement('button');
        pourBtn.textContent = 'Pour Fluid';
        pourBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        pourBtn.addEventListener('click', () => this.pourFluid());
        controlsDiv.appendChild(pourBtn);

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #cc0000; color: white; border: none; border-radius: 3px; cursor: pointer;';
        clearBtn.addEventListener('click', () => this.clearFluid());
        controlsDiv.appendChild(clearBtn);

        // Documentation toggle button
        const docBtn = document.createElement('button');
        docBtn.textContent = '📚 Show Documentation';
        docBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 10px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;';
        docBtn.addEventListener('click', () => {
            const doc = window.currentDocumentation;
            if (doc) doc.toggle();
        });
        controlsDiv.appendChild(docBtn);

        document.body.appendChild(controlsDiv);
        this.controlsDiv = controlsDiv;
    }

    pourFluid() {
        const count = 50;
        const startX = 0;
        const startY = 2;
        const startZ = 0;
        const spacing = 0.15;

        for (let i = 0; i < count; i++) {
            const x = startX + (Math.random() - 0.5) * spacing * Math.sqrt(count);
            const y = startY + Math.random() * 0.5;
            const z = startZ + (Math.random() - 0.5) * spacing * Math.sqrt(count);
            
            const position = new Vector3(x, y, z);
            const velocity = new Vector3(0, 0, 0);
            const radius = 0.08;
            const mass = 0.1;

            const particle = this.particleEngine.createParticle(position, velocity, radius, mass);
            particle.restitution = 0.1;
            particle.friction = 0.1;
            this.particles.push(particle);

            // Visual
            const geometry = new THREE.SphereGeometry(radius, 8, 8);
            const material = new THREE.MeshStandardMaterial({
                color: 0x0066ff,
                transparent: true,
                opacity: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
            this.particleMeshes.set(particle, mesh);
        }
    }

    clearFluid() {
        for (const [particle, mesh] of this.particleMeshes) {
            this.particleEngine.removeParticle(particle);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.particles = [];
        this.particleMeshes.clear();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    update(deltaTime) {
        // Apply SPH forces
        this.applySPHForces();

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Container collision
        for (const particle of this.particles) {
            const pos = particle.position;
            const radius = particle.collisionShape?.radius || 0.08;

            // Check bounds
            if (pos.x - radius < this.containerBounds.min.x) {
                particle.position.x = this.containerBounds.min.x + radius;
                particle.velocity.x *= -0.5;
            }
            if (pos.x + radius > this.containerBounds.max.x) {
                particle.position.x = this.containerBounds.max.x - radius;
                particle.velocity.x *= -0.5;
            }
            if (pos.y - radius < this.containerBounds.min.y) {
                particle.position.y = this.containerBounds.min.y + radius;
                particle.velocity.y *= -0.3;
            }
            if (pos.y + radius > this.containerBounds.max.y) {
                particle.position.y = this.containerBounds.max.y - radius;
                particle.velocity.y *= -0.5;
            }
            if (pos.z - radius < this.containerBounds.min.z) {
                particle.position.z = this.containerBounds.min.z + radius;
                particle.velocity.z *= -0.5;
            }
            if (pos.z + radius > this.containerBounds.max.z) {
                particle.position.z = this.containerBounds.max.z - radius;
                particle.velocity.z *= -0.5;
            }
        }

        // Update visuals
        for (const [particle, mesh] of this.particleMeshes) {
            mesh.position.set(particle.position.x, particle.position.y, particle.position.z);
        }
    }

    applySPHForces() {
        // Simplified SPH - calculate density and pressure for each particle
        for (const particle of this.particles) {
            let density = 0.0;
            const neighbors = [];

            // Find neighbors within smoothing radius
            for (const other of this.particles) {
                if (particle === other) continue;
                
                const distance = particle.position.distanceTo(other.position);
                if (distance < this.smoothingRadius) {
                    neighbors.push({ particle: other, distance: distance });
                    // Simplified density calculation
                    density += 1.0;
                }
            }

            // Pressure force (simplified)
            const pressure = this.pressureConstant * density;
            const pressureForce = new Vector3(0, 0, 0);

            for (const neighbor of neighbors) {
                const direction = new Vector3().subVectors(
                    particle.position,
                    neighbor.particle.position
                );
                if (direction.lengthSq() > 0.001) {
                    direction.normalize();
                    const pressureGradient = pressure * direction.length();
                    pressureForce.add(direction.multiplyScalar(pressureGradient));
                }
            }

            particle.applyForce(pressureForce);

            // Viscosity force (simplified)
            for (const neighbor of neighbors) {
                const relativeVel = new Vector3().subVectors(
                    neighbor.particle.velocity,
                    particle.velocity
                );
                const viscosityForce = relativeVel.multiplyScalar(this.viscosity);
                particle.applyForce(viscosityForce);
            }
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        window.removeEventListener('resize', this.handleResize);
        if (this.controlsDiv && this.controlsDiv.parentNode) {
            this.controlsDiv.parentNode.removeChild(this.controlsDiv);
        }

        // Dispose documentation
        if (this.documentation) {
            this.documentation.dispose();
        }

        this.clearFluid();
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

