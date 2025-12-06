# API Documentation

## Physics Engine API

### Engine

Main physics engine coordinator.

#### Constructor

```javascript
const engine = new Engine();
```

#### Methods

##### `registerEngine(type, engine)`

Register a specialized physics engine.

**Parameters:**
- `type` (string): Engine type identifier
- `engine` (Object): Engine instance with optional `update(deltaTime)` method

**Example:**
```javascript
const particleEngine = new ParticleEngine();
engine.registerEngine('particle', particleEngine);
```

##### `start()`

Start the physics simulation loop.

**Example:**
```javascript
engine.start();
```

##### `stop()`

Stop the physics simulation.

**Example:**
```javascript
engine.stop();
```

##### `addBody(body)`

Add a physics body to the world.

**Parameters:**
- `body` (Body): Physics body to add

**Example:**
```javascript
const body = new Body();
body.position.set(0, 10, 0);
engine.addBody(body);
```

##### `getWorld()`

Get the physics world instance.

**Returns:** World instance

**Example:**
```javascript
const world = engine.getWorld();
world.gravity.set(0, -9.81, 0);
```

### World

Physics world containing all bodies.

#### Constructor

```javascript
const world = new World();
```

#### Properties

- `gravity` (Vector3): Gravity vector (default: (0, -9.81, 0))
- `timeStep` (number): Fixed timestep (default: 1/60)
- `bodies` (Array<Body>): Array of physics bodies

#### Methods

##### `addBody(body)`

Add a body to the world.

**Parameters:**
- `body` (Body): Physics body

##### `removeBody(body)`

Remove a body from the world.

**Parameters:**
- `body` (Body): Physics body to remove

##### `step(deltaTime)`

Step the simulation forward.

**Parameters:**
- `deltaTime` (number): Time step in seconds

**Example:**
```javascript
world.step(1/60); // 60 FPS
```

### Body

Physics body representing a physical object.

#### Constructor

```javascript
const body = new Body();
```

#### Properties

- `position` (Vector3): World position
- `velocity` (Vector3): Linear velocity
- `acceleration` (Vector3): Linear acceleration
- `rotation` (Quaternion): Orientation
- `angularVelocity` (Vector3): Angular velocity
- `mass` (number): Mass in kg
- `restitution` (number): Bounciness (0-1)
- `friction` (number): Friction coefficient
- `collisionShape` (Shape): Collision shape (Box, Sphere, Mesh)
- `isStatic` (boolean): Whether body is static
- `isKinematic` (boolean): Whether body is kinematic

#### Methods

##### `setMass(mass)`

Set body mass.

**Parameters:**
- `mass` (number): Mass value (must be positive)

**Example:**
```javascript
body.setMass(2.5);
```

##### `setStatic()`

Make body static (immovable).

**Example:**
```javascript
body.setStatic();
```

##### `applyForce(force)`

Apply a force to the body.

**Parameters:**
- `force` (Vector3): Force vector

**Example:**
```javascript
body.applyForce(new Vector3(0, -9.81 * body.mass, 0));
```

##### `applyImpulse(impulse)`

Apply an impulse (instantaneous velocity change).

**Parameters:**
- `impulse` (Vector3): Impulse vector

**Example:**
```javascript
body.applyImpulse(new Vector3(0, 10, 0)); // Jump
```

##### `getBoundingBox()`

Get world-space bounding box.

**Returns:** Object with `min` and `max` Vector3 properties

### Collision Detection

#### CollisionDetector

Main collision detection coordinator.

##### Constructor

```javascript
const detector = new CollisionDetector('grid'); // 'grid', 'bvh', or 'brute'
```

##### Methods

###### `initialize(bounds, cellSize)`

Initialize collision detector.

**Parameters:**
- `bounds` (Object): World bounds with `min` and `max` Vector3
- `cellSize` (number): Cell size for spatial grid

###### `detectCollisions(bodies)`

Detect all collisions.

**Parameters:**
- `bodies` (Array<Body>): Array of physics bodies

**Returns:** Array of contact objects

**Example:**
```javascript
const contacts = detector.detectCollisions(world.bodies);
for (const contact of contacts) {
    console.log(`Collision: ${contact.bodyA} and ${contact.bodyB}`);
}
```

#### Collision Shapes

##### Box

Axis-aligned bounding box.

```javascript
const box = new Box(new Vector3(1, 1, 1)); // Half extents
body.collisionShape = box;
```

##### Sphere

Spherical collision shape.

```javascript
const sphere = new Sphere(1.0); // Radius
body.collisionShape = sphere;
```

##### Mesh

Triangle mesh collision shape.

```javascript
const mesh = new Mesh(vertices, indices);
body.collisionShape = mesh;
```

### Integration Methods

#### EulerIntegrator

Simple Euler integration.

```javascript
EulerIntegrator.integrate(position, velocity, acceleration, deltaTime);
```

#### RK4Integrator

Runge-Kutta 4th order integration.

```javascript
const accelFunc = (pos, vel, t) => {
    // Compute acceleration
    return acceleration;
};
RK4Integrator.integrate(position, velocity, accelFunc, deltaTime, currentTime);
```

#### VerletIntegrator

Verlet integration.

```javascript
VerletIntegrator.integrate(position, previousPosition, acceleration, deltaTime);
```

### Math Utilities

#### Vector3

3D vector class.

```javascript
const v = new Vector3(1, 2, 3);
v.add(otherVector);
v.multiplyScalar(2);
const length = v.length();
v.normalize();
```

#### Quaternion

Rotation quaternion.

```javascript
const q = new Quaternion();
q.setFromAxisAngle(axis, angle);
q.setFromEuler(euler);
```

#### MathUtils

Static utility functions.

```javascript
MathUtils.clamp(value, min, max);
MathUtils.lerp(a, b, t);
MathUtils.degToRad(degrees);
MathUtils.radToDeg(radians);
```

## Application API

### Router

Client-side routing system.

#### Constructor

```javascript
const router = new Router();
```

#### Methods

##### `register(path, sceneFactory)`

Register a route.

**Parameters:**
- `path` (string): Route path (e.g., '/waterfall')
- `sceneFactory` (Function): Function that creates and returns scene

**Example:**
```javascript
router.register('/waterfall', async () => {
    const scene = new WaterfallScene(canvas);
    await scene.init();
    return scene;
});
```

##### `navigate(path)`

Navigate to a route.

**Parameters:**
- `path` (string): Route path

##### `init()`

Initialize router and handle initial route.

### Scene Interface

All scenes implement this interface:

#### Methods

##### `async init()`

Initialize the scene. Called when scene is created.

##### `update(deltaTime)`

Update the scene. Called each frame.

**Parameters:**
- `deltaTime` (number): Time since last frame in seconds

##### `dispose()`

Clean up scene resources. Called when scene is destroyed.

## Usage Examples

### Basic Physics Simulation

```javascript
import { Engine } from './physics/core/Engine.js';
import { Body } from './physics/core/Body.js';
import { Sphere } from './physics/collision/shapes/Sphere.js';
import { Vector3 } from './physics/math/Vector3.js';

// Create engine
const engine = new Engine();

// Create body
const body = new Body();
body.position.set(0, 10, 0);
body.setMass(1.0);
body.collisionShape = new Sphere(0.5);
body.velocity.set(5, 0, 0);

// Add to world
engine.addBody(body);

// Start simulation
engine.start();
```

### Collision Detection

```javascript
import { CollisionDetector } from './physics/collision/CollisionDetector.js';
import { Vector3 } from './physics/math/Vector3.js';

// Create detector
const detector = new CollisionDetector('grid');
detector.initialize(
    { min: new Vector3(-50, -50, -50), max: new Vector3(50, 50, 50) },
    2.0
);

// Detect collisions
const contacts = detector.detectCollisions(world.bodies);

// Process contacts
for (const contact of contacts) {
    // Resolve collision
    resolveCollision(contact);
}
```

### Custom Integration

```javascript
import { RK4Integrator } from './physics/integrators/RK4Integrator.js';

// Define acceleration function
const gravitationalAcceleration = (position, velocity, time) => {
    const r = position.length();
    const GM = 398600.4418; // Earth gravitational parameter
    return position.clone().negate().multiplyScalar(GM / (r * r * r));
};

// Integrate
RK4Integrator.integrate(
    body.position,
    body.velocity,
    gravitationalAcceleration,
    deltaTime,
    currentTime
);
```

