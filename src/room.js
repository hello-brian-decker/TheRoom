/**
 * Room - 3D Room Geometry Creation
 * 
 * Creates a cube-shaped room with walls, floor, and ceiling.
 * Uses Three.js planes with dark green materials and emissive glow.
 * 
 * @module room
 * @returns {THREE.Group} Group containing all room geometry
 */
import * as THREE from 'three';

/**
 * Creates a cube-shaped room with Matrix-style aesthetic
 * 
 * @returns {THREE.Group} Group containing room walls, floor, and ceiling
 */
export function createRoom() {
    const roomGroup = new THREE.Group();
    
    // Room dimensions (cube)
    const roomSize = 10;
    const wallThickness = 0.1;
    
    // Create room walls using planes
    const wallGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
    
    // Material with dark color and green emissive glow (brighter for visibility)
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x003300,
        emissive: 0x004400,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1.0
    });
    
    // Floor
    const floor = new THREE.Mesh(wallGeometry, wallMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomSize / 2;
    roomGroup.add(floor);
    
    // Ceiling
    const ceiling = new THREE.Mesh(wallGeometry, wallMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomSize / 2;
    roomGroup.add(ceiling);
    
    // Back wall
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -roomSize / 2;
    roomGroup.add(backWall);
    
    // Front wall (with opening for camera view)
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.z = roomSize / 2;
    roomGroup.add(frontWall);
    
    // Left wall
    const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -roomSize / 2;
    roomGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = roomSize / 2;
    roomGroup.add(rightWall);
    
    // Add grid pattern to floor
    const gridHelper = new THREE.GridHelper(roomSize, roomSize, 0x00ff00, 0x003300);
    gridHelper.position.y = -roomSize / 2 + 0.01;
    roomGroup.add(gridHelper);
    
    // Add subtle grid to walls
    const wallGridMaterial = new THREE.MeshStandardMaterial({
        color: 0x001100,
        emissive: 0x004400,
        emissiveIntensity: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    
    // Add wireframe grids to walls for matrix effect
    [backWall, leftWall, rightWall].forEach(wall => {
        const grid = new THREE.Mesh(wallGeometry, wallGridMaterial);
        grid.position.copy(wall.position);
        grid.rotation.copy(wall.rotation);
        roomGroup.add(grid);
    });
    
    return roomGroup;
}

