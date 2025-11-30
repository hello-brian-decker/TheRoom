/**
 * ClothScene - Cloth Simulation Demonstration
 * 
 * Demonstrates mass-spring cloth system, wind forces, constraints
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { clothDocumentation } from '../docs/cloth.js';

export class ClothScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.clothParticles = [];
        this.particleMeshes = new Map();
        this.springs = [];
        this.clothMesh = null;
        this.animationId = null;
        this.lastTime = performance.now();
        this.springConstant = 100.0;
        this.damping = 0.95;
        this.windStrength = 0.0;
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
        this.documentation = new PhysicsDocumentation(clothDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'cloth-controls';
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
        title.textContent = 'Cloth Simulation';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        // Create cloth button
        const createBtn = document.createElement('button');
        createBtn.textContent = 'Create Cloth';
        createBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer;';
        createBtn.addEventListener('click', () => this.createCloth());
        controlsDiv.appendChild(createBtn);

        // Wind strength
        const windLabel = document.createElement('div');
        windLabel.textContent = `Wind: ${this.windStrength}`;
        windLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(windLabel);

        const windSlider = document.createElement('input');
        windSlider.type = 'range';
        windSlider.min = '0';
        windSlider.max = '10';
        windSlider.step = '0.1';
        windSlider.value = '0';
        windSlider.style.cssText = 'width: 100%; margin-bottom: 10px;';
        windSlider.addEventListener('input', (e) => {
            this.windStrength = parseFloat(e.target.value);
            windLabel.textContent = `Wind: ${this.windStrength.toFixed(1)}`;
        });
        controlsDiv.appendChild(windSlider);

        // Clear button
        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = 'width: 100%; padding: 8px; margin-bottom: 5px; background: #cc0000; color: white; border: none; border-radius: 3px; cursor: pointer;';
        clearBtn.addEventListener('click', () => this.clearCloth());
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

    createCloth() {
        this.clearCloth();

        const width = 10;
        const height = 10;
        const spacing = 0.5;
        const startX = -width * spacing / 2;
        const startY = 3;
        const startZ = 0;

        // Create particles in grid
        const grid = [];
        for (let j = 0; j < height; j++) {
            const row = [];
            for (let i = 0; i < width; i++) {
                const x = startX + i * spacing;
                const y = startY - j * spacing;
                const z = startZ;
                
                const body = new Body();
                body.position.set(x, y, z);
                body.mass = 0.1;
                body.setMass(body.mass);
                body.restitution = 0.1;
                
                // Pin top corners
                if (j === 0 && (i === 0 || i === width - 1)) {
                    body.setStatic();
                }
                
                const sphereShape = new Sphere(0.05);
                body.collisionShape = sphereShape;
                sphereShape.updateCenter(body.position);
                
                this.physicsEngine.getWorld().addBody(body);
                this.clothParticles.push(body);
                row.push(body);

                // Visual (small sphere)
                const geometry = new THREE.SphereGeometry(0.05, 8, 8);
                const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.position.set(x, y, z);
                this.scene.add(mesh);
                this.particleMeshes.set(body, mesh);
            }
            grid.push(row);
        }

        // Create springs between particles
        const restLength = spacing;
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                const particle = grid[j][i];
                
                // Horizontal springs
                if (i < width - 1) {
                    this.createSpring(particle, grid[j][i + 1], restLength);
                }
                
                // Vertical springs
                if (j < height - 1) {
                    this.createSpring(particle, grid[j + 1][i], restLength);
                }
                
                // Diagonal springs (for stability)
                if (i < width - 1 && j < height - 1) {
                    this.createSpring(particle, grid[j + 1][i + 1], restLength * Math.SQRT2);
                }
                if (i > 0 && j < height - 1) {
                    this.createSpring(particle, grid[j + 1][i - 1], restLength * Math.SQRT2);
                }
            }
        }

        // Create cloth mesh for rendering
        this.createClothMesh(grid, width, height);
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
        this.springs.push(spring);
    }

    createClothMesh(grid, width, height) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];

        // Create vertices from particle positions
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                const pos = grid[j][i].position;
                vertices.push(pos.x, pos.y, pos.z);
            }
        }

        // Create indices for triangles
        for (let j = 0; j < height - 1; j++) {
            for (let i = 0; i < width - 1; i++) {
                const a = j * width + i;
                const b = j * width + i + 1;
                const c = (j + 1) * width + i;
                const d = (j + 1) * width + i + 1;

                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: false
        });

        this.clothMesh = new THREE.Mesh(geometry, material);
        this.clothMesh.castShadow = true;
        this.clothMesh.receiveShadow = true;
        this.scene.add(this.clothMesh);
        this.clothGrid = grid;
        this.clothWidth = width;
        this.clothHeight = height;
    }

    clearCloth() {
        for (const [body, mesh] of this.particleMeshes) {
            this.physicsEngine.getWorld().removeBody(body);
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        }
        if (this.clothMesh) {
            this.scene.remove(this.clothMesh);
            this.clothMesh.geometry.dispose();
            this.clothMesh.material.dispose();
            this.clothMesh = null;
        }
        this.clothParticles = [];
        this.particleMeshes.clear();
        this.springs = [];
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
        for (const body of this.clothParticles) {
            if (!body.springs || body.isStatic) continue;

            for (const spring of body.springs) {
                const otherBody = spring.bodyA === body ? spring.bodyB : spring.bodyA;
                if (!otherBody) continue;

                const displacement = new Vector3().subVectors(otherBody.position, body.position);
                const currentLength = displacement.length();
                const extension = currentLength - spring.restLength;

                if (currentLength > 0.001) {
                    const forceMagnitude = spring.k * extension;
                    const force = displacement.normalize().multiplyScalar(forceMagnitude);

                    const relativeVel = new Vector3().subVectors(otherBody.velocity, body.velocity);
                    const dampingForce = relativeVel.multiplyScalar(spring.damping * 0.1);
                    force.sub(dampingForce);

                    body.applyForce(force);
                }
            }

            // Apply wind force
            if (this.windStrength > 0) {
                const windForce = new Vector3(
                    (Math.random() - 0.5) * this.windStrength,
                    0,
                    this.windStrength
                );
                body.applyForce(windForce);
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update collision shapes
        for (const body of this.clothParticles) {
            if (body.collisionShape && body.collisionShape.updateCenter) {
                body.collisionShape.updateCenter(body.position);
            }
        }

        // Update visual meshes
        for (const [body, mesh] of this.particleMeshes) {
            mesh.position.set(body.position.x, body.position.y, body.position.z);
        }

        // Update cloth mesh
        if (this.clothMesh && this.clothGrid) {
            const positions = this.clothMesh.geometry.attributes.position;
            let idx = 0;
            for (let j = 0; j < this.clothHeight; j++) {
                for (let i = 0; i < this.clothWidth; i++) {
                    const pos = this.clothGrid[j][i].position;
                    positions.setXYZ(idx++, pos.x, pos.y, pos.z);
                }
            }
            positions.needsUpdate = true;
            this.clothMesh.geometry.computeVertexNormals();
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

        this.clearCloth();
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

