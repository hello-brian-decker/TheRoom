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
        
        // Distance tracking
        this.distanceUnit = 'meters';
        this.projectileDistances = new Map(); // Map of body -> { launchPos, maxDistance }
        this.completedProjectiles = []; // Array of { finalDistance, unit } for completed projectiles
        this.distanceDisplay = null;
        
        // Ball weight/mass
        this.ballMass = 1.0; // kg
        
        // Wind effects
        this.windSpeed = 0; // m/s
        this.windDirection = 0; // degrees, 0 = headwind (opposes motion)
        this.windCoefficient = 0.05; // Wind force coefficient
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

        // Ball weight/mass
        const massLabel = document.createElement('div');
        massLabel.textContent = 'Ball Weight: 1.0 kg';
        massLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(massLabel);

        const massSlider = document.createElement('input');
        massSlider.type = 'range';
        massSlider.min = '0.1';
        massSlider.max = '10';
        massSlider.step = '0.1';
        massSlider.value = '1.0';
        massSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        massSlider.addEventListener('input', (e) => {
            const mass = parseFloat(e.target.value);
            massLabel.textContent = `Ball Weight: ${mass.toFixed(1)} kg`;
            this.ballMass = mass;
        });
        controlsDiv.appendChild(massSlider);

        // Wind speed
        const windSpeedLabel = document.createElement('div');
        windSpeedLabel.textContent = 'Wind Speed: 0.0 m/s';
        windSpeedLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(windSpeedLabel);

        const windSpeedSlider = document.createElement('input');
        windSpeedSlider.type = 'range';
        windSpeedSlider.min = '0';
        windSpeedSlider.max = '20';
        windSpeedSlider.step = '0.5';
        windSpeedSlider.value = '0';
        windSpeedSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        windSpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            windSpeedLabel.textContent = `Wind Speed: ${speed.toFixed(1)} m/s`;
            this.windSpeed = speed;
        });
        controlsDiv.appendChild(windSpeedSlider);

        // Wind direction
        const windDirLabel = document.createElement('div');
        windDirLabel.textContent = 'Wind Direction: 0° (Headwind)';
        windDirLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(windDirLabel);

        const windDirSlider = document.createElement('input');
        windDirSlider.type = 'range';
        windDirSlider.min = '0';
        windDirSlider.max = '360';
        windDirSlider.step = '1';
        windDirSlider.value = '0';
        windDirSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        windDirSlider.addEventListener('input', (e) => {
            const dir = parseFloat(e.target.value);
            let dirText = '';
            if (dir === 0 || dir === 360) dirText = 'Headwind';
            else if (dir === 90) dirText = 'Crosswind (Right)';
            else if (dir === 180) dirText = 'Tailwind';
            else if (dir === 270) dirText = 'Crosswind (Left)';
            else dirText = `${dir.toFixed(0)}°`;
            windDirLabel.textContent = `Wind Direction: ${dirText}`;
            this.windDirection = dir;
        });
        controlsDiv.appendChild(windDirSlider);

        // Distance unit selector
        const unitLabel = document.createElement('div');
        unitLabel.textContent = 'Distance Unit:';
        unitLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(unitLabel);

        const unitContainer = document.createElement('div');
        unitContainer.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px;';
        
        const metersRadio = document.createElement('input');
        metersRadio.type = 'radio';
        metersRadio.name = 'distanceUnit';
        metersRadio.value = 'meters';
        metersRadio.id = 'unit-meters';
        metersRadio.checked = true;
        metersRadio.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.distanceUnit = 'meters';
                this.updateDistanceDisplay();
            }
        });
        
        const metersLabel = document.createElement('label');
        metersLabel.htmlFor = 'unit-meters';
        metersLabel.textContent = 'Meters';
        metersLabel.style.cssText = 'font-size: 12px; cursor: pointer;';
        
        const feetRadio = document.createElement('input');
        feetRadio.type = 'radio';
        feetRadio.name = 'distanceUnit';
        feetRadio.value = 'feet';
        feetRadio.id = 'unit-feet';
        feetRadio.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.distanceUnit = 'feet';
                this.updateDistanceDisplay();
            }
        });
        
        const feetLabel = document.createElement('label');
        feetLabel.htmlFor = 'unit-feet';
        feetLabel.textContent = 'Feet';
        feetLabel.style.cssText = 'font-size: 12px; cursor: pointer;';
        
        unitContainer.appendChild(metersRadio);
        unitContainer.appendChild(metersLabel);
        unitContainer.appendChild(feetRadio);
        unitContainer.appendChild(feetLabel);
        controlsDiv.appendChild(unitContainer);

        // Distance display
        const distanceDisplayLabel = document.createElement('div');
        distanceDisplayLabel.textContent = 'Distance:';
        distanceDisplayLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px; font-weight: bold;';
        controlsDiv.appendChild(distanceDisplayLabel);

        this.distanceDisplay = document.createElement('div');
        this.distanceDisplay.id = 'projectile-distance-display';
        this.distanceDisplay.style.cssText = 'font-size: 11px; color: #666; margin-bottom: 10px; min-height: 20px; max-height: 100px; overflow-y: auto;';
        this.distanceDisplay.textContent = 'No projectiles launched';
        controlsDiv.appendChild(this.distanceDisplay);

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
        // Clear completed projectiles when launching a new one
        this.completedProjectiles = [];
        
        const startPos = new Vector3(-10, 0, 0);
        const vx = this.launchVelocity * Math.cos(this.launchAngle);
        const vy = this.launchVelocity * Math.sin(this.launchAngle);
        const velocity = new Vector3(vx, vy, 0);

        const body = new Body();
        body.position.copy(startPos);
        body.velocity.copy(velocity);
        body.mass = this.ballMass;
        body.setMass(body.mass);
        body.restitution = 0.3;
        
        // Initialize distance tracking
        this.projectileDistances.set(body, {
            launchPos: startPos.clone(),
            maxDistance: 0
        });
        
        const sphereShape = new Sphere(0.2);
        body.collisionShape = sphereShape;
        sphereShape.body = body;
        sphereShape.updateCenter(body.position);
        
        this.physicsEngine.getWorld().addBody(body);
        this.projectiles.push(body);

        // Visual mesh - make it more visible
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            roughness: 0.5,
            emissive: 0xff3300,
            emissiveIntensity: 0.3
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
        const material_line = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 3 });
        const line = new THREE.Line(geometry_line, material_line);
        this.scene.add(line);
        this.trajectoryLines.set(body, { line, points });
        
        console.log('Projectile launched:', { 
            position: { x: startPos.x, y: startPos.y, z: startPos.z },
            velocity: { x: vx, y: vy, z: 0 },
            angle: this.launchAngle * 180 / Math.PI,
            speed: this.launchVelocity
        });
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
        this.projectileDistances.clear();
        this.completedProjectiles = [];
        this.updateDistanceDisplay();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Convert distance from meters to selected unit
     */
    convertDistance(distanceMeters, unit) {
        if (unit === 'feet') {
            return distanceMeters * 3.28084;
        }
        return distanceMeters;
    }

    /**
     * Get unit label for display
     */
    getUnitLabel() {
        return this.distanceUnit === 'feet' ? 'ft' : 'm';
    }

    /**
     * Calculate horizontal distance from launch point
     */
    calculateDistance(body) {
        const distanceData = this.projectileDistances.get(body);
        if (!distanceData) return 0;
        
        const currentPos = body.position;
        const launchPos = distanceData.launchPos;
        
        // Calculate horizontal distance (ignoring Y component)
        const dx = currentPos.x - launchPos.x;
        const dz = currentPos.z - launchPos.z;
        const horizontalDistance = Math.sqrt(dx * dx + dz * dz);
        
        return horizontalDistance;
    }

    /**
     * Apply wind force to a projectile body
     */
    applyWindForce(body) {
        if (this.windSpeed <= 0) return;
        
        // Convert wind direction from degrees to radians
        // 0° = headwind (opposes motion, -X direction)
        // 180° = tailwind (aids motion, +X direction)
        const windAngleRad = (this.windDirection * Math.PI) / 180;
        
        // Calculate wind direction vector (horizontal plane only)
        const windDirX = Math.cos(windAngleRad);
        const windDirZ = Math.sin(windAngleRad);
        
        // Wind force magnitude: proportional to wind speed squared
        // F_wind = k * v_wind² * direction_vector
        const windForceMagnitude = this.windCoefficient * this.windSpeed * this.windSpeed;
        
        // Apply wind force (wind pushes the projectile)
        const windForce = new Vector3(
            windDirX * windForceMagnitude,
            0, // Wind is horizontal only
            windDirZ * windForceMagnitude
        );
        
        body.applyForce(windForce);
    }

    /**
     * Update distance display in UI
     */
    updateDistanceDisplay() {
        if (!this.distanceDisplay) return;
        
        const distances = [];
        
        // Show active projectiles
        let activeIndex = 1;
        for (const body of this.projectiles) {
            const distanceData = this.projectileDistances.get(body);
            if (distanceData) {
                const currentDistance = this.calculateDistance(body);
                const maxDistance = Math.max(currentDistance, distanceData.maxDistance);
                distanceData.maxDistance = maxDistance;
                
                const displayDistance = this.convertDistance(maxDistance, this.distanceUnit);
                const unit = this.getUnitLabel();
                distances.push(`Projectile ${activeIndex}: ${displayDistance.toFixed(2)} ${unit} (active)`);
            }
            activeIndex++;
        }
        
        // Show completed projectiles
        let completedIndex = 1;
        for (const completed of this.completedProjectiles) {
            distances.push(`Projectile ${completedIndex}: ${completed.finalDistance.toFixed(2)} ${completed.unit} (completed)`);
            completedIndex++;
        }
        
        if (distances.length === 0) {
            this.distanceDisplay.textContent = 'No projectiles launched';
        } else {
            this.distanceDisplay.textContent = distances.join('\n');
        }
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

        // Apply wind forces
        if (this.windSpeed > 0) {
            for (const body of this.projectiles) {
                this.applyWindForce(body);
            }
        }

        // Update physics
        this.physicsEngine.step(deltaTime);

        // Update visuals, trajectories, and distance tracking
        const toRemove = [];
        for (const body of this.projectiles) {
            const mesh = this.projectileMeshes.get(body);
            if (mesh) {
                // Update mesh position from body position
                mesh.position.set(body.position.x, body.position.y, body.position.z);
                
                // Update trajectory
                const trajectory = this.trajectoryLines.get(body);
                if (trajectory) {
                    trajectory.points.push(new THREE.Vector3(body.position.x, body.position.y, body.position.z));
                    // Limit trajectory points for performance
                    if (trajectory.points.length > 1000) {
                        trajectory.points.shift();
                    }
                    trajectory.line.geometry.setFromPoints(trajectory.points);
                }
                
                // Update distance tracking
                const distanceData = this.projectileDistances.get(body);
                if (distanceData) {
                    const currentDistance = this.calculateDistance(body);
                    distanceData.maxDistance = Math.max(distanceData.maxDistance, currentDistance);
                }
            } else {
                console.warn('Mesh not found for projectile body');
            }

            // Remove if hit ground or out of bounds
            if (body.position.y < -5 || Math.abs(body.position.x) > 50 || Math.abs(body.position.z) > 50) {
                toRemove.push(body);
            }
        }

        // Update distance display
        this.updateDistanceDisplay();

        // Remove projectiles
        for (const body of toRemove) {
            this.removeProjectile(body);
        }
    }

    removeProjectile(body) {
        // Store final distance before removing
        const distanceData = this.projectileDistances.get(body);
        if (distanceData) {
            const finalDistance = this.calculateDistance(body);
            const displayDistance = this.convertDistance(finalDistance, this.distanceUnit);
            const unit = this.getUnitLabel();
            
            // Store completed projectile distance (will persist until next launch)
            this.completedProjectiles.push({
                finalDistance: displayDistance,
                unit: unit
            });
            
            console.log(`Projectile removed. Final distance: ${displayDistance.toFixed(2)} ${unit}`);
        }
        
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
        
        // Clean up distance tracking for active projectile
        this.projectileDistances.delete(body);
        
        this.physicsEngine.getWorld().removeBody(body);
        const index = this.projectiles.indexOf(body);
        if (index > -1) {
            this.projectiles.splice(index, 1);
        }
        
        // Update distance display after removal (will show completed projectile)
        this.updateDistanceDisplay();
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

