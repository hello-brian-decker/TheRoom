# The Room - Interactive Physics Lab & Educational Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Three.js](https://img.shields.io/badge/Three.js-0.160+-green.svg)](https://threejs.org/)

A comprehensive 3D physics simulation and educational platform featuring interactive demonstrations, a custom physics engine, and educational tools for learning physics, electronics, and programming concepts.

## Overview

The Room is an interactive web-based physics laboratory that combines real-time 3D simulations with educational content. It features a custom-built physics engine, multiple integration methods, advanced collision detection, and a variety of educational tools including an Arduino simulator and circuit designer.

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

### Physics Engine

- **Custom 3D Physics Engine**: Built from scratch with mathematical foundations
- **Multiple Integration Methods**: Euler, RK4 (Runge-Kutta 4th order), and Verlet integration
- **Advanced Collision Detection**: Broad phase and narrow phase collision detection
- **Spatial Partitioning**: Spatial Grid, BVH (Bounding Volume Hierarchy), and Octree support
- **Collision Shapes**: Box, Sphere, and Mesh collision shapes
- **Impulse-Based Resolution**: Realistic collision response with friction and restitution

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
├── CONTRIBUTING.md        # Contribution guidelines
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

- **[Architecture Documentation](docs/ARCHITECTURE.md)**: System architecture and design
- **[API Documentation](docs/API.md)**: Physics engine API reference
- **[Development Guide](docs/DEVELOPMENT.md)**: Development setup and workflow
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Deployment instructions
- **[Project Structure](docs/STRUCTURE.md)**: Detailed project organization
- **[Contributing Guidelines](CONTRIBUTING.md)**: How to contribute
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

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js community for excellent 3D graphics library
- Physics education community for inspiration
- Open source contributors

## Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/TheRoom/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/TheRoom/discussions)

---

Made with ❤️ for physics education and simulation
