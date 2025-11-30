# The Room - Matrix 3D Game

A 3D game featuring a cube-shaped room with Matrix-style visual effects (green code rain and dark green aesthetic). Playable in web browsers or as a desktop application.

## Technology Stack

- **JavaScript/ES6 Modules**: Modern JavaScript with ES6 imports
- **Three.js**: 3D graphics library
- **Electron**: Desktop application framework (optional)
- **Vite**: Fast development server and build tool

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

### Installation

1. Install dependencies:
```bash
npm install
```

## Running the Game

### Web Browser (Recommended)

**Development mode:**
```bash
npm run dev
```
Then open your browser to http://localhost:5173

**Access from other devices on your network:**
After starting the dev server, Vite will display the network URL (e.g., `http://192.168.1.100:5173`). Use this URL from any device on the same network. If it doesn't show automatically, find your local IP address:
- **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your local IP (usually starts with 192.168.x.x or 10.x.x.x)
- **Windows**: Run `ipconfig` and look for IPv4 Address

Then access: `http://YOUR_LOCAL_IP:5173` from another device.

**Production build:**
```bash
npm run build
npm run preview
```
Then open your browser to the URL shown (typically http://localhost:4173)

**Deploy to web:**
After running `npm run build`, the `dist` folder contains all files needed for web deployment. Upload the contents to any static web hosting service (GitHub Pages, Netlify, Vercel, etc.).

### Desktop Application (Electron)

**Development mode:**
```bash
npm run electron:dev
```

This will:
- Start the Vite dev server on http://localhost:5173
- Launch Electron when the server is ready
- Open DevTools automatically for debugging

**Build desktop app:**
```bash
npm run build
npm run dist
```

The built application will be in the `dist` directory.

## Project Structure

```
TheRoom/
├── package.json          # Dependencies and scripts
├── index.html            # Main HTML entry point
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Electron preload script
│   ├── renderer.js      # Three.js scene setup
│   ├── room.js          # Room geometry and setup
│   ├── matrixEffect.js  # Green code rain shader effect
│   └── styles.css       # Basic styling
└── README.md            # This file
```

## Features

- **3D Cube Room**: A cube-shaped room with dark green aesthetic
- **Matrix Code Rain**: Animated falling green characters
- **Green Grid Pattern**: Subtle grid overlay on walls and floor
- **Ambient Lighting**: Dark environment with green emissive glow

## Future Extensibility

The modular structure allows easy addition of:
- Interactive objects (furniture, props)
- Player movement/camera controls
- Physics engine integration
- Additional visual effects
- Game mechanics

## Controls

Currently, the camera is positioned at the center of the room. Future updates will add:
- Mouse look controls
- WASD movement
- Interactive object manipulation

## Web Deployment

The game is fully web-compatible and can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Upload the `dist` folder contents to your hosting service
3. The game will work in any modern web browser

No server-side code is required - it's a pure client-side web application.

