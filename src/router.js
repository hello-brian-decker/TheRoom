/**
 * Router - Client-side Routing System
 * 
 * Handles navigation between different scenes/effects using hash-based routing.
 * Manages scene lifecycle (creation, cleanup, disposal).
 * 
 * @example
 * const router = new Router();
 * router.register('/', () => new HomeScene(canvas));
 * router.init();
 */
export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentScene = null;
        this.onRouteChange = null;
    }

    /**
     * Register a route
     * @param {string} path - Route path (e.g., '/matrix', '/waterfall')
     * @param {Function} sceneFactory - Function that creates and returns the scene
     */
    register(path, sceneFactory) {
        this.routes.set(path, sceneFactory);
    }

    /**
     * Get current route from URL
     */
    getCurrentRoute() {
        const hash = window.location.hash.slice(1) || '/';
        return hash;
    }

    /**
     * Navigate to a route
     */
    navigate(path) {
        window.location.hash = path;
        this.handleRoute();
    }

    /**
     * Handle route change
     */
    async handleRoute() {
        const route = this.getCurrentRoute();
        
        // Clean up current scene
        if (this.currentScene && this.currentScene.dispose) {
            this.currentScene.dispose();
        }

        // Get scene factory
        const sceneFactory = this.routes.get(route);
        
        if (!sceneFactory) {
            console.warn(`Route not found: ${route}`);
            // Try default route
            const defaultFactory = this.routes.get('/');
            if (defaultFactory) {
                this.currentScene = await defaultFactory();
                this.currentRoute = '/';
            }
            return;
        }

        // Create new scene
        try {
            this.currentScene = await sceneFactory();
            this.currentRoute = route;
            
            if (this.onRouteChange) {
                this.onRouteChange(route, this.currentScene);
            }
        } catch (error) {
            console.error(`Error creating scene for route ${route}:`, error);
        }
    }

    /**
     * Initialize router
     */
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            this.handleRoute();
        });

        // Handle initial route
        this.handleRoute();
    }

    /**
     * Get current scene
     */
    getCurrentScene() {
        return this.currentScene;
    }
}

