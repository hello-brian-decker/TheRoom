/**
 * RigidBodyScene - Rigid Body Dynamics Demonstration
 * 
 * Demonstrates rigid body physics: collisions, stacking, momentum, torque
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { World } from '../physics/core/World.js';
import { Body } from '../physics/core/Body.js';
import { Box } from '../physics/collision/shapes/Box.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { CollisionDetector } from '../physics/collision/CollisionDetector.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { EulerIntegrator } from '../physics/integrators/EulerIntegrator.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { rigidBodyDocumentation } from '../docs/rigid-body.js';

export class RigidBodyScene {
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
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.documentation = null;
    }

    async init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Physics engine
        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = -9.81;
        
        // Collision detector
        this.collisionDetector = new CollisionDetector('brute');
        this.collisionDetector.initialize(new Vector3(-20, -20, -20), new Vector3(20, 20, 20), 2.0);

        // Create ground
        this.createGround();

        // Create UI controls
        this.createControls();

        // Setup mouse interaction
        this.setupMouseInteraction();

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(rigidBodyDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());

        // Start animation
        this.animate();
    }

    createGround() {
        const groundY = -5;
        const groundGeometry = new THREE.PlaneGeometry(30, 30);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.7,
            metalness: 0.1
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.position.y = groundY;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Physics ground body
        const groundBody = new Body();
        groundBody.setStatic();
        groundBody.position.set(0, groundY, 0);
        const groundBox = new Box(new Vector3(15, 0.1, 15));
        groundBody.collisionShape = groundBox;
        groundBox.updateBounds(groundBody.position, groundBody.rotation, groundBody.scale);
        this.physicsEngine.getWorld().addBody(groundBody);

        const gridHelper = new THREE.GridHelper(30, 30, 0xcccccc, 0xcccccc);
        gridHelper.position.y = groundY + 0.01;
        this.scene.add(gridHelper);
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'rigid-body-controls';
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
            max-height: 80vh;
            overflow-y: auto;
        `;

        const title = document.createElement('div');
        title.textContent = 'Rigid Body Controls';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Spawn box button
        const spawnBoxBtn = document.createElement('button');
        spawnBoxBtn.textContent = 'Spawn Box';
        spawnBoxBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        spawnBoxBtn.addEventListener('click', () => this.spawnBox());
        controlsDiv.appendChild(spawnBoxBtn);

        // Spawn sphere button
        const spawnSphereBtn = document.createElement('button');
        spawnSphereBtn.textContent = 'Spawn Sphere';
        spawnSphereBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        spawnSphereBtn.addEventListener('click', () => this.spawnSphere());
        controlsDiv.appendChild(spawnSphereBtn);

        // Stack boxes button
        const stackBtn = document.createElement('button');
        stackBtn.textContent = 'Create Stack';
        stackBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #00cc66; color: white; border: none; border-radius: 3px; cursor: pointer;';
        stackBtn.addEventListener('click', () => this.createStack());
        controlsDiv.appendChild(stackBtn);

        // Dominoes button
        const dominoBtn = document.createElement('button');
        dominoBtn.textContent = 'Create Dominoes';
        dominoBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #00cc66; color: white; border: none; border-radius: 3px; cursor: pointer;';
        dominoBtn.addEventListener('click', () => this.createDominoes());
        controlsDiv.appendChild(dominoBtn);

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

        // Gravity slider
        const gravityLabel = document.createElement('div');
        gravityLabel.textContent = 'Gravity:';
        gravityLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(gravityLabel);

        const gravitySlider = document.createElement('input');
        gravitySlider.type = 'range';
        gravitySlider.min = '0';
        gravitySlider.max = '20';
        gravitySlider.step = '0.1';
        gravitySlider.value = '9.81';
        gravitySlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        gravitySlider.addEventListener('input', (e) => {
            const world = this.physicsEngine.getWorld();
            world.gravity.y = -parseFloat(e.target.value);
        });
        controlsDiv.appendChild(gravitySlider);

        // Restitution slider
        const restitutionLabel = document.createElement('div');
        restitutionLabel.textContent = 'Bounciness:';
        restitutionLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(restitutionLabel);

        const restitutionSlider = document.createElement('input');
        restitutionSlider.type = 'range';
        restitutionSlider.min = '0';
        restitutionSlider.max = '1';
        restitutionSlider.step = '0.01';
        restitutionSlider.value = '0.5';
        restitutionSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        restitutionSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            for (const body of this.bodies) {
                if (!body.isStatic) {
                    body.restitution = value;
                }
            }
        });
        controlsDiv.appendChild(restitutionSlider);

        document.body.appendChild(controlsDiv);
        this.controlsDiv = controlsDiv;
    }

    setupMouseInteraction() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(Array.from(this.bodyMeshes.values()));
            
            if (intersects.length > 0) {
                // Click on object - apply impulse
                const mesh = intersects[0].object;
                for (const [body, bodyMesh] of this.bodyMeshes) {
                    if (bodyMesh === mesh) {
                        const impulse = new Vector3(
                            (Math.random() - 0.5) * 10,
                            5,
                            (Math.random() - 0.5) * 10
                        );
                        body.applyImpulse(impulse);
                        break;
                    }
                }
            } else {
                // Click on empty space - spawn object
                const worldPos = this.getWorldPositionFromMouse();
                this.spawnBoxAt(worldPos);
            }
        });
    }

    getWorldPositionFromMouse() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersectPoint);
        return new Vector3(intersectPoint.x, 5, intersectPoint.z);
    }

    spawnBox(position = null) {
        if (!position) {
            position = new Vector3(
                (Math.random() - 0.5) * 4,
                5 + Math.random() * 2,
                (Math.random() - 0.5) * 4
            );
        }
        this.spawnBoxAt(position);
    }

    spawnBoxAt(position) {
        const size = 0.3 + Math.random() * 0.4;
        const halfExtents = new Vector3(size, size, size);
        
        const body = new Body();
        body.position.copy(position);
        body.mass = size * size * size * 2; // Volume-based mass
        body.setMass(body.mass);
        body.restitution = 0.5;
        body.friction = 0.6;
        
        const boxShape = new Box(halfExtents);
        body.collisionShape = boxShape;
        boxShape.body = body;
        boxShape.updateBounds(body.position, body.rotation, body.scale);
        
        this.physicsEngine.getWorld().addBody(body);
        this.bodies.push(body);

        // Visual mesh
        const geometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
            roughness: 0.5,
            metalness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.bodyMeshes.set(body, mesh);
    }

    spawnSphere(position = null) {
        if (!position) {
            position = new Vector3(
                (Math.random() - 0.5) * 4,
                5 + Math.random() * 2,
                (Math.random() - 0.5) * 4
            );
        }
        
        const radius = 0.2 + Math.random() * 0.3;
        
        const body = new Body();
        body.position.copy(position);
        body.mass = (4/3) * Math.PI * radius * radius * radius * 2;
        body.setMass(body.mass);
        body.restitution = 0.6;
        body.friction = 0.5;
        
        const sphereShape = new Sphere(radius);
        body.collisionShape = sphereShape;
        sphereShape.body = body;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.bodies.push(body);

        // Visual mesh
        const geometry = new THREE.SphereGeometry(radius, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
            roughness: 0.3,
            metalness: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(position.x, position.y, position.z);
        this.scene.add(mesh);
        this.bodyMeshes.set(body, mesh);
    }

    createStack() {
        const baseX = 0;
        const baseY = -4.5;
        const baseZ = 0;
        const boxSize = 0.5;
        const stackHeight = 5;

        for (let i = 0; i < stackHeight; i++) {
            const position = new Vector3(
                baseX,
                baseY + boxSize + i * boxSize * 2,
                baseZ
            );
            this.spawnBoxAt(position);
        }
    }

    createDominoes() {
        const count = 10;
        const spacing = 1.0;
        const startX = -spacing * (count - 1) / 2;
        const baseY = -4.5;
        const baseZ = 0;

        for (let i = 0; i < count; i++) {
            const position = new Vector3(
                startX + i * spacing,
                baseY + 0.5,
                baseZ
            );
            const body = new Body();
            body.position.copy(position);
            body.mass = 1.0;
            body.setMass(body.mass);
            body.restitution = 0.1;
            body.friction = 0.8;
            
            const boxShape = new Box(new Vector3(0.1, 0.5, 0.2));
            body.collisionShape = boxShape;
            boxShape.body = body;
            boxShape.updateBounds(body.position, body.rotation, body.scale);
            
            this.physicsEngine.getWorld().addBody(body);
            this.bodies.push(body);

            const geometry = new THREE.BoxGeometry(0.2, 1.0, 0.4);
            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.7
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.position.set(position.x, position.y, position.z);
            this.scene.add(mesh);
            this.bodyMeshes.set(body, mesh);
        }
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
        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update collision shapes
        for (const body of this.bodies) {
            if (body.collisionShape) {
                if (body.collisionShape.updateBounds) {
                    body.collisionShape.updateBounds(body.position, body.rotation, body.scale);
                }
                if (body.collisionShape.updateCenter) {
                    body.collisionShape.updateCenter(body.position);
                }
            }
        }

        // Detect collisions
        const world = this.physicsEngine.getWorld();
        const contacts = this.collisionDetector.detectCollisions(world.bodies);

        // Resolve collisions
        for (const contact of contacts) {
            if (!contact.bodyA || !contact.bodyB) continue;
            
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;

            if (bodyA.isStatic && bodyB.isStatic) continue;

            // Relative velocity
            const relativeVel = new Vector3().subVectors(
                bodyB.velocity,
                bodyA.velocity
            );
            const velocityAlongNormal = relativeVel.dot(contact.normal);

            if (velocityAlongNormal > 0) continue; // Separating

            const e = Math.min(bodyA.restitution || 0.5, bodyB.restitution || 0.5);
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
            
            // Update rotation if body has angular velocity
            if (body.angularVelocity && (body.angularVelocity.lengthSq() > 0.0001)) {
                // Simple rotation update (simplified)
                const rotationQuat = body.rotation;
                // For now, just update position - full rotation would need quaternion integration
            }

            // Remove bodies that fall too far
            if (body.position.y < -20) {
                this.removeBody(body);
            }
        }
    }

    removeBody(body) {
        const mesh = this.bodyMeshes.get(body);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.bodyMeshes.delete(body);
        }
        this.physicsEngine.getWorld().removeBody(body);
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
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

