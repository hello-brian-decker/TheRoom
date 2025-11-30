/**
 * SolarSystemScene - Interactive Solar System Simulation
 * 
 * A working model of our solar system with clickable planets displaying
 * detailed information about each planet and the physics affecting it.
 */

import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';
import { Body } from '../physics/core/Body.js';
import { Sphere } from '../physics/collision/shapes/Sphere.js';
import { Vector3 } from '../physics/math/Vector3.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { gravityDocumentation } from '../docs/gravity.js';

// Planet data (realistic values scaled for visualization)
const PLANET_DATA = {
    sun: {
        name: 'Sun',
        mass: 1.989e30, // kg
        radius: 696340, // km
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 1.0,
        type: 'star'
    },
    mercury: {
        name: 'Mercury',
        distance: 57.9e6, // km (semi-major axis)
        orbitalPeriod: 88, // Earth days
        mass: 3.301e23, // kg
        radius: 2439.7, // km
        surfaceGravity: 3.7, // m/s²
        escapeVelocity: 4.25, // km/s
        atmosphere: 'Thin (exosphere)',
        moons: 0,
        color: 0x8c7853,
        orbitalEccentricity: 0.206,
        axialTilt: 0.034
    },
    venus: {
        name: 'Venus',
        distance: 108.2e6,
        orbitalPeriod: 225,
        mass: 4.867e24,
        radius: 6051.8,
        surfaceGravity: 8.87,
        escapeVelocity: 10.36,
        atmosphere: 'Dense CO₂ (96.5%)',
        moons: 0,
        color: 0xffc649,
        orbitalEccentricity: 0.007,
        axialTilt: 177.4
    },
    earth: {
        name: 'Earth',
        distance: 149.6e6,
        orbitalPeriod: 365.25,
        mass: 5.972e24,
        radius: 6371,
        surfaceGravity: 9.81,
        escapeVelocity: 11.19,
        atmosphere: 'Nitrogen (78%), Oxygen (21%)',
        moons: 1,
        color: 0x6b93d6,
        orbitalEccentricity: 0.017,
        axialTilt: 23.44
    },
    mars: {
        name: 'Mars',
        distance: 227.9e6,
        orbitalPeriod: 687,
        mass: 6.417e23,
        radius: 3389.5,
        surfaceGravity: 3.71,
        escapeVelocity: 5.03,
        atmosphere: 'Thin CO₂ (95%)',
        moons: 2,
        color: 0xc1440e,
        orbitalEccentricity: 0.094,
        axialTilt: 25.19
    },
    jupiter: {
        name: 'Jupiter',
        distance: 778.5e6,
        orbitalPeriod: 4333,
        mass: 1.898e27,
        radius: 69911,
        surfaceGravity: 24.79,
        escapeVelocity: 59.5,
        atmosphere: 'Hydrogen (90%), Helium (10%)',
        moons: 95,
        color: 0xd8ca9d,
        orbitalEccentricity: 0.049,
        axialTilt: 3.13
    },
    saturn: {
        name: 'Saturn',
        distance: 1432e6,
        orbitalPeriod: 10759,
        mass: 5.683e26,
        radius: 58232,
        surfaceGravity: 10.44,
        escapeVelocity: 35.5,
        atmosphere: 'Hydrogen (96%), Helium (3%)',
        moons: 146,
        color: 0xfad5a5,
        orbitalEccentricity: 0.057,
        axialTilt: 26.73
    },
    uranus: {
        name: 'Uranus',
        distance: 2867e6,
        orbitalPeriod: 30687,
        mass: 8.681e25,
        radius: 25362,
        surfaceGravity: 8.69,
        escapeVelocity: 21.3,
        atmosphere: 'Hydrogen (83%), Helium (15%), Methane (2%)',
        moons: 27,
        color: 0x4fd0e7,
        orbitalEccentricity: 0.046,
        axialTilt: 97.77
    },
    neptune: {
        name: 'Neptune',
        distance: 4515e6,
        orbitalPeriod: 60190,
        mass: 1.024e26,
        radius: 24622,
        surfaceGravity: 11.15,
        escapeVelocity: 23.5,
        atmosphere: 'Hydrogen (80%), Helium (19%), Methane (1%)',
        moons: 16,
        color: 0x4b70dd,
        orbitalEccentricity: 0.009,
        axialTilt: 28.32
    }
};

export class SolarSystemScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.planets = new Map(); // Map of planet name -> { body, mesh, data }
        this.sunBody = null;
        this.sunMesh = null;
        this.animationId = null;
        this.lastTime = performance.now();
        this.startTime = performance.now(); // Track elapsed time for orbital calculations
        this.timeScale = 1.0; // Time multiplier for simulation speed
        this.selectedPlanet = null;
        this.infoPanel = null;
        this.documentation = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Scale factors for visualization
        this.distanceScale = 1e-8; // Scale down distances (km to units)
        this.sizeScale = 1e-4; // Scale down planet sizes (deprecated - using relative sizing)
        this.massScale = 1e-24; // Scale down masses (kg to units)
        
        // Planet size scaling - relative to each other (not the sun)
        // Mercury is the smallest planet, use it as base
        this.planetBaseRadius = PLANET_DATA.mercury.radius; // 2439.7 km
        this.planetBaseSize = 0.3; // Base size in units for Mercury (smallest planet)
        
        // Use direct orbital calculations instead of physics simulation
        // This provides stable, accurate orbits
        this.useDirectOrbitalCalculation = true;
        
        // Gravitational constant for physics calculations (for display/info only)
        this.G = 6.674e-11; // Real G value for calculations
    }

    async init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011); // Dark space

        // Create starfield background
        this.createStarfield();

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        // Position camera to see the solar system better
        this.camera.position.set(0, 30, 80);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        this.physicsEngine = new Engine();
        const world = this.physicsEngine.getWorld();
        world.gravity.y = 0; // No uniform gravity - use custom gravitational forces

        // Create solar system
        this.createSolarSystem();

        // Create documentation panel (before controls so button can reference it)
        this.documentation = new PhysicsDocumentation(gravityDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation;

        // Setup controls
        this.createControls();

        // Setup click interaction
        this.setupClickInteraction();

        // Create info panel
        this.createInfoPanel();

        window.addEventListener('resize', () => this.handleResize());
        this.animate();
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
        const starsVertices = [];

        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    createSolarSystem() {
        // Create Sun
        const sunData = PLANET_DATA.sun;
        // Use a smaller scale for the sun so planets are visible
        const sunSizeScale = this.sizeScale * 0.1; // Make sun 10x smaller relative to its real size
        const sunRadius = Math.max(sunData.radius * sunSizeScale, 2.0); // Minimum size of 2.0 for visibility
        
        const sunBody = new Body();
        sunBody.position.set(0, 0, 0);
        sunBody.setStatic(); // Sun doesn't move
        // Store both scaled and original mass for calculations
        sunBody.mass = sunData.mass * this.massScale; // Use scaled mass for physics
        sunBody.setMass(sunBody.mass);
        // Store original mass for display calculations
        sunBody.originalMass = sunData.mass;
        
        const sunShape = new Sphere(sunRadius);
        sunBody.collisionShape = sunShape;
        sunShape.updateCenter(sunBody.position);
        this.physicsEngine.getWorld().addBody(sunBody);
        
        const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: sunData.color,
            emissive: sunData.emissive,
            emissiveIntensity: sunData.emissiveIntensity
        });
        const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(sunMesh);
        
        // Add point light from sun
        const sunLight = new THREE.PointLight(0xffffff, 2, 500);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
        
        this.sunBody = sunBody;
        this.sunMesh = sunMesh;

        // Create planets
        const planetOrder = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        
        planetOrder.forEach((planetName, index) => {
            const planetData = PLANET_DATA[planetName];
            const distance = planetData.distance * this.distanceScale;
            // Size planets relative to each other (not the sun)
            // Scale based on Mercury as the smallest planet
            const radius = (planetData.radius / this.planetBaseRadius) * this.planetBaseSize;
            
            // Store orbital parameters for direct calculation
            // Scale orbital periods for visualization (make them much faster to see rotation)
            // Real periods are in Earth days, scale down for visualization
            // Earth's real period: 365.25 days = 31,536,000 seconds
            // Scaled to ~30 seconds for visualization (about 1 million times faster)
            const orbitalPeriodDays = planetData.orbitalPeriod;
            const visualizationPeriodScale = 1e-6; // Make orbits 1 million times faster
            const orbitalPeriodSeconds = (orbitalPeriodDays * 24 * 3600) * visualizationPeriodScale;
            
            // Ensure minimum period for very fast planets (Mercury)
            const minPeriod = 5; // Minimum 5 seconds for fastest orbit
            const finalPeriod = Math.max(orbitalPeriodSeconds, minPeriod);
            const semiMajorAxis = distance; // For circular orbits, distance = semi-major axis
            const eccentricity = planetData.orbitalEccentricity || 0;
            
            // Initial position at distance along X axis (start of orbit)
            const position = new Vector3(distance, 0, 0);
            
            // Create body (for collision detection and physics info, but won't move via forces)
            const body = new Body();
            body.position.copy(position);
            body.velocity.set(0, 0, 0); // Velocity calculated from orbital motion
            body.mass = planetData.mass * this.massScale;
            body.setMass(body.mass);
            body.originalMass = planetData.mass;
            
            // Store orbital parameters on body for calculations
            body.orbitalPeriod = finalPeriod;
            body.semiMajorAxis = semiMajorAxis;
            body.eccentricity = eccentricity;
            body.startAngle = 0; // Start at angle 0 (right side of orbit)
            
            const sphereShape = new Sphere(radius);
            body.collisionShape = sphereShape;
            sphereShape.updateCenter(body.position);
            this.physicsEngine.getWorld().addBody(body);
            
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: planetData.color,
                roughness: 0.8
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(position.x, position.y, position.z);
            mesh.userData.planetName = planetName;
            this.scene.add(mesh);
            
            // Create orbital path visualization (circle/ellipse)
            const orbitPoints = [];
            const orbitSegments = 64;
            for (let i = 0; i <= orbitSegments; i++) {
                const angle = (i / orbitSegments) * Math.PI * 2;
                if (eccentricity < 0.1) {
                    // Circular orbit
                    const orbitX = semiMajorAxis * Math.cos(angle);
                    const orbitY = semiMajorAxis * Math.sin(angle);
                    orbitPoints.push(new THREE.Vector3(orbitX, orbitY, 0));
                } else {
                    // Elliptical orbit
                    const trueAnomaly = angle;
                    const r = semiMajorAxis * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
                    const orbitX = r * Math.cos(trueAnomaly);
                    const orbitY = r * Math.sin(trueAnomaly);
                    orbitPoints.push(new THREE.Vector3(orbitX, orbitY, 0));
                }
            }
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ 
                color: planetData.color, 
                opacity: 0.3, 
                transparent: true,
                linewidth: 1
            });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitLine);
            
            // Store planet info
            this.planets.set(planetName, {
                body: body,
                mesh: mesh,
                data: planetData,
                orbitLine: orbitLine
            });
        });
    }

    createControls() {
        const controlsDiv = document.createElement('div');
        controlsDiv.id = 'solar-system-controls';
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
        title.textContent = 'Solar System';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        controlsDiv.appendChild(title);

        const instruction = document.createElement('div');
        instruction.textContent = 'Click on any planet to view information';
        instruction.style.cssText = 'font-size: 11px; color: #666; margin-bottom: 10px; font-style: italic;';
        controlsDiv.appendChild(instruction);

        // Time scale control
        const timeLabel = document.createElement('div');
        timeLabel.textContent = `Time Scale: ${this.timeScale.toFixed(1)}x`;
        timeLabel.style.cssText = 'margin-bottom: 5px; font-size: 12px; margin-top: 10px;';
        controlsDiv.appendChild(timeLabel);

        const timeSlider = document.createElement('input');
        timeSlider.type = 'range';
        timeSlider.min = '0';
        timeSlider.max = '10';
        timeSlider.step = '0.1';
        timeSlider.value = '1';
        timeSlider.style.cssText = 'width: 100%; margin-bottom: 5px;';
        timeSlider.addEventListener('input', (e) => {
            this.timeScale = parseFloat(e.target.value);
            timeLabel.textContent = `Time Scale: ${this.timeScale.toFixed(1)}x`;
        });
        controlsDiv.appendChild(timeSlider);

        // Documentation toggle button
        const docBtn = document.createElement('button');
        docBtn.textContent = '📚 Show Documentation';
        docBtn.style.cssText = 'width: 100%; padding: 8px; margin-top: 10px; margin-bottom: 10px; background: #0066cc; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;';
        docBtn.addEventListener('click', () => {
            if (this.documentation) {
                this.documentation.toggle();
                // Update button text
                docBtn.textContent = this.documentation.isVisible ? '📚 Hide Documentation' : '📚 Show Documentation';
                // Debug: log panel state
                console.log('Documentation panel visible:', this.documentation.isVisible, 'Panel:', this.documentation.panel);
            } else {
                console.error('Documentation not initialized');
            }
        });
        controlsDiv.appendChild(docBtn);

        document.body.appendChild(controlsDiv);
        this.controlsDiv = controlsDiv;
    }

    setupClickInteraction() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check for planet clicks
            const planetMeshes = Array.from(this.planets.values()).map(p => p.mesh);
            const sunMeshArray = [this.sunMesh];
            const allMeshes = [...planetMeshes, ...sunMeshArray];
            
            const intersects = this.raycaster.intersectObjects(allMeshes);
            
            if (intersects.length > 0) {
                const clickedMesh = intersects[0].object;
                
                if (clickedMesh === this.sunMesh) {
                    this.selectPlanet('sun');
                } else if (clickedMesh.userData.planetName) {
                    this.selectPlanet(clickedMesh.userData.planetName);
                }
            } else {
                // Click on empty space - deselect
                this.deselectPlanet();
            }
        });
    }

    selectPlanet(planetName) {
        this.selectedPlanet = planetName;
        
        // Highlight selected planet
        for (const [name, planet] of this.planets) {
            if (name === planetName) {
                planet.mesh.material.emissive = new THREE.Color(0xffffff);
                planet.mesh.material.emissiveIntensity = 0.3;
            } else {
                planet.mesh.material.emissive = new THREE.Color(0x000000);
                planet.mesh.material.emissiveIntensity = 0;
            }
        }
        
        // Show info panel
        this.showPlanetInfo(planetName);
    }

    deselectPlanet() {
        this.selectedPlanet = null;
        
        // Remove highlights
        for (const [name, planet] of this.planets) {
            planet.mesh.material.emissive = new THREE.Color(0x000000);
            planet.mesh.material.emissiveIntensity = 0;
        }
        
        // Hide info panel
        this.hidePlanetInfo();
    }

    createInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'planet-info-panel';
        panel.style.cssText = `
            position: fixed;
            right: ${-400}px;
            top: 60px;
            width: 400px;
            max-height: calc(100vh - 60px);
            background: rgba(255, 255, 255, 0.98);
            border-left: 2px solid #0066cc;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
            z-index: 999;
            transition: right 0.3s ease;
            overflow-y: auto;
            font-family: 'Arial', sans-serif;
            color: #333;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: #0066cc;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        `;
        
        const title = document.createElement('div');
        title.id = 'planet-info-title';
        title.textContent = 'Planet Information';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            line-height: 30px;
        `;
        closeBtn.addEventListener('click', () => this.deselectPlanet());
        header.appendChild(closeBtn);

        panel.appendChild(header);

        const content = document.createElement('div');
        content.id = 'planet-info-content';
        content.style.cssText = `
            padding: 20px;
            line-height: 1.6;
        `;
        panel.appendChild(content);

        document.body.appendChild(panel);
        this.infoPanel = panel;
    }

    showPlanetInfo(planetName) {
        if (!this.infoPanel) return;
        
        const planetData = planetName === 'sun' ? PLANET_DATA.sun : PLANET_DATA[planetName];
        if (!planetData) return;
        
        const title = document.getElementById('planet-info-title');
        const content = document.getElementById('planet-info-content');
        
        title.textContent = planetData.name;
        
        let html = '';
        
        if (planetName === 'sun') {
            html = this.formatSunInfo(planetData);
        } else {
            html = this.formatPlanetInfo(planetName, planetData);
        }
        
        content.innerHTML = html;
        
        // Show panel
        this.infoPanel.style.right = '0px';
    }

    formatSunInfo(data) {
        return `
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Physical Properties</h3>
                <p><strong>Type:</strong> Star</p>
                <p><strong>Mass:</strong> ${(data.mass / 1e30).toFixed(3)} × 10³⁰ kg</p>
                <p><strong>Radius:</strong> ${(data.radius / 1000).toFixed(0)} km</p>
                <p><strong>Composition:</strong> Hydrogen (73%), Helium (25%), Other (2%)</p>
            </section>
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Physics</h3>
                <p>The Sun's immense mass creates a gravitational field that holds all planets in orbit. The gravitational force between the Sun and each planet follows Newton's law of universal gravitation:</p>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0;">
                    F = G × (M₁ × M₂) / r²
                </p>
                <p>Where:</p>
                <ul>
                    <li>F = Gravitational force</li>
                    <li>G = Gravitational constant (6.674 × 10⁻¹¹ N⋅m²/kg²)</li>
                    <li>M₁, M₂ = Masses of the two bodies</li>
                    <li>r = Distance between centers</li>
                </ul>
            </section>
        `;
    }

    formatPlanetInfo(planetName, data) {
        const planet = this.planets.get(planetName);
        if (!planet) return '';
        
        const body = planet.body;
        const sunData = PLANET_DATA.sun;
        
        // Calculate current physics values
        const distance = body.position.length();
        const distanceKm = distance / this.distanceScale;
        const distanceAU = distanceKm / 149.6e6; // Astronomical units
        
        // Calculate physics values using real (unscaled) values for display
        const sunMass = sunData.mass; // Real mass in kg
        const planetMass = data.mass; // Real mass in kg
        const distanceMeters = distanceKm * 1000; // Convert to meters
        
        // Gravitational force: F = GMm/r² (using real values)
        const gravitationalForce = this.G * sunMass * planetMass / (distanceMeters * distanceMeters);
        
        // Orbital velocity: v = sqrt(GM/r) (using real values)
        const orbitalVelocity = Math.sqrt(this.G * sunMass / distanceMeters);
        const orbitalVelocityKmS = orbitalVelocity / 1000; // Convert to km/s
        
        // Centripetal force: F = mv²/r (using real values)
        const centripetalForce = planetMass * orbitalVelocity * orbitalVelocity / distanceMeters;
        
        // Orbital period: T = 2π√(r³/GM)
        const orbitalPeriod = 2 * Math.PI * Math.sqrt((distance * distance * distance) / (this.G * sunData.mass));
        const orbitalPeriodDays = orbitalPeriod / (24 * 3600);
        const orbitalPeriodYears = orbitalPeriodDays / 365.25;
        
        return `
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Physical Properties</h3>
                <p><strong>Mass:</strong> ${(data.mass / 1e24).toFixed(3)} × 10²⁴ kg</p>
                <p><strong>Radius:</strong> ${(data.radius / 1000).toFixed(2)} km</p>
                <p><strong>Surface Gravity:</strong> ${data.surfaceGravity} m/s²</p>
                <p><strong>Escape Velocity:</strong> ${data.escapeVelocity} km/s</p>
                <p><strong>Atmosphere:</strong> ${data.atmosphere}</p>
                <p><strong>Moons:</strong> ${data.moons}</p>
                <p><strong>Axial Tilt:</strong> ${data.axialTilt}°</p>
            </section>
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Orbital Properties</h3>
                <p><strong>Distance from Sun:</strong> ${distanceAU.toFixed(3)} AU (${(distanceKm / 1e6).toFixed(1)} × 10⁶ km)</p>
                <p><strong>Orbital Period:</strong> ${data.orbitalPeriod} Earth days (${(data.orbitalPeriod / 365.25).toFixed(2)} Earth years)</p>
                <p><strong>Orbital Eccentricity:</strong> ${data.orbitalEccentricity}</p>
            </section>
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Current Physics Values</h3>
                <p><strong>Current Distance:</strong> ${distanceAU.toFixed(4)} AU</p>
                <p><strong>Orbital Velocity:</strong> ${orbitalVelocityKmS.toFixed(2)} km/s</p>
                <p><strong>Gravitational Force:</strong> ${(gravitationalForce / 1e20).toFixed(3)} × 10²⁰ N</p>
                <p><strong>Centripetal Force:</strong> ${(centripetalForce / 1e20).toFixed(3)} × 10²⁰ N</p>
            </section>
            <section style="margin-bottom: 20px;">
                <h3 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 5px; margin-bottom: 15px;">Physics Explanation</h3>
                <p>The planet orbits the Sun due to the balance between gravitational force and centripetal force:</p>
                <p style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0;">
                    F_gravity = G × (M_sun × M_planet) / r²<br>
                    F_centripetal = M_planet × v² / r<br>
                    F_gravity = F_centripetal (for stable orbit)
                </p>
                <p><strong>Kepler's Laws:</strong></p>
                <ul>
                    <li><strong>1st Law:</strong> Planets orbit in ellipses with the Sun at one focus</li>
                    <li><strong>2nd Law:</strong> A line connecting planet and Sun sweeps equal areas in equal times</li>
                    <li><strong>3rd Law:</strong> T² ∝ r³ (orbital period squared is proportional to distance cubed)</li>
                </ul>
            </section>
        `;
    }

    hidePlanetInfo() {
        if (this.infoPanel) {
            this.infoPanel.style.right = '-400px';
        }
    }

    update(deltaTime) {
        // Calculate elapsed time since scene start (scaled by timeScale)
        const currentTime = performance.now();
        const elapsedTime = (currentTime - this.startTime) / 1000; // Convert to seconds
        const scaledElapsedTime = elapsedTime * this.timeScale;
        
        // Update planet positions using direct orbital calculations
        for (const [name, planet] of this.planets) {
            const body = planet.body;
            const mesh = planet.mesh;
            
            // Calculate orbital angle based on elapsed time
            // angle = (elapsedTime / orbitalPeriod) * 2π
            const orbitalAngle = (scaledElapsedTime / body.orbitalPeriod) * Math.PI * 2;
            
            // For circular orbits (eccentricity ≈ 0), use simple circular motion
            // For elliptical orbits, would need true anomaly calculation
            const a = body.semiMajorAxis; // Semi-major axis
            const e = body.eccentricity; // Eccentricity
            
            let x, y;
            if (e < 0.1) {
                // Circular orbit approximation
                x = a * Math.cos(orbitalAngle);
                y = a * Math.sin(orbitalAngle);
            } else {
                // Elliptical orbit (simplified - using mean anomaly)
                // For better accuracy, would calculate true anomaly from mean anomaly
                const meanAnomaly = orbitalAngle;
                // Approximate true anomaly (Kepler's equation would be more accurate)
                const trueAnomaly = meanAnomaly + 2 * e * Math.sin(meanAnomaly);
                const r = a * (1 - e * e) / (1 + e * Math.cos(trueAnomaly));
                x = r * Math.cos(trueAnomaly);
                y = r * Math.sin(trueAnomaly);
            }
            
            // Update position
            const position = new Vector3(x, y, 0);
            body.position.copy(position);
            mesh.position.set(x, y, 0);
            
            // Update collision shape position
            if (body.collisionShape && body.collisionShape.updateCenter) {
                body.collisionShape.updateCenter(position);
            }
            
            // Calculate velocity for display purposes
            // v = 2πa / T (for circular orbit)
            const orbitalVelocity = (2 * Math.PI * a) / body.orbitalPeriod;
            // Velocity direction is tangent to orbit (perpendicular to radius)
            const velocityX = -orbitalVelocity * Math.sin(orbitalAngle);
            const velocityY = orbitalVelocity * Math.cos(orbitalAngle);
            body.velocity.set(velocityX, velocityY, 0);
        }
        
        // Update info panel if planet is selected
        if (this.selectedPlanet) {
            this.showPlanetInfo(this.selectedPlanet);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
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
        if (this.infoPanel && this.infoPanel.parentNode) {
            this.infoPanel.parentNode.removeChild(this.infoPanel);
        }
        if (this.documentation) {
            this.documentation.dispose();
        }

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

