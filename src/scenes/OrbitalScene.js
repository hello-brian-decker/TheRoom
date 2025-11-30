/**
 * OrbitalScene - Orbital Mechanics Demonstration
 * 
 * Demonstrates gravitational orbits, Kepler's laws, escape velocity
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { orbitalDocumentation } from '../docs/orbital.js';

export class OrbitalScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.bodies = [];
        this.bodyMeshes = new Map();
        this.trajectoryLines = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.G = 6.674e-11 * 1e9; // Scaled gravitational constant
        this.documentation = null;
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011); // Dark space blue

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 20);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);

        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = 0; // No uniform gravity - use custom gravitational forces

        this.createControls();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(orbitalDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'orbital-controls';
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
        title.textContent = 'Orbital Mechanics';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Create planet-satellite button
        const planetBtn = document.createElement('button');
        planetBtn.textContent = 'Planet-Satellite';
        planetBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        planetBtn.addEventListener('click', () => this.createPlanetSatellite());
        controlsDiv.appendChild(planetBtn);

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear All';
        clearBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #cc0000; color: white; border: none; border-radius: 3px; cursor: pointer;';
        clearBtn.addEventListener('click', () => this.clearAll());
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

    createPlanetSatellite() {
        this.clearAll();

        // Central planet (large, stationary)
        const planetMass = 1000;
        const planetRadius = 1.0;
        const planet = this.createBody(
            new Vector3(0, 0, 0),
            new Vector3(0, 0, 0),
            planetRadius,
            planetMass,
            0xffaa00,
            true
        );

        // Satellite (small, orbiting)
        const satelliteMass = 1.0;
        const satelliteRadius = 0.2;
        const orbitRadius = 5.0;
        const orbitalVelocity = Math.sqrt(this.G * planetMass / orbitRadius); // v = sqrt(GM/r)
        
        const satellite = this.createBody(
            new Vector3(orbitRadius, 0, 0),
            new Vector3(0, orbitalVelocity, 0),
            satelliteRadius,
            satelliteMass,
            0x00aaff,
            false
        );

        // Create trajectory line
        this.createTrajectory(satellite);
    }

    createBody(position, velocity, radius, mass, color, isStatic) {
        const body = new Body();
        body.position.copy(position);
        body.velocity.copy(velocity);
        body.mass = mass;
        body.setMass(body.mass);
        if (isStatic) {
            body.setStatic();
        }
        
        const sphereShape = new Sphere(radius);
        body.collisionShape = sphereShape;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.bodies.push(body);

        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.bodyMeshes.set(body, mesh);

        return body;
    }

    createTrajectory(body) {
        const points = [];
        points.push(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.trajectoryLines.set(body, { line, points });
    }

    clearAll() {
        for (const [body, mesh] of this.bodyMeshes) {
            this.physicsEngine.getWorld().removeBody(body);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        for (const [body, trajectory] of this.trajectoryLines) {
            this.scene.remove(trajectory.line);
            trajectory.line.geometry.dispose();
            trajectory.line.material.dispose();
        }
        this.bodies = [];
        this.bodyMeshes.clear();
        this.trajectoryLines.clear();
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
        // Apply gravitational forces between all bodies
        for (let i = 0; i < this.bodies.length; i++) {
            const bodyA = this.bodies[i];
            if (bodyA.isStatic) continue;

            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyB = this.bodies[j];

                // Gravitational force: F = G(m1*m2)/r²
                const displacement = new Vector3().subVectors(bodyB.position, bodyA.position);
                const distanceSq = displacement.lengthSq();
                const distance = Math.sqrt(distanceSq);

                if (distance > 0.01) {
                    const forceMagnitude = this.G * bodyA.mass * bodyB.mass / distanceSq;
                    const force = displacement.normalize().multiplyScalar(forceMagnitude);

                    bodyA.applyForce(force);
                    bodyB.applyForce(force.clone().negate());
                }
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update collision shapes
        for (const body of this.bodies) {
            if (body.collisionShape && body.collisionShape.updateCenter) {
                body.collisionShape.updateCenter(body.position);
            }
        }

        // Update visuals
        for (const [body, mesh] of this.bodyMeshes) {
            mesh.position.set(body.position.x, body.position.y, body.position.z);
        }

        // Update trajectories
        for (const [body, trajectory] of this.trajectoryLines) {
            trajectory.points.push(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
            // Limit trajectory points for performance
            if (trajectory.points.length > 1000) {
                trajectory.points.shift();
            }
            trajectory.line.geometry.setFromPoints(trajectory.points);
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

        this.clearAll();
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

