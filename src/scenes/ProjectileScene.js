/**
 * ProjectileScene - Projectile Motion Demonstration
 * 
 * Demonstrates projectile motion: trajectories, range optimization, air resistance
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { EulerIntegrator } from '../physics/integrators/EulerIntegrator.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { projectileDocumentation } from '../docs/projectile.js';

export class ProjectileScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.projectiles = [];
        this.projectileMeshes = new Map();
        this.trajectoryLines = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.airResistance = false;
        this.dragCoefficient = 0.1;
        this.documentation = null;
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = -9.81;

        this.createGround();
        this.createControls();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(projectileDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createGround() {
        const groundY = -5;
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x90EE90, // Light green
            roughness: 0.8
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = groundY;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x888888);
        gridHelper.position.y = groundY + 0.01;
        this.scene.add(gridHelper);
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'projectile-controls';
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
        title.textContent = 'Projectile Motion';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Launch angle
        const angleLabel = document.createElement('div');
        angleLabel.textContent = 'Launch Angle: 45°';
        angleLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(angleLabel);

        const angleSlider = document.createElement('input');
        angleSlider.type = 'range';
        angleSlider.min = '0';
        angleSlider.max = '90';
        angleSlider.step = '1';
        angleSlider.value = '45';
        angleSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        angleSlider.addEventListener('input', (e) => {
            const angle = parseFloat(e.target.value);
            angleLabel.textContent = `Launch Angle: ${angle.toFixed(0)}°`;
            this.launchAngle = angle * Math.PI / 180;
        });
        controlsDiv.appendChild(angleSlider);
        this.launchAngle = 45 * Math.PI / 180;

        // Launch velocity
        const velocityLabel = document.createElement('div');
        velocityLabel.textContent = 'Velocity: 15 m/s';
        velocityLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(velocityLabel);

        const velocitySlider = document.createElement('input');
        velocitySlider.type = 'range';
        velocitySlider.min = '5';
        velocitySlider.max = '30';
        velocitySlider.step = '0.5';
        velocitySlider.value = '15';
        velocitySlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        velocitySlider.addEventListener('input', (e) => {
            const vel = parseFloat(e.target.value);
            velocityLabel.textContent = `Velocity: ${vel.toFixed(1)} m/s`;
            this.launchVelocity = vel;
        });
        controlsDiv.appendChild(velocitySlider);
        this.launchVelocity = 15;

        // Air resistance toggle
        const airResistLabel = document.createElement('div');
        airResistLabel.textContent = 'Air Resistance: Off';
        airResistLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(airResistLabel);

        const airResistCheckbox = document.createElement('input');
        airResistCheckbox.type = 'checkbox';
        airResistCheckbox.style.cssText = 'margin-bottom: 10px;';
        airResistCheckbox.addEventListener('change', (e) => {
            this.airResistance = e.target.checked;
            airResistLabel.textContent = `Air Resistance: ${e.target.checked ? 'On' : 'Off'}`;
        });
        controlsDiv.appendChild(airResistCheckbox);

        // Launch button
        const launchBtn = document.createElement('button');
        launchBtn.textContent = 'Launch Projectile';
        launchBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        launchBtn.addEventListener('click', () => this.launchProjectile());
        controlsDiv.appendChild(launchBtn);

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

    launchProjectile() {
        const startPos = new Vector3(-10, 0, 0);
        const vx = this.launchVelocity * Math.cos(this.launchAngle);
        const vy = this.launchVelocity * Math.sin(this.launchAngle);
        const velocity = new Vector3(vx, vy, 0);

        const body = new Body();
        body.position.copy(startPos);
        body.velocity.copy(velocity);
        body.mass = 1.0;
        body.setMass(body.mass);
        body.restitution = 0.3;
        
        const sphereShape = new Sphere(0.2);
        body.collisionShape = sphereShape;
        sphereShape.body = body;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.projectiles.push(body);

        // Visual mesh
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            roughness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.set(startPos.x, startPos.y, startPos.z);
        this.scene.add(mesh);
        this.projectileMeshes.set(body, mesh);

        // Trajectory line
        const points = [];
        points.push(new THREE.Vector3(startPos.x, startPos.y, startPos.z));
        const geometry_line = new THREE.BufferGeometry().setFromPoints(points);
        const material_line = new THREE.LineBasicMaterial({ color: 0xffff00 });
        const line = new THREE.Line(geometry_line, material_line);
        this.scene.add(line);
        this.trajectoryLines.set(body, { line, points });
    }

    clearAll() {
        for (const [body, mesh] of this.projectileMeshes) {
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
        this.projectiles = [];
        this.projectileMeshes.clear();
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
        const world = this.physicsEngine.getWorld();
        
        // Apply air resistance if enabled
        if (this.airResistance) {
            for (const body of this.projectiles) {
                const speed = body.velocity.length();
                if (speed > 0.01) {
                    const dragForce = body.velocity.clone().normalize().multiplyScalar(-this.dragCoefficient * speed * speed);
                    body.applyForce(dragForce);
                }
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update visuals and trajectories
        const toRemove = [];
        for (const body of this.projectiles) {
            const mesh = this.projectileMeshes.get(body);
            if (mesh) {
                mesh.position.set(body.position.x, body.position.y, body.position.z);
                
                // Update trajectory
                const trajectory = this.trajectoryLines.get(body);
                if (trajectory) {
                    trajectory.points.push(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
                    trajectory.line.geometry.setFromPoints(trajectory.points);
                }
            }

            // Remove if hit ground or out of bounds
            if (body.position.y < -5 || Math.abs(body.position.x) > 50 || Math.abs(body.position.z) > 50) {
                toRemove.push(body);
            }
        }

        // Remove projectiles
        for (const body of toRemove) {
            this.removeProjectile(body);
        }
    }

    removeProjectile(body) {
        const mesh = this.projectileMeshes.get(body);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.projectileMeshes.delete(body);
        }
        const trajectory = this.trajectoryLines.get(body);
        if (trajectory) {
            this.scene.remove(trajectory.line);
            trajectory.line.geometry.dispose();
            trajectory.line.material.dispose();
            this.trajectoryLines.delete(body);
        }
        this.physicsEngine.getWorld().removeBody(body);
        const index = this.projectiles.indexOf(body);
        if (index > -1) {
            this.projectiles.splice(index, 1);
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

