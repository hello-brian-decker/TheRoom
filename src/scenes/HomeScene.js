/**
 * HomeScene - Physics Lab Welcome Page
 * 
 * Welcome page for the physics lab with navigation to different experiments.
 */

import * as THREE from 'three';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { gravityDocumentation } from '../docs/gravity.js';
import { projectileDocumentation } from '../docs/projectile.js';
import { orbitalDocumentation } from '../docs/orbital.js';
import { collisionDocumentation } from '../docs/collision.js';
import { pendulumDocumentation } from '../docs/pendulum.js';
import { springMassDocumentation } from '../docs/spring-mass.js';
import { rigidBodyDocumentation } from '../docs/rigid-body.js';
import { clothDocumentation } from '../docs/cloth.js';
import { fluidDocumentation } from '../docs/fluid.js';
import { waterfallDocumentation } from '../docs/waterfall.js';
import { circuitsDocumentation } from '../docs/circuits.js';
import { arduinoDocumentation } from '../docs/arduino.js';

export class HomeScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        this.documentationBrowser = null;
        this.currentDoc = null;
        
        // Available documentation
        this.documentationList = [
            { title: 'Gravity', doc: gravityDocumentation, description: 'Comprehensive guide to gravitational physics, equations, and applications' },
            { title: 'Projectile Motion', doc: projectileDocumentation, description: 'Parabolic trajectories, air resistance, and range calculations' },
            { title: 'Orbital Mechanics', doc: orbitalDocumentation, description: 'Kepler\'s laws, orbital dynamics, and space mission planning' },
            { title: 'Collisions', doc: collisionDocumentation, description: 'Elastic and inelastic collisions, momentum conservation' },
            { title: 'Pendulums', doc: pendulumDocumentation, description: 'Simple and complex pendulum systems, chaotic motion' },
            { title: 'Spring-Mass Systems', doc: springMassDocumentation, description: 'Hooke\'s law, oscillations, and wave propagation' },
            { title: 'Rigid Body Dynamics', doc: rigidBodyDocumentation, description: 'Rotational motion, torque, and angular momentum' },
            { title: 'Cloth Simulation', doc: clothDocumentation, description: 'Mass-spring systems for fabric simulation' },
            { title: 'Fluid Dynamics', doc: fluidDocumentation, description: 'SPH particle-based fluid simulation' },
            { title: 'Waterfall Physics', doc: waterfallDocumentation, description: 'Bouncing ball physics and energy conservation' },
            { title: 'Circuit Theory', doc: circuitsDocumentation, description: 'Ohm\'s law, Kirchhoff\'s laws, circuit analysis, and electrical components' },
            { title: 'Arduino Programming', doc: arduinoDocumentation, description: 'Arduino hardware, programming functions, GPIO, and electronics projects' }
        ];
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

        // Create welcome text/UI (using HTML overlay)
        this.createWelcomeUI();

        // Create documentation browser
        this.createDocumentationBrowser();

        // Renderer setup. This is the one step that can fail on machines without
        // a usable WebGL context, so build the HTML overlay above it - otherwise
        // a failure here leaves the page completely blank.
        try {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                antialias: true
            });
        } catch (error) {
            console.error('WebGL unavailable, continuing without the 3D view:', error);
            this.canvas.style.display = 'none';
            return;
        }
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

        // Navigation buttons
        const navDiv = document.createElement('div');
        navDiv.style.cssText = 'display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;';
        
        const experimentsBtn = document.createElement('button');
        experimentsBtn.textContent = 'Experiments';
        experimentsBtn.id = 'nav-experiments';
        experimentsBtn.style.cssText = 'padding: 10px 30px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;';
        experimentsBtn.addEventListener('click', () => {
            this.showExperiments();
        });
        navDiv.appendChild(experimentsBtn);

        const docsBtn = document.createElement('button');
        docsBtn.textContent = '📚 Documentation';
        docsBtn.id = 'nav-docs';
        docsBtn.style.cssText = 'padding: 10px 30px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; font-weight: bold;';
        docsBtn.addEventListener('click', () => {
            this.showDocumentation();
        });
        navDiv.appendChild(docsBtn);

        welcomePanel.appendChild(navDiv);

        // Experiment cards container
        const experimentsContainer = document.createElement('div');
        experimentsContainer.id = 'experiments-container';
        experimentsContainer.style.cssText = 'display: block;';

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
            { title: 'Solar System', desc: 'Interactive solar system with clickable planets and physics information', route: '/solar-system', color: '#ff6600' },
            { title: 'Cloth Simulation', desc: 'Mass-spring cloth system with wind forces', route: '/cloth', color: '#cc00aa' },
            { title: 'Fluid Simulation', desc: 'SPH particle-based fluid dynamics', route: '/fluid', color: '#0066ff' },
            { title: 'Virtual Chip Designer', desc: 'Build and simulate circuits with analog and digital components', route: '/virtual-chip', color: '#9b59b6' },
            { title: 'Arduino Simulator', desc: 'Learn Arduino programming and simulate hardware interactions', route: '/arduino', color: '#3498db' },
            { title: 'Board Electrical Systems', desc: 'Explore how electricity flows through Raspberry Pi, Arduino, and ESP32 boards', route: '/board-electrical', color: '#e74c3c' }
        ];

        experiments.forEach(exp => {
            const card = this.createExperimentCard(exp.title, exp.desc, exp.route, exp.color);
            experimentsDiv.appendChild(card);
        });

        experimentsContainer.appendChild(experimentsDiv);
        welcomePanel.appendChild(experimentsContainer);

        // Documentation container (initially hidden)
        const docsContainer = document.createElement('div');
        docsContainer.id = 'docs-container';
        docsContainer.style.cssText = 'display: none; max-height: 70vh; overflow-y: auto;';
        welcomePanel.appendChild(docsContainer);

        document.body.appendChild(welcomePanel);
        this.welcomePanel = welcomePanel;
        this.experimentsContainer = experimentsContainer;
        this.docsContainer = docsContainer;
    }

    /**
     * Create documentation browser
     */
    createDocumentationBrowser() {
        const browser = document.createElement('div');
        browser.id = 'documentation-browser';
        browser.style.cssText = `
            position: fixed;
            right: ${this.documentationBrowser ? '0' : '-500px'};
            top: 60px;
            width: 500px;
            max-height: calc(100vh - 60px);
            background: rgba(255, 255, 255, 0.98);
            border-left: 2px solid #0066cc;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
            z-index: 2000;
            transition: right 0.3s ease;
            overflow-y: auto;
            font-family: 'Georgia', 'Times New Roman', serif;
            color: #333;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #0066cc;
            color: white;
            padding: 15px 20px;
            font-weight: bold;
            font-size: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 10;
        `;
        
        const title = document.createElement('div');
        title.textContent = '📚 Physics Documentation';
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: transparent;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            padding: 0;
            width: 35px;
            height: 35px;
            line-height: 35px;
        `;
        closeBtn.addEventListener('click', () => this.hideDocumentationBrowser());
        header.appendChild(closeBtn);

        browser.appendChild(header);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = 'padding: 20px;';
        contentDiv.id = 'doc-browser-content';
        browser.appendChild(contentDiv);

        document.body.appendChild(browser);
        this.documentationBrowser = browser;
        this.docBrowserContent = contentDiv;
    }

    /**
     * Show experiments view
     */
    showExperiments() {
        const experimentsBtn = document.getElementById('nav-experiments');
        const docsBtn = document.getElementById('nav-docs');
        if (experimentsBtn) experimentsBtn.style.background = '#0066cc';
        if (docsBtn) docsBtn.style.background = '#666';
        this.experimentsContainer.style.display = 'block';
        this.docsContainer.style.display = 'none';
    }

    /**
     * Show documentation view
     */
    showDocumentation() {
        document.getElementById('nav-experiments').style.background = '#666';
        document.getElementById('nav-docs').style.background = '#0066cc';
        this.experimentsContainer.style.display = 'none';
        this.docsContainer.style.display = 'block';

        // Populate documentation list if not already done
        if (this.docsContainer.children.length === 0) {
            this.populateDocumentationList();
        }
    }

    /**
     * Populate documentation list
     */
    populateDocumentationList() {
        this.documentationList.forEach((item, index) => {
            const docCard = document.createElement('div');
            docCard.style.cssText = `
                background: white;
                border: 2px solid #0066cc;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 15px;
                cursor: pointer;
                transition: all 0.3s;
            `;

            docCard.onmouseover = () => {
                docCard.style.background = '#f0f0f0';
                docCard.style.transform = 'translateY(-2px)';
                docCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            };
            docCard.onmouseout = () => {
                docCard.style.background = 'white';
                docCard.style.transform = 'translateY(0)';
                docCard.style.boxShadow = 'none';
            };
            docCard.onclick = () => {
                this.showDocumentationItem(item);
            };

            const cardTitle = document.createElement('h3');
            cardTitle.textContent = item.title;
            cardTitle.style.cssText = 'margin: 0 0 10px 0; color: #0066cc; font-size: 20px;';
            docCard.appendChild(cardTitle);

            const cardDesc = document.createElement('p');
            cardDesc.textContent = item.description;
            cardDesc.style.cssText = 'margin: 0; color: #666; font-size: 14px;';
            docCard.appendChild(cardDesc);

            this.docsContainer.appendChild(docCard);
        });
    }

    /**
     * Show a specific documentation item
     */
    showDocumentationItem(item) {
        if (this.currentDoc) {
            this.currentDoc.dispose();
        }

        this.currentDoc = new PhysicsDocumentation(item.doc);
        const docPanel = this.currentDoc.createPanel();
        
        // Remove the panel from body if it exists there
        if (docPanel.parentNode) {
            docPanel.parentNode.removeChild(docPanel);
        }
        
        // Style the panel for inline display in the docs container
        docPanel.style.cssText = `
            position: relative;
            right: auto;
            top: auto;
            width: 100%;
            max-height: none;
            border-left: none;
            box-shadow: none;
            z-index: auto;
        `;
        
        // Clear the docs container and show the documentation
        this.docsContainer.innerHTML = '';
        this.docsContainer.appendChild(docPanel);
        
        // Make sure the panel content is visible (not hidden off-screen)
        this.currentDoc.isVisible = true;
        if (this.currentDoc.panel) {
            this.currentDoc.panel.style.right = 'auto';
        }
    }

    /**
     * Hide documentation browser
     */
    hideDocumentationBrowser() {
        if (this.documentationBrowser) {
            this.documentationBrowser.style.right = '-500px';
        }
        if (this.currentDoc) {
            this.currentDoc.dispose();
            this.currentDoc = null;
        }
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

        // Remove documentation browser
        if (this.documentationBrowser && this.documentationBrowser.parentNode) {
            this.documentationBrowser.parentNode.removeChild(this.documentationBrowser);
        }

        // Dispose current documentation
        if (this.currentDoc) {
            this.currentDoc.dispose();
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

