/**
 * PendulumScene - Pendulum Systems Demonstration
 * 
 * Demonstrates simple, double, and coupled pendulums
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { pendulumDocumentation } from '../docs/pendulum.js';

export class PendulumScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.pendulums = [];
        this.pendulumMeshes = new Map();
        this.stringLines = new Map();
        this.animationId = null;
        this.lastTime = performance.now();
        this.pendulumType = 'simple';
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
        this.camera.position.set(0, 2, 8);
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
        this.documentation = new PhysicsDocumentation(pendulumDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'pendulum-controls';
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
        title.textContent = 'Pendulum Systems';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Pendulum type selector
        const typeLabel = document.createElement('div');
        typeLabel.textContent = 'Pendulum Type:';
        typeLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px;';
        controlsDiv.appendChild(typeLabel);

        const typeSelect = document.createElement('select');
        typeSelect.style.cssText = 'width: 100%; padding: 5px; margin-bottom: 10px;';
        ['simple', 'double', 'coupled'].forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            typeSelect.appendChild(option);
        });
        typeSelect.addEventListener('change', (e) => {
            this.pendulumType = e.target.value;
            this.createPendulum();
        });
        controlsDiv.appendChild(typeSelect);

        // Create button
        const createBtn = document.createElement('button');
        createBtn.textContent = 'Create Pendulum';
        createBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        createBtn.addEventListener('click', () => this.createPendulum());
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

    createPendulum() {
        this.clearAll();

        if (this.pendulumType === 'simple') {
            this.createSimplePendulum();
        } else if (this.pendulumType === 'double') {
            this.createDoublePendulum();
        } else if (this.pendulumType === 'coupled') {
            this.createCoupledPendulums();
        }
    }

    createSimplePendulum() {
        const pivot = new Vector3(0, 3, 0);
        const length = 2.0;
        const mass = 1.0;
        const angle = Math.PI / 4; // 45 degrees

        const ballPos = new Vector3(
            pivot.x + length * Math.sin(angle),
            pivot.y - length * Math.cos(angle),
            pivot.z
        );

        const body = new Body();
        body.position.copy(ballPos);
        body.mass = mass;
        body.setMass(body.mass);
        body.pivot = pivot;
        body.length = length;
        body.angle = angle;
        body.angularVelocity = 0;

        const sphereShape = new Sphere(0.1);
        body.collisionShape = sphereShape;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.pendulums.push(body);

        // Visual
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.pendulumMeshes.set(body, mesh);

        // String
        this.createStringLine(pivot, ballPos, body);
    }

    createDoublePendulum() {
        const pivot = new Vector3(0, 3, 0);
        const length1 = 1.5;
        const length2 = 1.5;
        const mass1 = 1.0;
        const mass2 = 1.0;
        const angle1 = Math.PI / 3;
        const angle2 = Math.PI / 4;

        const pos1 = new Vector3(
            pivot.x + length1 * Math.sin(angle1),
            pivot.y - length1 * Math.cos(angle1),
            pivot.z
        );

        const pos2 = new Vector3(
            pos1.x + length2 * Math.sin(angle2),
            pos1.y - length2 * Math.cos(angle2),
            pos1.z
        );

        const body1 = new Body();
        body1.position.copy(pos1);
        body1.mass = mass1;
        body1.setMass(body1.mass);
        body1.pivot = pivot;
        body1.length = length1;
        body1.angle = angle1;
        body1.angularVelocity = 0;

        const body2 = new Body();
        body2.position.copy(pos2);
        body2.mass = mass2;
        body2.setMass(body2.mass);
        body2.pivot = pos1; // Pivot is first ball
        body2.length = length2;
        body2.angle = angle2;
        body2.angularVelocity = 0;
        body2.parentBody = body1;

        const sphereShape1 = new Sphere(0.1);
        body1.collisionShape = sphereShape1;
        sphereShape1.updateCenter(body1.position);
        
        const sphereShape2 = new Sphere(0.1);
        body2.collisionShape = sphereShape2;
        sphereShape2.updateCenter(body2.position);

        this.physicsEngine.getWorld().addBody(body1);
        this.physicsEngine.getWorld().addBody(body2);
        this.pendulums.push(body1, body2);

        // Visuals
        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material1 = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const material2 = new THREE.MeshStandardMaterial({ color: 0x0066ff });
        const mesh1 = new THREE.Mesh(geometry, material1);
        const mesh2 = new THREE.Mesh(geometry, material2);
        mesh1.castShadow = true;
        mesh2.castShadow = true;
        this.scene.add(mesh1);
        this.scene.add(mesh2);
        this.pendulumMeshes.set(body1, mesh1);
        this.pendulumMeshes.set(body2, mesh2);

        // Strings
        this.createStringLine(pivot, pos1, body1);
        this.createStringLine(pos1, pos2, body2);
    }

    createCoupledPendulums() {
        const pivot1 = new Vector3(-1, 3, 0);
        const pivot2 = new Vector3(1, 3, 0);
        const length = 2.0;
        const mass = 1.0;
        const angle1 = Math.PI / 6;
        const angle2 = -Math.PI / 6;

        const pos1 = new Vector3(
            pivot1.x + length * Math.sin(angle1),
            pivot1.y - length * Math.cos(angle1),
            pivot1.z
        );

        const pos2 = new Vector3(
            pivot2.x + length * Math.sin(angle2),
            pivot2.y - length * Math.cos(angle2),
            pivot2.z
        );

        const body1 = this.createPendulumBody(pos1, pivot1, length, mass, angle1, 0xff6600);
        const body2 = this.createPendulumBody(pos2, pivot2, length, mass, angle2, 0x0066ff);

        // Coupling spring (simplified - just visual connection)
        const springGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(pos1.x, pos1.y, pos1.z),
            new THREE.Vector3(pos2.x, pos2.y, pos2.z)
        ]);
        const springMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
        const springLine = new THREE.Line(springGeometry, springMaterial);
        this.scene.add(springLine);
        this.couplingLine = springLine;
    }

    createPendulumBody(position, pivot, length, mass, angle, color) {
        const body = new Body();
        body.position.copy(position);
        body.mass = mass;
        body.setMass(body.mass);
        body.pivot = pivot;
        body.length = length;
        body.angle = angle;
        body.angularVelocity = 0;

        const sphereShape = new Sphere(0.1);
        body.collisionShape = sphereShape;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.pendulums.push(body);

        const geometry = new THREE.SphereGeometry(0.1, 16, 16);
        const material = new THREE.MeshStandardMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.pendulumMeshes.set(body, mesh);

        this.createStringLine(pivot, position, body);
        return body;
    }

    createStringLine(start, end, body) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(start.x, start.y, start.z),
            new THREE.Vector3(end.x, end.y, end.z)
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0x888888 });
        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.stringLines.set(body, line);
    }

    clearAll() {
        for (const [body, mesh] of this.pendulumMeshes) {
            this.physicsEngine.getWorld().removeBody(body);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        for (const [body, line] of this.stringLines) {
            this.scene.remove(line);
            line.geometry.dispose();
            line.material.dispose();
        }
        if (this.couplingLine) {
            this.scene.remove(this.couplingLine);
            this.couplingLine.geometry.dispose();
            this.couplingLine.material.dispose();
            this.couplingLine = null;
        }
        this.pendulums = [];
        this.pendulumMeshes.clear();
        this.stringLines.clear();
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
        const g = Math.abs(world.gravity.y);

        for (const body of this.pendulums) {
            if (!body.pivot) continue;

            // Pendulum physics: θ'' = -(g/L)sin(θ)
            const L = body.length;
            const damping = 0.995; // Small damping
            
            // Update angle from angular velocity
            body.angle += body.angularVelocity * deltaTime;
            
            // Update angular acceleration
            const angularAccel = -(g / L) * Math.sin(body.angle);
            body.angularVelocity += angularAccel * deltaTime;
            body.angularVelocity *= damping;

            // Update position from angle
            const pivot = body.parentBody ? body.parentBody.position : body.pivot;
            body.position.set(
                pivot.x + L * Math.sin(body.angle),
                pivot.y - L * Math.cos(body.angle),
                pivot.z
            );

            // Update visual mesh
            const mesh = this.pendulumMeshes.get(body);
            if (mesh) {
                mesh.position.set(body.position.x, body.position.y, body.position.z);
            }

            // Update string line
            const line = this.stringLines.get(body);
            if (line) {
                const pivotPos = body.parentBody ? body.parentBody.position : body.pivot;
                line.geometry.setFromPoints([
                    new THREE.Vector3(pivotPos.x, pivotPos.y, pivotPos.z),
                    new THREE.Vector3(body.position.x, body.position.y, body.position.z)
                ]);
            }
        }

        // Update coupling line for coupled pendulums
        if (this.couplingLine && this.pendulums.length >= 2) {
            const pos1 = this.pendulums[0].position;
            const pos2 = this.pendulums[1].position;
            this.couplingLine.geometry.setFromPoints([
                new THREE.Vector3(pos1.x, pos1.y, pos1.z),
                new THREE.Vector3(pos2.x, pos2.y, pos2.z)
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

