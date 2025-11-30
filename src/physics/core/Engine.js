/**
 * Engine - Main Physics Engine Coordinator
 * 
 * Coordinates different physics engines and manages the overall simulation.
 * Acts as a facade for the physics system.
 */

import { World } from './World.js';

export class Engine {
    constructor() {
        this.world = new World();
        this.engines = new Map(); // Map of engine types to instances
        this.isRunning = false;
        this.lastTime = performance.now();
    }

    /**
     * Register a physics engine
     * @param {string} type - Engine type identifier
     * @param {Object} engine - Engine instance
     */
    registerEngine(type, engine) {
        this.engines.set(type, engine);
        engine.world = this.world; // Give engine access to world
    }

    /**
     * Get an engine by type
     */
    getEngine(type) {
        return this.engines.get(type);
    }

    /**
     * Start the physics simulation
     */
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.update();
    }

    /**
     * Stop the physics simulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Update loop
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
     * Step once (for manual control)
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
     * Add body to world
     */
    addBody(body) {
        this.world.addBody(body);
    }

    /**
     * Remove body from world
     */
    removeBody(body) {
        this.world.removeBody(body);
    }

    /**
     * Get world
     */
    getWorld() {
        return this.world;
    }

    /**
     * Get performance stats
     */
    getStats() {
        return {
            ...this.world.stats,
            engines: this.engines.size
        };
    }
}

