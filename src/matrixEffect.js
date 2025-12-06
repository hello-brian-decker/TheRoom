/**
 * Matrix Effect - Green Code Rain Visual Effect
 * 
 * Creates animated falling characters (Matrix-style code rain) using
 * Three.js particle systems. Characters fall continuously with varying speeds.
 * 
 * @module matrixEffect
 * @returns {THREE.Points} Points object representing falling characters
 */
import * as THREE from 'three';

/**
 * Creates Matrix-style falling code rain effect
 * 
 * @returns {THREE.Points} Points object with animated falling characters
 */
export function createMatrixEffect() {
    const effectGroup = new THREE.Group();
    
    // Matrix characters (katakana, numbers, symbols)
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const charArray = chars.split('');
    
    // Create a large number of falling characters
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const startY = new Float32Array(particleCount);
    
    // Room bounds for positioning
    const roomSize = 10;
    const spread = roomSize * 1.5;
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random position in front/around the room
        positions[i3] = (Math.random() - 0.5) * spread * 2;
        positions[i3 + 1] = Math.random() * spread * 2 - spread / 2;
        positions[i3 + 2] = roomSize / 2 + Math.random() * 5;
        
        // Green color with variation
        const greenIntensity = 0.3 + Math.random() * 0.7;
        colors[i3] = 0; // R
        colors[i3 + 1] = greenIntensity; // G
        colors[i3 + 2] = 0; // B
        
        // Random size
        sizes[i] = 0.1 + Math.random() * 0.2;
        
        // Random fall speed
        speeds[i] = 0.01 + Math.random() * 0.03;
        
        // Starting Y position
        startY[i] = positions[i3 + 1];
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Create material with custom shader for text rendering
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            charTexture: { value: createCharTexture() }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            varying vec2 vUv;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
                vUv = vec2(0.5, 0.5);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec3 vColor;
            varying vec2 vUv;
            
            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                
                if (dist > 0.5) {
                    discard;
                }
                
                // Create character-like appearance
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                alpha *= vColor.g;
                
                // Fade effect
                float fade = sin(time * 2.0 + gl_FragCoord.x * 0.1) * 0.5 + 0.5;
                alpha *= fade;
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create particles
    const particles = new THREE.Points(geometry, material);
    effectGroup.add(particles);
    
    // Store update function with access to speeds array
    let time = 0;
    effectGroup.update = function() {
        time += 0.016; // ~60fps
        material.uniforms.time.value = time;
        
        const positions = geometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Move particles down using stored speed
            positions[i3 + 1] -= speeds[i] * 50;
            
            // Reset position when it falls below room
            if (positions[i3 + 1] < -roomSize / 2 - 5) {
                positions[i3 + 1] = roomSize / 2 + Math.random() * 5;
                positions[i3] = (Math.random() - 0.5) * spread * 2;
                positions[i3 + 2] = roomSize / 2 + Math.random() * 5;
            }
        }
        
        geometry.attributes.position.needsUpdate = true;
    };
    
    return effectGroup;
}

function createCharTexture() {
    // Create a simple texture for characters
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#00ff00';
    context.font = '48px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('0', 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

