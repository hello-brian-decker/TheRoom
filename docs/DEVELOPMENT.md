# Development Guide

## Development Setup

### Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)
- Modern code editor (VS Code recommended)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/yourusername/TheRoom.git
cd TheRoom

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:7878` (or the port shown in terminal).

## Project Structure

See [STRUCTURE.md](STRUCTURE.md) for detailed project organization.

### Key Directories

- `src/`: Source code
  - `physics/`: Physics engine implementation
  - `scenes/`: Individual simulation scenes
  - `components/`: Reusable UI components
  - `docs/`: Educational documentation data
- `docs/`: Project documentation
- `dist/`: Build output (generated)

## Development Workflow

### Adding a New Scene

1. **Create scene file** in `src/scenes/`:

```javascript
/**
 * MyScene - Description of the scene
 */
import * as THREE from 'three';
import { Engine } from '../physics/core/Engine.js';

export class MyScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsEngine = null;
        this.animationId = null;
    }

    async init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        // ... setup code
    }

    update(deltaTime) {
        // Update physics and rendering
    }

    dispose() {
        // Clean up resources
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // ... cleanup code
    }
}
```

2. **Register route** in `src/app.js`:

```javascript
this.router.register('/my-scene', async () => {
    const scene = new MyScene(this.canvas);
    await scene.init();
    return scene;
});
```

3. **Add route title** in `src/app.js`:

```javascript
getRouteTitle(route) {
    const titles = {
        // ... existing routes
        '/my-scene': 'My Scene'
    };
    return titles[route] || 'Physics Lab';
}
```

### Adding Physics Features

#### Creating a New Collision Shape

1. Create shape class in `src/physics/collision/shapes/`:

```javascript
import { Vector3 } from '../../math/Vector3.js';

export class MyShape {
    constructor(/* parameters */) {
        // Initialize shape
    }

    updateBounds(position, rotation, scale) {
        // Update world-space bounds
    }

    getIntersection(other) {
        // Return intersection data or null
    }
}
```

2. Add collision detection in `NarrowPhase.js`:

```javascript
if (shapeA instanceof MyShape && shapeB instanceof MyShape) {
    return this.myShapeCollision(shapeA, shapeB);
}
```

#### Creating a New Integrator

1. Create integrator class in `src/physics/integrators/`:

```javascript
import { Vector3 } from '../math/Vector3.js';

export class MyIntegrator {
    static integrate(position, velocity, acceleration, deltaTime) {
        // Integration logic
    }
}
```

2. Use in `World.js` or scene:

```javascript
MyIntegrator.integrate(body.position, body.velocity, body.acceleration, deltaTime);
```

### Code Style Guidelines

#### JavaScript/ES6

- Use `const` for constants, `let` for variables
- Use arrow functions for callbacks
- Use template literals for strings
- Use destructuring when appropriate
- Use async/await for asynchronous code

#### Naming Conventions

- Classes: PascalCase (`MyClass`)
- Functions/Methods: camelCase (`myFunction`)
- Constants: UPPER_SNAKE_CASE (`MAX_VALUE`)
- Files: PascalCase for classes (`MyClass.js`), camelCase for utilities (`mathUtils.js`)

#### Documentation

- Add JSDoc comments for all public methods
- Include parameter types and descriptions
- Document return values
- Add usage examples for complex functions

#### Example

```javascript
/**
 * Calculates the distance between two points
 * @param {Vector3} pointA - First point
 * @param {Vector3} pointB - Second point
 * @returns {number} Distance between points
 * @example
 * const dist = calculateDistance(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
 */
function calculateDistance(pointA, pointB) {
    return pointA.distanceTo(pointB);
}
```

## Debugging

### Browser DevTools

- Open DevTools (F12)
- Use Console for logging
- Use Sources tab for breakpoints
- Use Performance tab for profiling

### Common Issues

#### Physics Bodies Not Moving

- Check if body is static: `body.isStatic`
- Verify forces are being applied
- Check if engine is running: `engine.isRunning`

#### Collisions Not Detecting

- Ensure bodies have collision shapes: `body.collisionShape`
- Check collision groups/masks
- Verify collision detector is initialized

#### Performance Issues

- Reduce number of physics bodies
- Use spatial partitioning (grid, BVH)
- Reduce rendering complexity
- Check for memory leaks (dispose methods)

### Performance Profiling

```javascript
// Measure function execution time
const start = performance.now();
// ... code to measure
const end = performance.now();
console.log(`Execution time: ${end - start}ms`);
```

## Testing

### Manual Testing

1. Test in multiple browsers (Chrome, Firefox, Safari)
2. Test in both web and Electron modes
3. Test with various numbers of objects
4. Test edge cases (zero mass, infinite values, etc.)

### Testing Checklist

- [ ] Scene initializes correctly
- [ ] Physics simulation runs smoothly
- [ ] Collisions detect correctly
- [ ] UI controls work
- [ ] Scene disposes cleanly
- [ ] No console errors
- [ ] Performance is acceptable

## Building

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output will be in `dist/` directory.

### Electron Build

```bash
npm run build
npm run dist
```

## Git Workflow

### Branch Naming

- `feature/feature-name`: New features
- `fix/bug-name`: Bug fixes
- `docs/documentation-update`: Documentation updates
- `refactor/refactor-name`: Code refactoring

### Commit Messages

Follow conventional commits:

- `feat: Add new scene`
- `fix: Fix collision detection bug`
- `docs: Update API documentation`
- `refactor: Simplify physics integration`

### Pull Requests

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Update documentation
5. Create pull request with clear description

## Resources

### Documentation

- [Three.js Documentation](https://threejs.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### Physics References

- [Game Physics Engine Development](https://www.amazon.com/Game-Physics-Engine-Development-Commercial-Grade/dp/0123819768)
- [Real-Time Collision Detection](https://www.amazon.com/Real-Time-Collision-Detection-Interactive-Technology/dp/1558607323)

## Getting Help

- Check existing documentation
- Search GitHub issues
- Ask in discussions
- Review code examples in scenes

