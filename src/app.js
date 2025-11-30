/**
 * App - Main Application Entry Point
 * 
 * Initializes routing and manages scene lifecycle.
 */

import { Router } from './router.js';
import { HomeScene } from './scenes/HomeScene.js';
import { WaterfallScene } from './scenes/WaterfallScene.js';
import { RigidBodyScene } from './scenes/RigidBodyScene.js';
import { ProjectileScene } from './scenes/ProjectileScene.js';
import { CollisionScene } from './scenes/CollisionScene.js';
import { PendulumScene } from './scenes/PendulumScene.js';
import { SpringMassScene } from './scenes/SpringMassScene.js';
import { OrbitalScene } from './scenes/OrbitalScene.js';
import { ClothScene } from './scenes/ClothScene.js';
import { FluidScene } from './scenes/FluidScene.js';
import { SolarSystemScene } from './scenes/SolarSystemScene.js';
import { VirtualChipScene } from './scenes/VirtualChipScene.js';
import { ArduinoScene } from './scenes/ArduinoScene.js';
import { BoardElectricalScene } from './scenes/BoardElectricalScene.js';

class App {
    constructor() {
        this.router = new Router();
        this.canvas = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Get canvas
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }

        // Register routes
        this.registerRoutes();

        // Set up route change handler
        this.router.onRouteChange = (route, scene) => {
            console.log(`Route changed to: ${route}`);
            document.title = `The Room - ${this.getRouteTitle(route)}`;
        };

        // Initialize router
        this.router.init();
    }

    /**
     * Register all routes
     */
    registerRoutes() {
        // Default route (home/welcome)
        this.router.register('/', async () => {
            const scene = new HomeScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Waterfall route
        this.router.register('/waterfall', async () => {
            const scene = new WaterfallScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Rigid Body route
        this.router.register('/rigid-body', async () => {
            const scene = new RigidBodyScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Projectile route
        this.router.register('/projectile', async () => {
            const scene = new ProjectileScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Collision route
        this.router.register('/collision', async () => {
            const scene = new CollisionScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Pendulum route
        this.router.register('/pendulum', async () => {
            const scene = new PendulumScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Spring-Mass route
        this.router.register('/spring-mass', async () => {
            const scene = new SpringMassScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Orbital route
        this.router.register('/orbital', async () => {
            const scene = new OrbitalScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Cloth route
        this.router.register('/cloth', async () => {
            const scene = new ClothScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Fluid route
        this.router.register('/fluid', async () => {
            const scene = new FluidScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Solar System route
        this.router.register('/solar-system', async () => {
            const scene = new SolarSystemScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Virtual Chip route
        this.router.register('/virtual-chip', async () => {
            const scene = new VirtualChipScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Arduino route
        this.router.register('/arduino', async () => {
            const scene = new ArduinoScene(this.canvas);
            await scene.init();
            return scene;
        });

        // Board Electrical route
        this.router.register('/board-electrical', async () => {
            const scene = new BoardElectricalScene(this.canvas);
            await scene.init();
            return scene;
        });
    }

    /**
     * Get title for route
     */
    getRouteTitle(route) {
        const titles = {
            '/': 'Physics Lab',
            '/waterfall': 'Rubber Ball Physics',
            '/rigid-body': 'Rigid Body Dynamics',
            '/projectile': 'Projectile Motion',
            '/collision': 'Collision Demonstrations',
            '/pendulum': 'Pendulum Systems',
            '/spring-mass': 'Spring-Mass Systems',
            '/orbital': 'Orbital Mechanics',
            '/cloth': 'Cloth Simulation',
            '/fluid': 'Fluid Simulation',
            '/solar-system': 'Solar System',
            '/virtual-chip': 'Virtual Chip Designer',
            '/arduino': 'Arduino Simulator',
            '/board-electrical': 'Board Electrical Systems'
        };
        return titles[route] || 'Physics Lab';
    }

    /**
     * Navigate to route
     */
    navigate(path) {
        this.router.navigate(path);
    }
}

// Initialize app
const app = new App();
app.init().catch(error => {
    console.error('Error initializing app:', error);
});

// Export for debugging
window.app = app;

