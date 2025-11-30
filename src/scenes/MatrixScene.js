/**
 * MatrixScene - Matrix Code Rain Scene Module
 * 
 * Self-contained module for the Matrix effect scene.
 */

import * as THREE from 'three';
import { createRoom } from '../room.js';
import { createMatrixEffect } from '../matrixEffect.js';

export class MatrixScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.matrixEffect = null;
        this.animationId = null;
    }

    /**
     * Initialize the scene
     */
    async init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1, 2);
        this.camera.lookAt(0, 0, -3);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create room
        const room = createRoom();
        this.scene.add(room);

        // Create matrix effect
        try {
            this.matrixEffect = createMatrixEffect();
            this.scene.add(this.matrixEffect);
        } catch (error) {
            console.error('Error creating matrix effect:', error);
        }

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

        // Update matrix effect
        if (this.matrixEffect && this.matrixEffect.update) {
            this.matrixEffect.update();
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
     * Update scene (called each frame)
     */
    update(deltaTime) {
        // Matrix effect updates itself in animate loop
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

