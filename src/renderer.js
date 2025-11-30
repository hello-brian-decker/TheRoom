import * as THREE from 'three';
import { createRoom } from './room.js';
import { createMatrixEffect } from './matrixEffect.js';
import { Waterfall } from './waterfall.js';

// Wait for DOM to be ready (handle both cases: already loaded or not yet loaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM is already ready
    init();
}

function init() {
    try {
        console.log('Initializing 3D scene...');
        startApp();
        console.log('3D scene initialized successfully');
    } catch (error) {
        console.error('Error initializing 3D scene:', error);
        console.error(error.stack);
    }
}

function startApp() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera setup - positioned inside the room, looking forward
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // Position camera slightly forward and up to see the room better
    camera.position.set(0, 1, 2);
    camera.lookAt(0, 0, -3); // Look toward the back wall

    // Renderer setup
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }

    console.log('Canvas found, creating WebGL renderer...');
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    
    if (!renderer) {
        throw new Error('Failed to create WebGL renderer');
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    
    console.log('Renderer created, size:', window.innerWidth, 'x', window.innerHeight);

    // Add ambient green lighting (brighter so we can see)
    const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
    scene.add(ambientLight);
    
    // Add directional light for better visibility
    const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Create room
    console.log('Creating room...');
    const room = createRoom();
    scene.add(room);
    console.log('Room created');

    // Create matrix effect
    let matrixEffect = null;
    console.log('Creating matrix effect...');
    try {
        matrixEffect = createMatrixEffect();
        scene.add(matrixEffect);
        console.log('Matrix effect created');
    } catch (error) {
        console.error('Error creating matrix effect:', error);
        // Continue without matrix effect if it fails
    }

    // Create waterfall
    let waterfall = null;
    console.log('Creating waterfall...');
    try {
        waterfall = new Waterfall(scene, camera);
        console.log('Waterfall created');
    } catch (error) {
        console.error('Error creating waterfall:', error);
        console.error(error.stack);
    }

    let lastTime = performance.now();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;
        
        // Update matrix effect
        try {
            if (matrixEffect && matrixEffect.update) {
                matrixEffect.update();
            }
        } catch (error) {
            console.error('Error updating matrix effect:', error);
        }
        
        // Update waterfall
        try {
            if (waterfall && waterfall.update) {
                waterfall.update(deltaTime);
            }
        } catch (error) {
            console.error('Error updating waterfall:', error);
        }
        
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Start animation
    animate();
}

