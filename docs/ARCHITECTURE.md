# Architecture Documentation

## System Overview

The Room is a modular 3D physics simulation and educational platform built with JavaScript/ES6 modules, Three.js for rendering, and a custom physics engine. The architecture follows a component-based design with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  (App.js, Router.js, Scenes)                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Rendering Layer                          │
│  (Three.js Renderer, Camera, Scene Graph)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Physics Engine Layer                     │
│  (Engine, World, Body, Collision Detection)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Math & Utilities Layer                  │
│  (Vector3, Quaternion, Matrix, Integrators)                │
└─────────────────────────────────────────────────────────────┘
```

## Component Relationships

### Application Core

- **App.js**: Main application entry point, manages routing and scene lifecycle
- **Router.js**: Client-side hash-based routing system
- **Scenes**: Individual simulation scenes (HomeScene, WaterfallScene, etc.)

### Physics Engine

- **Engine**: Main physics coordinator, manages world and specialized engines
- **World**: Contains all physics bodies, handles simulation step
- **Body**: Represents a physical object with position, velocity, mass, etc.
- **CollisionDetector**: Coordinates broad phase and narrow phase collision detection
- **BroadPhase**: Quickly eliminates impossible collision pairs
- **NarrowPhase**: Precise collision detection on potential pairs

### Rendering

- **Three.js**: 3D graphics library for scene rendering
- **Renderer**: Sets up WebGL renderer, camera, and animation loop
- **Scenes**: Each scene manages its own Three.js scene graph

### Math & Utilities

- **Vector3**: 3D vector mathematics
- **Quaternion**: Rotation representation
- **Matrix3/Matrix4**: Matrix transformations
- **Integrators**: Numerical integration methods (Euler, RK4, Verlet)

## Data Flow

### Physics Simulation Loop

```
1. User Input / Time Step
   ↓
2. Apply Forces (gravity, user forces)
   ↓
3. Integrate Motion (update positions/velocities)
   ↓
4. Broad Phase Collision Detection
   ↓
5. Narrow Phase Collision Detection
   ↓
6. Collision Resolution (apply impulses)
   ↓
7. Update Rendering (sync physics bodies to meshes)
   ↓
8. Render Frame
   ↓
9. Repeat
```

### Scene Lifecycle

```
1. Route Change Detected
   ↓
2. Dispose Current Scene
   ↓
3. Create New Scene Instance
   ↓
4. Initialize Scene (async)
   ├─ Create Three.js scene
   ├─ Set up physics engine
   ├─ Create initial objects
   └─ Set up UI controls
   ↓
5. Start Animation Loop
   ↓
6. Update Loop (each frame)
   ├─ Update physics
   ├─ Update rendering
   └─ Handle user input
   ↓
7. On Route Change: Dispose and Cleanup
```

## Physics Engine Architecture

### Core Components

**Engine**
- Manages the physics world
- Coordinates specialized engines
- Handles main simulation loop

**World**
- Contains array of physics bodies
- Manages gravity and forces
- Handles collision detection coordination
- Performs collision resolution

**Body**
- Represents physical object
- Stores position, velocity, acceleration
- Contains mass, inertia, material properties
- Has collision shape reference

### Collision Detection Pipeline

```
All Bodies
   ↓
Broad Phase (Spatial Partitioning)
   ├─ Spatial Grid
   ├─ BVH
   └─ Octree
   ↓
Potential Pairs
   ↓
Narrow Phase (Precise Detection)
   ├─ Box-Box (SAT)
   ├─ Sphere-Sphere (Distance)
   ├─ Box-Sphere (Closest Point)
   └─ Mesh-Mesh (Triangle Intersection)
   ↓
Contact Information
   ├─ Normal
   ├─ Penetration Depth
   └─ Contact Point
   ↓
Collision Resolution
```

### Integration Methods

- **Euler**: Simple, fast, first-order accuracy
- **RK4**: High accuracy, fourth-order, more expensive
- **Verlet**: Stable, second-order, good for long simulations

## Rendering Architecture

### Three.js Scene Graph

Each scene maintains its own Three.js scene graph:

```
Scene
├─ Camera (PerspectiveCamera)
├─ Lights (Ambient, Directional, etc.)
├─ Physics Bodies (Group)
│  ├─ Body Mesh 1
│  ├─ Body Mesh 2
│  └─ ...
├─ UI Elements (Group)
│  ├─ Controls
│  └─ Documentation Browser
└─ Effects (Group)
   └─ Visual Effects
```

### Synchronization

Physics bodies are synchronized with Three.js meshes each frame:

```
Physics Body (position, rotation)
   ↓
Update Three.js Mesh
   ├─ mesh.position.copy(body.position)
   ├─ mesh.quaternion.copy(body.rotation)
   └─ mesh.scale.copy(body.scale)
```

## Module Dependencies

### Core Dependencies

- **Three.js**: 3D graphics rendering
- **ES6 Modules**: Module system

### Internal Dependencies

```
app.js
├─ router.js
└─ scenes/*.js
    ├─ physics/core/*
    ├─ physics/collision/*
    ├─ physics/integrators/*
    ├─ physics/math/*
    └─ components/*
```

## Performance Considerations

### Optimization Strategies

1. **Spatial Partitioning**: Reduces collision checks from O(n²) to O(n + k)
2. **Fixed Timestep**: Ensures deterministic physics
3. **Object Pooling**: Reuse objects to reduce garbage collection
4. **Level of Detail**: Reduce detail for distant objects
5. **Culling**: Don't render objects outside view frustum

### Bottlenecks

- Collision detection (especially with many bodies)
- Rendering (complex scenes with many objects)
- Memory allocation (frequent object creation)

## Extension Points

### Adding New Scenes

1. Create scene class in `src/scenes/`
2. Implement `init()`, `update()`, `dispose()` methods
3. Register route in `src/app.js`

### Adding Physics Features

1. Extend `Body` class or create new body type
2. Add collision shape if needed
3. Implement integration method if needed
4. Update collision detection if needed

### Adding Rendering Features

1. Extend scene class
2. Add Three.js objects to scene graph
3. Update in animation loop

## Security Considerations

### Electron Security

- Context isolation enabled
- Node integration disabled in renderer
- Preload script for secure IPC (if needed)

### Web Security

- No server-side code (pure client-side)
- Content Security Policy considerations
- Input validation for user controls

## Future Architecture Improvements

1. **Entity Component System**: More flexible object composition
2. **Event System**: Decoupled communication between components
3. **Plugin System**: Allow external physics engines
4. **Multi-threading**: Offload physics to Web Worker
5. **Asset Management**: Centralized resource loading

