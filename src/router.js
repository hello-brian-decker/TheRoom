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

        // Clear any error left over from a previous route
        const staleError = document.getElementById('route-error');
        if (staleError) {
            staleError.remove();
        }

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
            this.showError(route, error);
        }
    }

    /**
     * Show a scene failure on the page.
     *
     * Scenes render into a canvas, so a failure during creation otherwise leaves
     * nothing on screen and the only trace is a console message.
     */
    showError(route, error) {
        let banner = document.getElementById('route-error');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'route-error';
            banner.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 3000;
                max-width: 600px;
                padding: 25px 30px;
                background: #fff;
                border: 2px solid #cc0033;
                border-radius: 8px;
                font-family: 'Arial', sans-serif;
                color: #333;
            `;
            document.body.appendChild(banner);
        }
        banner.innerHTML = '';

        const title = document.createElement('h2');
        title.textContent = `Could not load ${route}`;
        title.style.cssText = 'margin: 0 0 10px 0; color: #cc0033; font-size: 20px;';
        banner.appendChild(title);

        const detail = document.createElement('p');
        detail.textContent = error && error.message ? error.message : String(error);
        detail.style.cssText = 'margin: 0; font-size: 14px; line-height: 1.5;';
        banner.appendChild(detail);
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

