/**
 * Engine - Main Physics Engine Coordinator
 * 
 * Coordinates different physics engines and manages the overall simulation.
 * Acts as a facade for the physics system, providing a unified interface
 * for managing physics simulations.
 * 
 * The Engine class manages:
 * - The physics World containing all bodies
 * - Multiple specialized physics engines (particle systems, etc.)
 * - The main simulation loop
 * - Performance statistics
 * 
 * @example
 * // Create and start a physics engine
 * const engine = new Engine();
 * const body = new Body();
 * engine.addBody(body);
 * engine.start();
 * 
 * // Stop the simulation
 * engine.stop();
 */
import { World } from './World.js';

export class Engine {
    /**
     * Creates a new Physics Engine instance
     * 
     * Initializes a new World and prepares the engine for simulation.
     * The engine is not running by default - call start() to begin simulation.
     */
    constructor() {
        /** @type {World} The physics world containing all bodies */
        this.world = new World();
        
        /** @type {Map<string, Object>} Map of engine type identifiers to engine instances */
        this.engines = new Map();
        
        /** @type {boolean} Whether the simulation is currently running */
        this.isRunning = false;
        
        /** @type {number} Timestamp of last update (for delta time calculation) */
        this.lastTime = performance.now();
    }

    /**
     * Register a specialized physics engine
     * 
     * Allows registration of specialized engines (e.g., particle systems)
     * that work alongside the main physics world. The engine will receive
     * update calls during the simulation loop.
     * 
     * @param {string} type - Engine type identifier (e.g., 'particle', 'fluid')
     * @param {Object} engine - Engine instance with an optional update(deltaTime) method
     * @example
     * const particleEngine = new ParticleEngine();
     * engine.registerEngine('particle', particleEngine);
     */
    registerEngine(type, engine) {
        this.engines.set(type, engine);
        engine.world = this.world; // Give engine access to world
    }

    /**
     * Get a registered engine by type
     * 
     * @param {string} type - Engine type identifier
     * @returns {Object|null} The engine instance, or null if not found
     * @example
     * const particleEngine = engine.getEngine('particle');
     */
    getEngine(type) {
        return this.engines.get(type) || null;
    }

    /**
     * Start the physics simulation
     * 
     * Begins the main simulation loop using requestAnimationFrame.
     * The simulation will continue until stop() is called.
     * 
     * @example
     * engine.start(); // Simulation begins running
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.update();
    }

    /**
     * Stop the physics simulation
     * 
     * Stops the simulation loop. Bodies remain in their current state.
     * Call start() again to resume simulation.
     * 
     * @example
     * engine.stop(); // Simulation stops
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Main update loop (called automatically by requestAnimationFrame)
     * 
     * Calculates delta time and steps the physics world forward.
     * Also updates all registered specialized engines.
     * 
     * @private
     */
    update() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Step the world
        this.world.step(deltaTime);

        // Update all registered engines
        for (const [type, engine] of this.engines) {
            if (engine.update) {
                engine.update(deltaTime);
            }
        }

        // Continue loop
        requestAnimationFrame(() => this.update());
    }

    /**
     * Step the simulation forward manually
     * 
     * Advances the simulation by a fixed time step. Useful for:
     * - Manual control of simulation timing
     * - Fixed timestep simulations
     * - Testing and debugging
     * 
     * @param {number} deltaTime - Time step in seconds
     * @example
     * // Step forward by 1/60th of a second (60 FPS)
     * engine.step(1/60);
     */
    step(deltaTime) {
        this.world.step(deltaTime);
        for (const [type, engine] of this.engines) {
            if (engine.update) {
                engine.update(deltaTime);
            }
        }
    }

    /**
     * Add a physics body to the world
     * 
     * @param {Body} body - The physics body to add
     * @example
     * const body = new Body();
     * body.position.set(0, 10, 0);
     * engine.addBody(body);
     */
    addBody(body) {
        this.world.addBody(body);
    }

    /**
     * Remove a physics body from the world
     * 
     * @param {Body} body - The physics body to remove
     * @example
     * engine.removeBody(body);
     */
    removeBody(body) {
        this.world.removeBody(body);
    }

    /**
     * Get the physics world instance
     * 
     * @returns {World} The physics world
     * @example
     * const world = engine.getWorld();
     * world.gravity.set(0, -9.81, 0);
     */
    getWorld() {
        return this.world;
    }

    /**
     * Get performance statistics
     * 
     * Returns statistics about the simulation including:
     * - Number of bodies
     * - Number of collisions
     * - Number of contacts
     * - Update time
     * - Number of registered engines
     * 
     * @returns {Object} Statistics object with simulation metrics
     * @example
     * const stats = engine.getStats();
     * console.log(`Bodies: ${stats.bodies}, Collisions: ${stats.collisions}`);
     */
    getStats() {
        return {
            ...this.world.stats,
            engines: this.engines.size
        };
    }
}

