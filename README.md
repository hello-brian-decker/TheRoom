# The Room - Interactive Physics Lab & Educational Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-0.160+-green.svg)](https://threejs.org/)

A comprehensive portfolio project demonstrating advanced software engineering skills through a custom-built 3D physics simulation engine and interactive educational platform. Features include real-time physics simulations, custom collision detection algorithms, multiple numerical integration methods, and educational tools for learning physics, electronics, and programming concepts.

## Overview

The Room is a showcase project featuring a **custom-built physics engine** implemented from scratch, demonstrating deep understanding of physics simulation, advanced algorithms, and software architecture. This portfolio piece combines real-time 3D simulations with educational content, highlighting technical achievements in:

- **Custom Physics Engine**: Built from scratch with mathematical foundations
- **Advanced Algorithms**: Collision detection, spatial partitioning, numerical integration
- **3D Graphics**: Three.js integration and optimization
- **Full-Stack Architecture**: Modular, scalable system design

## Features

### Physics Simulations

- **Waterfall Physics**: Rubber ball bouncing with energy conservation
- **Rigid Body Dynamics**: Rotational motion, torque, and angular momentum
- **Projectile Motion**: Parabolic trajectories with customizable parameters
- **Collision Demonstrations**: Elastic and inelastic collisions
- **Pendulum Systems**: Simple and complex pendulum simulations
- **Spring-Mass Systems**: Oscillating systems demonstrating Hooke's law
- **Orbital Mechanics**: Planetary motion following Kepler's laws
- **Cloth Simulation**: Mass-spring system for fabric simulation
- **Fluid Dynamics**: SPH (Smoothed Particle Hydrodynamics) particle-based fluid simulation
- **Solar System**: Multi-body gravitational simulation

### Educational Tools

- **Arduino Simulator**: Interactive Arduino programming and hardware simulation
- **Board Electrical Systems**: Circuit design and electrical system visualization
- **Virtual Chip Designer**: Integrated circuit design tool
- **Physics Documentation Browser**: Comprehensive educational content with search functionality

### Custom Physics Engine (Built from Scratch)

This project demonstrates the ability to build complex systems from the ground up:

- **Custom 3D Physics Engine**: Fully implemented from scratch with mathematical foundations
- **Multiple Integration Methods**: Euler, RK4 (Runge-Kutta 4th order), and Verlet integration - each implemented with proper mathematical understanding
- **Advanced Collision Detection**: Two-phase system (broad phase and narrow phase) with multiple algorithms
  - Broad phase: Spatial Grid, BVH (Bounding Volume Hierarchy), and Octree implementations
  - Narrow phase: SAT (Separating Axis Theorem) for precise collision detection
- **Spatial Partitioning**: Efficient algorithms reducing complexity from O(n²) to O(n + k)
- **Collision Shapes**: Multiple shape types (Box, Sphere, Mesh) with proper intersection tests
- **Impulse-Based Resolution**: Realistic collision response with friction and restitution modeling
- **Performance Optimization**: Handles 100+ physics bodies smoothly at 60 FPS

## Technology Stack

- **JavaScript/ES6 Modules**: Modern JavaScript with ES6 imports
- **Three.js**: 3D graphics and rendering
- **Vite**: Fast development server and build tool
- **Electron**: Cross-platform desktop application support (optional)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/TheRoom.git
cd TheRoom

# Install dependencies
npm install
```

### Running the Application

#### Web Browser (Recommended)

**Development mode:**
```bash
npm run dev
```
Then open your browser to `http://localhost:7878` (or the port shown in the terminal).

**Production build:**
```bash
npm run build
npm run preview
```

#### Desktop Application (Electron)

**Development mode:**
```bash
npm run electron:dev
```

**Build desktop app:**
```bash
npm run build
npm run dist
```

## Project Structure

```
TheRoom/
├── LICENSE                 # MIT License
├── README.md              # This file
├── PORTFOLIO.md           # Portfolio showcase and technical achievements
├── CHANGELOG.md           # Version history
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── index.html             # Main HTML entry point
├── src/
│   ├── app.js             # Main application entry point
│   ├── router.js          # Client-side routing
│   ├── main.js            # Electron main process
│   ├── preload.js         # Electron preload script
│   ├── renderer.js        # Three.js renderer setup
│   ├── room.js            # Room geometry and setup
│   ├── matrixEffect.js    # Visual effects
│   ├── styles.css         # Application styles
│   ├── components/        # UI components
│   │   └── PhysicsDocumentation.js
│   ├── scenes/            # Physics simulation scenes
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
│   │   ├── ArduinoScene.js
│   │   ├── BoardElectricalScene.js
│   │   └── VirtualChipScene.js
│   ├── physics/           # Physics engine
│   │   ├── core/          # Core physics classes
│   │   │   ├── Engine.js
│   │   │   ├── World.js
│   │   │   └── Body.js
│   │   ├── collision/     # Collision detection
│   │   │   ├── BroadPhase.js
│   │   │   ├── NarrowPhase.js
│   │   │   ├── CollisionDetector.js
│   │   │   └── shapes/    # Collision shapes
│   │   ├── integrators/   # Numerical integration methods
│   │   │   ├── EulerIntegrator.js
│   │   │   ├── RK4Integrator.js
│   │   │   └── VerletIntegrator.js
│   │   ├── math/          # Math utilities
│   │   │   ├── Vector3.js
│   │   │   ├── Quaternion.js
│   │   │   ├── Matrix3.js
│   │   │   ├── Matrix4.js
│   │   │   └── MathUtils.js
│   │   ├── spatial/       # Spatial partitioning
│   │   │   ├── SpatialGrid.js
│   │   │   ├── BVH.js
│   │   │   └── Octree.js
│   │   └── engines/       # Specialized physics engines
│   │       └── ParticleEngine.js
│   ├── docs/              # Educational documentation
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
│   └── data/              # Data files
│       └── boards/         # Board definitions
└── dist/                  # Build output
```

## Documentation

- **[Portfolio Showcase](PORTFOLIO.md)**: Technical achievements and skills demonstrated
- **[Architecture Documentation](docs/ARCHITECTURE.md)**: System architecture and design
- **[API Documentation](docs/API.md)**: Physics engine API reference
- **[Development Guide](docs/DEVELOPMENT.md)**: Development setup and workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Deployment instructions
- **[Project Structure](docs/STRUCTURE.md)**: Detailed project organization
- **[Changelog](CHANGELOG.md)**: Version history

## Usage Examples

### Creating a Physics Scene

```javascript
import { Engine } from './physics/core/Engine.js';
import { Body } from './physics/core/Body.js';
import { Box } from './physics/collision/shapes/Box.js';

// Create physics engine
const engine = new Engine();

// Create a physics body
const body = new Body();
body.position.set(0, 10, 0);
body.setMass(1.0);
body.collisionShape = new Box(new Vector3(1, 1, 1));

// Add to world
engine.addBody(body);

// Start simulation
engine.start();
```

### Using Different Integrators

```javascript
import { RK4Integrator } from './physics/integrators/RK4Integrator.js';

// Use RK4 for higher accuracy
RK4Integrator.integrate(position, velocity, accelerationFunction, deltaTime);
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Web Deployment

The application is fully web-compatible and can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your hosting service
3. The application will work in any modern web browser

**Recommended hosting services:**
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## Technical Highlights

This portfolio project demonstrates:

- **System Design**: Architecture of complex, multi-component systems
- **Algorithm Implementation**: Advanced algorithms (collision detection, spatial partitioning, numerical integration)
- **Performance Optimization**: Efficient algorithms and data structures
- **Mathematics & Physics**: Deep understanding of 3D mathematics, Newtonian mechanics, and numerical methods
- **Code Quality**: Clean, maintainable, well-documented codebase with comprehensive JSDoc

See [PORTFOLIO.md](PORTFOLIO.md) for detailed technical achievements and skills demonstrated.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for excellent 3D graphics library
- Physics education community for inspiration

---

A portfolio project demonstrating advanced software engineering and physics simulation capabilities
