# Project Structure

## Directory Organization

```
TheRoom/
├── LICENSE                 # MIT License
├── README.md              # Main project documentation
├── PORTFOLIO.md           # Portfolio showcase and technical achievements
├── CHANGELOG.md           # Version history
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite build configuration
├── index.html             # Main HTML entry point
├── .gitignore             # Git ignore rules
│
├── src/                   # Source code
│   ├── app.js            # Main application entry point
│   ├── router.js         # Client-side routing
│   ├── main.js           # Electron main process
│   ├── preload.js        # Electron preload script
│   ├── renderer.js       # Three.js renderer setup (legacy)
│   ├── room.js           # Room geometry creation
│   ├── matrixEffect.js   # Matrix visual effects
│   ├── waterfall.js     # Waterfall physics simulation
│   ├── styles.css        # Application styles
│   │
│   ├── components/       # Reusable UI components
│   │   └── PhysicsDocumentation.js
│   │
│   ├── scenes/          # Physics simulation scenes
│   │   ├── HomeScene.js
│   │   ├── WaterfallScene.js
│   │   ├── RigidBodyScene.js
│   │   ├── ProjectileScene.js
│   │   ├── CollisionScene.js
│   │   ├── PendulumScene.js
│   │   ├── SpringMassScene.js
│   │   ├── OrbitalScene.js
│   │   ├── ClothScene.js
│   │   ├── FluidScene.js
│   │   ├── SolarSystemScene.js
│   │   ├── VirtualChipScene.js
│   │   ├── ArduinoScene.js
│   │   ├── BoardElectricalScene.js
│   │   └── MatrixScene.js
│   │
│   ├── physics/          # Physics engine
│   │   ├── core/        # Core physics classes
│   │   │   ├── Engine.js
│   │   │   ├── World.js
│   │   │   └── Body.js
│   │   │
│   │   ├── collision/   # Collision detection
│   │   │   ├── BroadPhase.js
│   │   │   ├── NarrowPhase.js
│   │   │   ├── CollisionDetector.js
│   │   │   └── shapes/  # Collision shapes
│   │   │       ├── Box.js
│   │   │       ├── Sphere.js
│   │   │       └── Mesh.js
│   │   │
│   │   ├── integrators/ # Numerical integration
│   │   │   ├── EulerIntegrator.js
│   │   │   ├── RK4Integrator.js
│   │   │   └── VerletIntegrator.js
│   │   │
│   │   ├── math/        # Math utilities
│   │   │   ├── Vector3.js
│   │   │   ├── Quaternion.js
│   │   │   ├── Matrix3.js
│   │   │   ├── Matrix4.js
│   │   │   └── MathUtils.js
│   │   │
│   │   ├── spatial/     # Spatial partitioning
│   │   │   ├── SpatialGrid.js
│   │   │   ├── BVH.js
│   │   │   └── Octree.js
│   │   │
│   │   └── engines/     # Specialized engines
│   │       └── ParticleEngine.js
│   │
│   ├── docs/           # Educational documentation data
│   │   ├── gravity.js
│   │   ├── projectile.js
│   │   ├── orbital.js
│   │   ├── collision.js
│   │   ├── pendulum.js
│   │   ├── spring-mass.js
│   │   ├── rigid-body.js
│   │   ├── cloth.js
│   │   ├── fluid.js
│   │   ├── waterfall.js
│   │   ├── circuits.js
│   │   ├── arduino.js
│   │   └── boardElectrical.js
│   │
│   └── data/           # Data files
│       └── boards/     # Board definitions
│           ├── arduinoUno.js
│           ├── esp32.js
│           └── raspberryPi4.js
│
├── docs/               # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   └── STRUCTURE.md
│
└── dist/              # Build output (generated)
    ├── index.html
    └── assets/
```

## Module Dependencies

### Application Layer

```
app.js
├── router.js
└── scenes/*.js
    ├── physics/core/*
    ├── physics/collision/*
    ├── physics/integrators/*
    ├── physics/math/*
    ├── physics/spatial/*
    ├── components/*
    └── docs/*
```

### Physics Engine

```
Engine
├── World
│   ├── Body[]
│   │   ├── Vector3 (position, velocity, etc.)
│   │   ├── Quaternion (rotation)
│   │   └── CollisionShape (Box/Sphere/Mesh)
│   └── CollisionDetector
│       ├── BroadPhase
│       │   └── SpatialGrid/BVH/Octree
│       └── NarrowPhase
└── SpecializedEngines[]
```

### Rendering

```
Scene
├── THREE.Scene
│   ├── Camera
│   ├── Lights
│   ├── Physics Bodies (Group)
│   │   └── Mesh per Body
│   └── UI Elements
└── Renderer
```

## File Responsibilities

### Core Application

- **app.js**: Main entry point, route registration, scene lifecycle
- **router.js**: Hash-based routing, scene management
- **main.js**: Electron main process, window management
- **preload.js**: Electron security bridge

### Physics Engine

- **Engine.js**: Main physics coordinator
- **World.js**: Physics world, simulation step
- **Body.js**: Physics body representation
- **CollisionDetector.js**: Collision detection coordinator
- **BroadPhase.js**: Fast collision pair elimination
- **NarrowPhase.js**: Precise collision detection
- **Integrators**: Numerical integration methods
- **Math**: Vector, matrix, quaternion utilities

### Scenes

Each scene follows a standard pattern:

- **Constructor**: Initialize properties
- **init()**: Set up Three.js scene, physics, UI
- **update()**: Animation loop (physics + rendering)
- **dispose()**: Clean up resources

### Components

- **PhysicsDocumentation.js**: Documentation browser UI component

### Documentation Data

Each documentation file exports an object with:

- `title`: Documentation title
- `sections`: Array of section objects with `title` and `content`

## Import Patterns

### ES6 Modules

All files use ES6 module syntax:

```javascript
// Named imports
import { Engine } from './physics/core/Engine.js';
import { Vector3 } from './physics/math/Vector3.js';

// Default imports
import * as THREE from 'three';

// Default exports
export class MyClass { }
export function myFunction() { }
```

### Path Conventions

- Relative paths: `'./physics/core/Engine.js'`
- Always include `.js` extension
- Use relative paths for internal modules
- Use package names for external dependencies

## Naming Conventions

### Files

- Classes: `PascalCase.js` (e.g., `Engine.js`)
- Utilities: `camelCase.js` (e.g., `mathUtils.js`)
- Scenes: `*Scene.js` (e.g., `WaterfallScene.js`)

### Classes

- PascalCase: `class MyClass { }`

### Functions/Methods

- camelCase: `function myFunction() { }`

### Constants

- UPPER_SNAKE_CASE: `const MAX_VALUE = 100;`

### Variables

- camelCase: `const myVariable = value;`

## Code Organization Principles

### Separation of Concerns

- **Physics**: Pure physics logic, no rendering
- **Rendering**: Three.js scene management, no physics
- **Scenes**: Coordinate physics and rendering
- **Components**: Reusable UI elements

### Single Responsibility

Each class/file has one clear purpose:

- `Engine`: Physics coordination
- `World`: Body management and simulation
- `Body`: Physical object representation
- `CollisionDetector`: Collision detection

### Dependency Direction

```
Application → Rendering → Physics → Math
```

Higher-level modules depend on lower-level modules, not vice versa.

## Extension Points

### Adding New Scenes

1. Create scene file in `src/scenes/`
2. Register route in `src/app.js`
3. Follow scene interface pattern

### Adding Physics Features

1. Extend appropriate physics module
2. Add collision detection if needed
3. Update documentation

### Adding UI Components

1. Create component in `src/components/`
2. Import and use in scenes
3. Follow component pattern

## Build Output

The `dist/` directory contains:

- `index.html`: Main HTML file
- `assets/`: Bundled JavaScript and CSS
  - `index-*.js`: Main application bundle
  - `index-*.css`: Styles bundle

## Configuration Files

- **package.json**: Dependencies, scripts, metadata
- **vite.config.js**: Vite build configuration
- **.gitignore**: Git ignore patterns

## Documentation Files

- **README.md**: Project overview and quick start
- **PORTFOLIO.md**: Portfolio showcase and technical achievements
- **CHANGELOG.md**: Version history
- **docs/ARCHITECTURE.md**: System architecture
- **docs/API.md**: API reference
- **docs/DEVELOPMENT.md**: Development guide
- **docs/DEPLOYMENT.md**: Deployment guide
- **docs/STRUCTURE.md**: This file

