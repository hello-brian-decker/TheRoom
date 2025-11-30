/**
 * HomeScene - Physics Lab Welcome Page
 * 
 * Welcome page for the physics lab with navigation to different experiments.
 */

import * as THREE from 'three';

export class HomeScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
    }

    /**
     * Initialize the scene
     */
    async init() {
        // Scene setup - Physics lab style
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf5f5f5); // Light gray lab background

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting - Bright lab lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        this.scene.add(directionalLight);

        // Create lab floor
        this.createLabFloor();

        // Create welcome text/UI (using HTML overlay)
        this.createWelcomeUI();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Start animation (minimal, just for rendering)
        this.animate();
    }

    /**
     * Create lab floor
     */
    createLabFloor() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8,
            roughness: 0.7,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -0.5;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Grid helper
        const gridHelper = new THREE.GridHelper(20, 20, 0xcccccc, 0xcccccc);
        gridHelper.position.y = -0.49;
        this.scene.add(gridHelper);
    }

    /**
     * Create welcome UI overlay
     */
    createWelcomeUI() {
        // Create welcome panel
        const welcomePanel = document.createElement('div');
        welcomePanel.id = 'welcome-panel';
        welcomePanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            padding: 40px 60px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            text-align: center;
            font-family: 'Arial', sans-serif;
            max-width: 600px;
        `;

        const title = document.createElement('h1');
        title.textContent = 'Welcome to the Physics Lab';
        title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 32px; font-weight: bold;';
        welcomePanel.appendChild(title);

        const subtitle = document.createElement('p');
        subtitle.textContent = 'Explore interactive physics simulations and experiments';
        subtitle.style.cssText = 'margin: 0 0 30px 0; color: #666; font-size: 18px;';
        welcomePanel.appendChild(subtitle);

        // Experiment cards
        const experimentsDiv = document.createElement('div');
        experimentsDiv.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 30px; max-height: 70vh; overflow-y: auto;';

        // All experiment cards
        const experiments = [
            { title: 'Rubber Ball Physics', desc: 'Observe how rubber balls bounce based on fall speed', route: '/waterfall', color: '#0066cc' },
            { title: 'Rigid Body Dynamics', desc: 'Box and sphere collisions, stacking, domino effects', route: '/rigid-body', color: '#cc6600' },
            { title: 'Projectile Motion', desc: 'Parabolic trajectories, range optimization, air resistance', route: '/projectile', color: '#00cc66' },
            { title: 'Collision Demonstrations', desc: 'Elastic/inelastic collisions, momentum conservation', route: '/collision', color: '#cc0066' },
            { title: 'Pendulum Systems', desc: 'Simple, double, and coupled pendulums with chaotic motion', route: '/pendulum', color: '#6600cc' },
            { title: 'Spring-Mass Systems', desc: 'Hooke\'s law, damped oscillations, wave propagation', route: '/spring-mass', color: '#00cccc' },
            { title: 'Orbital Mechanics', desc: 'Gravitational orbits, Kepler\'s laws, escape velocity', route: '/orbital', color: '#ccaa00' },
            { title: 'Cloth Simulation', desc: 'Mass-spring cloth system with wind forces', route: '/cloth', color: '#cc00aa' },
            { title: 'Fluid Simulation', desc: 'SPH particle-based fluid dynamics', route: '/fluid', color: '#0066ff' }
        ];

        experiments.forEach(exp => {
            const card = this.createExperimentCard(exp.title, exp.desc, exp.route, exp.color);
            experimentsDiv.appendChild(card);
        });

        welcomePanel.appendChild(experimentsDiv);

        document.body.appendChild(welcomePanel);
        this.welcomePanel = welcomePanel;
    }

    /**
     * Create experiment card
     */
    createExperimentCard(title, description, route, color) {
        const card = document.createElement('div');
        card.style.cssText = `
            background: white;
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: left;
        `;

        card.onmouseover = () => {
            card.style.background = '#f0f0f0';
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        };
        card.onmouseout = () => {
            card.style.background = 'white';
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        };
        card.onclick = () => {
            window.location.hash = route;
        };

        const cardTitle = document.createElement('h3');
        cardTitle.textContent = title;
        cardTitle.style.cssText = `margin: 0 0 10px 0; color: ${color}; font-size: 20px;`;
        card.appendChild(cardTitle);

        const cardDesc = document.createElement('p');
        cardDesc.textContent = description;
        cardDesc.style.cssText = 'margin: 0; color: #666; font-size: 14px;';
        card.appendChild(cardDesc);

        return card;
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Update scene
     */
    update(deltaTime) {
        // No updates needed for static welcome page
    }

    /**
     * Cleanup and dispose
     */
    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // Remove resize listener
        window.removeEventListener('resize', this.handleResize);

        // Remove welcome panel
        if (this.welcomePanel && this.welcomePanel.parentNode) {
            this.welcomePanel.parentNode.removeChild(this.welcomePanel);
        }

        // Dispose Three.js objects
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

