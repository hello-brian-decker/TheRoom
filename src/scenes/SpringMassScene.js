/**
 * SpringMassScene - Spring-Mass Systems Demonstration
 * 
 * Demonstrates Hooke's law, damped oscillations, wave propagation
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { springMassDocumentation } from '../docs/spring-mass.js';

export class SpringMassScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.masses = [];
        this.massMeshes = new Map();
        this.springLines = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.springConstant = 50.0;
        this.damping = 0.95;
        this.systemType = 'chain';
        this.documentation = null;
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 3, 10);
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

        this.createControls();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(springMassDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'spring-mass-controls';
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
        title.textContent = 'Spring-Mass Systems';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // System type selector
        const typeLabel = document.createElement('div');
        typeLabel.textContent = 'System Type:';
        typeLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(typeLabel);

        const typeSelect = document.createElement('select');
        typeSelect.style.cssText = 'width: 100%; padding: 5px; margin-bottom: 10px;';
        ['chain', 'bridge'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeSelect.appendChild(option);
        });
        typeSelect.addEventListener('change', (e) => {
            this.systemType = e.target.value;
            this.createSystem();
        });
        controlsDiv.appendChild(typeSelect);

        // Spring constant
        const kLabel = document.createElement('div');
        kLabel.textContent = `Spring Constant: ${this.springConstant}`;
        kLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(kLabel);

        const kSlider = document.createElement('input');
        kSlider.type = 'range';
        kSlider.min = '10';
        kSlider.max = '200';
        kSlider.step = '10';
        kSlider.value = this.springConstant.toString();
        kSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        kSlider.addEventListener('input', (e) => {
            this.springConstant = parseFloat(e.target.value);
            kLabel.textContent = `Spring Constant: ${this.springConstant}`;
        });
        controlsDiv.appendChild(kSlider);

        // Create button
        const createBtn = document.createElement('button');
        createBtn.textContent = 'Create System';
        createBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        createBtn.addEventListener('click', () => this.createSystem());
        controlsDiv.appendChild(createBtn);

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

    createSystem() {
        this.clearAll();

        if (this.systemType === 'chain') {
            this.createChain();
        } else if (this.systemType === 'bridge') {
            this.createBridge();
        }
    }

    createChain() {
        const count = 10;
        const restLength = 0.5;
        const startY = 2;
        const spacing = restLength;

        for (let i = 0; i < count; i++) {
            const y = startY - i * spacing;
            const body = this.createMass(new Vector3(0, y, 0), 0.1, 0xff6600);
            
            if (i === 0) {
                // First mass is fixed
                body.setStatic();
            } else {
                // Connect to previous mass
                const prevBody = this.masses[i - 1];
                this.createSpring(prevBody, body, restLength);
            }
        }
    }

    createBridge() {
        const count = 8;
        const restLength = 1.0;
        const startX = -(count - 1) * restLength / 2;
        const y = 1.5;

        // Create masses
        for (let i = 0; i < count; i++) {
            const x = startX + i * restLength;
            this.createMass(new Vector3(x, y, 0), 0.15, 0x0066ff);
        }

        // Connect masses horizontally
        for (let i = 0; i < this.masses.length - 1; i++) {
            this.createSpring(this.masses[i], this.masses[i + 1], restLength);
        }

        // Add supports (fixed masses at ends)
        if (this.masses.length > 0) {
            this.masses[0].setStatic();
            this.masses[this.masses.length - 1].setStatic();
        }
    }

    createMass(position, radius, color) {
        const body = new Body();
        body.position.copy(position);
        body.mass = 1.0;
        body.setMass(body.mass);
        body.restitution = 0.1;
        body.friction = 0.5;
        
        const sphereShape = new Sphere(radius);
        body.collisionShape = sphereShape;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.masses.push(body);

        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.massMeshes.set(body, mesh);

        return body;
    }

    createSpring(bodyA, bodyB, restLength) {
        const spring = {
            bodyA: bodyA,
            bodyB: bodyB,
            restLength: restLength,
            k: this.springConstant,
            damping: this.damping
        };

        if (!bodyA.springs) bodyA.springs = [];
        if (!bodyB.springs) bodyB.springs = [];
        bodyA.springs.push(spring);
        bodyB.springs.push(spring);

        // Visual spring line
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(bodyA.position.x, bodyA.position.y, bodyA.position.z),
            new THREE.Vector3(bodyB.position.x, bodyB.position.y, bodyB.position.z)
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.springLines.set(spring, line);
    }

    clearAll() {
        for (const [body, mesh] of this.massMeshes) {
            this.physicsEngine.getWorld().removeBody(body);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            if (body.springs) body.springs = [];
        }
        for (const [spring, line] of this.springLines) {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        }
        this.masses = [];
        this.massMeshes.clear();
        this.springLines.clear();
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
        // Apply spring forces
        for (const body of this.masses) {
            if (!body.springs || body.isStatic) continue;

            for (const spring of body.springs) {
                const otherBody = spring.bodyA === body ? spring.bodyB : spring.bodyA;
                if (!otherBody) continue;

                // Hooke's law: F = -kx
                const displacement = new Vector3().subVectors(otherBody.position, body.position);
                const currentLength = displacement.length();
                const extension = currentLength - spring.restLength;

                if (currentLength > 0.001) {
                    const forceMagnitude = spring.k * extension;
                    const force = displacement.normalize().multiplyScalar(forceMagnitude);

                    // Damping
                    const relativeVel = new Vector3().subVectors(otherBody.velocity, body.velocity);
                    const dampingForce = relativeVel.multiplyScalar(spring.damping * 0.1);
                    force.sub(dampingForce);

                    body.applyForce(force);
                }
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update collision shapes
        for (const body of this.masses) {
            if (body.collisionShape && body.collisionShape.updateCenter) {
                body.collisionShape.updateCenter(body.position);
            }
        }

        // Update visuals
        for (const [body, mesh] of this.massMeshes) {
            mesh.position.set(body.position.x, body.position.y, body.position.z);
        }

        // Update spring lines
        for (const [spring, line] of this.springLines) {
            line.geometry.setFromPoints([
                new THREE.Vector3(spring.bodyA.position.x, spring.bodyA.position.y, spring.bodyA.position.z),
                new THREE.Vector3(spring.bodyB.position.x, spring.bodyB.position.y, spring.bodyB.position.z)
            ]);
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

