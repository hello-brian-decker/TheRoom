/**
 * CollisionScene - Collision Demonstrations
 * 
 * Demonstrates elastic/inelastic collisions, momentum conservation
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { CollisionDetector } from '../physics/collision/CollisionDetector.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { collisionDocumentation } from '../docs/collision.js';

export class CollisionScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.collisionDetector = null;
        this.bodies = [];
        this.bodyMeshes = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.collisionType = 'elastic'; // 'elastic', 'inelastic', 'perfectly_inelastic'
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
        this.camera.position.set(0, 3, 8);
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
        world.gravity.y = 0; // No gravity for collision demo

        this.collisionDetector = new CollisionDetector('brute');
        this.collisionDetector.initialize(new Vector3(-20, -20, -20), new Vector3(20, 20, 20), 2.0);

        this.createGround();
        this.createControls();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(collisionDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createGround() {
        const groundY = -3;
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.7
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = groundY;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xcccccc);
        gridHelper.position.y = groundY + 0.01;
        this.scene.add(gridHelper);
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'collision-controls';
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
        title.textContent = 'Collision Demo';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Collision type selector
        const typeLabel = document.createElement('div');
        typeLabel.textContent = 'Collision Type:';
        typeLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(typeLabel);

        const typeSelect = document.createElement('select');
        typeSelect.style.cssText = 'width: 100%; padding: 5px; margin-bottom: 10px;';
        ['elastic', 'inelastic', 'perfectly_inelastic'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            typeSelect.appendChild(option);
        });
        typeSelect.addEventListener('change', (e) => {
            this.collisionType = e.target.value;
        });
        controlsDiv.appendChild(typeSelect);

        // Create two-body collision button
        const twoBodyBtn = document.createElement('button');
        twoBodyBtn.textContent = 'Two-Body Collision';
        twoBodyBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        twoBodyBtn.addEventListener('click', () => this.createTwoBodyCollision());
        controlsDiv.appendChild(twoBodyBtn);

        // Newton's cradle button
        const cradleBtn = document.createElement('button');
        cradleBtn.textContent = 'Newton\'s Cradle';
        cradleBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #00cc66; color: white; border: none; border-radius: 3px; cursor: pointer;';
        cradleBtn.addEventListener('click', () => this.createNewtonsCradle());
        controlsDiv.appendChild(cradleBtn);

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

    createTwoBodyCollision() {
        this.clearAll();

        // Body 1 - moving right
        const body1 = this.createSphere(new Vector3(-3, 0, 0), new Vector3(5, 0, 0), 0.3, 1.0, 0xff0000);
        
        // Body 2 - stationary or moving left
        const body2 = this.createSphere(new Vector3(2, 0, 0), new Vector3(0, 0, 0), 0.3, 1.0, 0x0000ff);

        // Set restitution based on collision type
        if (this.collisionType === 'elastic') {
            body1.restitution = 1.0;
            body2.restitution = 1.0;
        } else if (this.collisionType === 'inelastic') {
            body1.restitution = 0.3;
            body2.restitution = 0.3;
        } else { // perfectly_inelastic
            body1.restitution = 0.0;
            body2.restitution = 0.0;
        }
    }

    createNewtonsCradle() {
        this.clearAll();

        const count = 5;
        const spacing = 0.5;
        const startX = -spacing * (count - 1) / 2;
        const radius = 0.15;
        const stringLength = 2.0;

        for (let i = 0; i < count; i++) {
            const x = startX + i * spacing;
            const pivot = new Vector3(x, 2, 0);
            const ballPos = new Vector3(x, 2 - stringLength, 0);
            
            const body = this.createSphere(ballPos, new Vector3(0, 0, 0), radius, 0.5, 0xffff00);
            
            // Constrain to pivot (simplified - just set position constraint)
            // In a full implementation, this would use a constraint/joint system
        }

        // Pull first ball back and release
        if (this.bodies.length > 0) {
            const firstBall = this.bodies[0];
            firstBall.position.x -= 1.0;
            const mesh = this.bodyMeshes.get(firstBall);
            if (mesh) {
                mesh.position.set(firstBall.position.x, firstBall.position.y, firstBall.position.z);
            }
        }
    }

    createSphere(position, velocity, radius, mass, color) {
        const body = new Body();
        body.position.copy(position);
        body.velocity.copy(velocity);
        body.mass = mass;
        body.setMass(body.mass);
        body.restitution = 0.9;
        body.friction = 0.1;
        
        const sphereShape = new Sphere(radius);
        body.collisionShape = sphereShape;
        sphereShape.body = body;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.bodies.push(body);

        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.5
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.bodyMeshes.set(body, mesh);

        return body;
    }

    clearAll() {
        for (const [body, mesh] of this.bodyMeshes) {
            this.physicsEngine.getWorld().removeBody(body);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        this.bodies = [];
        this.bodyMeshes.clear();
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
        // Update collision shapes
        for (const body of this.bodies) {
            if (body.collisionShape && body.collisionShape.updateCenter) {
                body.collisionShape.updateCenter(body.position);
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Detect collisions
        const world = this.physicsEngine.getWorld();
        const contacts = this.collisionDetector.detectCollisions(world.bodies);

        // Resolve collisions with appropriate restitution
        for (const contact of contacts) {
            if (!contact.bodyA || !contact.bodyB) continue;
            
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;

            if (bodyA.isStatic && bodyB.isStatic) continue;

            const relativeVel = new Vector3().subVectors(bodyB.velocity, bodyA.velocity);
            const velocityAlongNormal = relativeVel.dot(contact.normal);

            if (velocityAlongNormal > 0) continue;

            let e;
            if (this.collisionType === 'perfectly_inelastic') {
                e = 0.0;
                // Merge velocities (they stick together)
                const totalMass = bodyA.mass + bodyB.mass;
                const combinedVel = new Vector3()
                    .add(bodyA.velocity.clone().multiplyScalar(bodyA.mass))
                    .add(bodyB.velocity.clone().multiplyScalar(bodyB.mass))
                    .multiplyScalar(1 / totalMass);
                bodyA.velocity.copy(combinedVel);
                bodyB.velocity.copy(combinedVel);
            } else {
                e = Math.min(bodyA.restitution || 0.5, bodyB.restitution || 0.5);
            }

            const invMassA = bodyA.inverseMass;
            const invMassB = bodyB.inverseMass;
            const invMassSum = invMassA + invMassB;

            if (invMassSum === 0) continue;

            const j = -(1 + e) * velocityAlongNormal / invMassSum;
            const impulse = contact.normal.clone().multiplyScalar(j);

            bodyA.velocity.add(impulse.clone().multiplyScalar(invMassA));
            bodyB.velocity.sub(impulse.clone().multiplyScalar(invMassB));

            // Position correction
            const correctionPercent = 0.8;
            const correction = contact.penetration * correctionPercent / invMassSum;
            const correctionVector = contact.normal.clone().multiplyScalar(correction);

            bodyA.position.sub(correctionVector.clone().multiplyScalar(invMassA));
            bodyB.position.add(correctionVector.clone().multiplyScalar(invMassB));
        }

        // Update visual meshes
        for (const [body, mesh] of this.bodyMeshes) {
            mesh.position.set(body.position.x, body.position.y, body.position.z);
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

