/**
 * WaterfallScene - Waterfall Physics Scene Module
 * 
 * Self-contained module for the waterfall physics effect.
 */

import * as THREE from 'three';
import { Waterfall } from '../waterfall.js';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { waterfallDocumentation } from '../docs/waterfall.js';

export class WaterfallScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.waterfall = null;
        this.animationId = null;
        this.lastTime = performance.now();
        this.documentation = null;
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
        this.renderer.shadowMap.enabled = true; // Enable shadows for realism

        // Lighting - Bright lab lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        this.scene.add(directionalLight);
        
        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Create waterfall
        try {
            this.waterfall = new Waterfall(this.scene, this.camera);
            console.log('Waterfall created');
        } catch (error) {
            console.error('Error creating waterfall:', error);
            console.error(error.stack);
        }

        // Create documentation panel
        this.documentation = new PhysicsDocumentation(waterfallDocumentation);
        const docPanel = this.documentation.createPanel();
        document.body.appendChild(docPanel);
        window.currentDocumentation = this.documentation; // For button access

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Start animation
        this.animate();
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update waterfall
        if (this.waterfall && this.waterfall.update) {
            this.waterfall.update(deltaTime);
        }

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
        // Waterfall updates itself in animate loop
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

        // Dispose waterfall
        if (this.waterfall && this.waterfall.dispose) {
            this.waterfall.dispose();
        }

        // Dispose documentation
        if (this.documentation) {
            this.documentation.dispose();
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

