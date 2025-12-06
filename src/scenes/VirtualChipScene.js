/**
 * VirtualChipScene - Interactive Circuit Simulator
 * 
 * Build and simulate circuits with analog and digital components
 */

import * as THREE from 'three';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { circuitsDocumentation } from '../docs/circuits.js';

export class VirtualChipScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        
        // Circuit state
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.selectedPin = null;
        this.wireStartPin = null;
        this.isPlacingWire = false;
        this.mousePos = { x: 0, y: 0 };
        this.gridSize = 20;
        
        // Component types
        this.componentTypes = {
            // Analog
            resistor: { name: 'Resistor', type: 'analog', pins: 2, defaultValue: 1000, unit: 'Ω', color: 0xff6b6b },
            capacitor: { name: 'Capacitor', type: 'analog', pins: 2, defaultValue: 0.000001, unit: 'F', color: 0x4ecdc4 },
            inductor: { name: 'Inductor', type: 'analog', pins: 2, defaultValue: 0.001, unit: 'H', color: 0x95e1d3 },
            diode: { name: 'Diode', type: 'analog', pins: 2, defaultValue: 0.7, unit: 'V', color: 0xf38181 },
            voltageSource: { name: 'Voltage Source', type: 'analog', pins: 2, defaultValue: 5, unit: 'V', color: 0xffd93d },
            ground: { name: 'Ground', type: 'analog', pins: 1, defaultValue: 0, unit: 'V', color: 0x6c757d },
            // Digital
            andGate: { name: 'AND Gate', type: 'digital', pins: 3, defaultValue: null, unit: '', color: 0x9b59b6 },
            orGate: { name: 'OR Gate', type: 'digital', pins: 3, defaultValue: null, unit: '', color: 0x9b59b6 },
            notGate: { name: 'NOT Gate', type: 'digital', pins: 2, defaultValue: null, unit: '', color: 0x9b59b6 },
            nandGate: { name: 'NAND Gate', type: 'digital', pins: 3, defaultValue: null, unit: '', color: 0x9b59b6 },
            norGate: { name: 'NOR Gate', type: 'digital', pins: 3, defaultValue: null, unit: '', color: 0x9b59b6 },
            xorGate: { name: 'XOR Gate', type: 'digital', pins: 3, defaultValue: null, unit: '', color: 0x9b59b6 },
            led: { name: 'LED', type: 'digital', pins: 2, defaultValue: null, unit: '', color: 0xff6b6b }
        };
        
        // Simulation state
        this.isSimulating = false;
        this.nodeVoltages = new Map();
        
        // View mode: 'circuit' or 'schematic'
        this.viewMode = 'circuit';
        this.documentation = null;
    }

    async init() {
        try {
            // Use 2D canvas overlay instead of Three.js for circuit diagram
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf8f9fa);

            this.camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            this.camera.position.set(0, 0, 5);
            this.camera.lookAt(0, 0, 0);

            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas,
                antialias: true 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Ensure document.body is ready
            if (!document.body) {
                await new Promise(resolve => {
                    if (document.body) resolve();
                    else document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Create 2D canvas overlay for circuit diagram
            this.createCircuitCanvas();
            
            // Create UI
            this.createComponentPalette();
            console.log('Component palette created');
            this.createPropertiesPanel();
            console.log('Properties panel created');
            this.createControls();
            console.log('Controls created');
            
            // Create documentation panel
            this.documentation = new PhysicsDocumentation(circuitsDocumentation);
            const docPanel = this.documentation.createPanel();
            document.body.appendChild(docPanel);
            window.currentDocumentation = this.documentation;
            
            // Setup mouse interaction
            this.setupMouseInteraction();

            // Store resize handler for cleanup
            this.resizeHandler = () => this.handleResize();
            window.addEventListener('resize', this.resizeHandler);
            this.animate();
        } catch (error) {
            console.error('Error initializing VirtualChipScene:', error);
            throw error;
        }
    }

    createCircuitCanvas() {
        // Remove existing canvas if it exists
        const existing = document.getElementById('circuit-canvas');
        if (existing) {
            existing.remove();
        }
        
        // Create 2D canvas overlay for circuit drawing
        this.circuitCanvas = document.createElement('canvas');
        this.circuitCanvas.id = 'circuit-canvas';
        this.circuitCanvas.style.cssText = `
            position: fixed;
            top: 60px;
            left: 280px;
            right: 300px;
            bottom: 60px;
            background: white;
            border: 2px solid #0066cc;
            cursor: crosshair;
            z-index: 100;
        `;
        this.circuitCanvas.width = window.innerWidth - 580;
        this.circuitCanvas.height = window.innerHeight - 120;
        this.circuitCtx = this.circuitCanvas.getContext('2d');
        document.body.appendChild(this.circuitCanvas);
        
        // Draw grid
        this.drawGrid();
    }

    drawGrid() {
        const ctx = this.circuitCtx;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < this.circuitCanvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.circuitCanvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < this.circuitCanvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.circuitCanvas.width, y);
            ctx.stroke();
        }
    }

    createComponentPalette() {
        // Remove existing palette if it exists
        const existing = document.getElementById('component-palette');
        if (existing) {
            existing.remove();
        }
        
        const palette = document.createElement('div');
        palette.id = 'component-palette';
        palette.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            width: 260px;
            bottom: 60px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
        `;

        const title = document.createElement('div');
        title.textContent = 'Component Library';
        title.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 15px; color: #0066cc;';
        palette.appendChild(title);

        // Analog components section
        const analogSection = document.createElement('div');
        analogSection.style.cssText = 'margin-bottom: 20px;';
        const analogTitle = document.createElement('div');
        analogTitle.textContent = 'Analog Components';
        analogTitle.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #333;';
        analogSection.appendChild(analogTitle);
        
        const analogComponents = ['resistor', 'capacitor', 'inductor', 'diode', 'voltageSource', 'ground'];
        analogComponents.forEach(compType => {
            const btn = this.createComponentButton(compType);
            analogSection.appendChild(btn);
        });
        palette.appendChild(analogSection);

        // Digital components section
        const digitalSection = document.createElement('div');
        const digitalTitle = document.createElement('div');
        digitalTitle.textContent = 'Digital Components';
        digitalTitle.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #333;';
        digitalSection.appendChild(digitalTitle);
        
        const digitalComponents = ['andGate', 'orGate', 'notGate', 'nandGate', 'norGate', 'xorGate', 'led'];
        digitalComponents.forEach(compType => {
            const btn = this.createComponentButton(compType);
            digitalSection.appendChild(btn);
        });
        palette.appendChild(digitalSection);

        document.body.appendChild(palette);
    }

    createComponentButton(compType) {
        const compData = this.componentTypes[compType];
        const btn = document.createElement('button');
        btn.textContent = compData.name;
        btn.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-bottom: 8px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            text-align: left;
        `;
        btn.onmouseover = () => btn.style.background = '#0052a3';
        btn.onmouseout = () => btn.style.background = '#0066cc';
        btn.addEventListener('click', () => {
            this.selectedComponentType = compType;
            this.circuitCanvas.style.cursor = 'crosshair';
        });
        return btn;
    }

    createPropertiesPanel() {
        const panel = document.createElement('div');
        panel.id = 'properties-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 280px;
            bottom: 60px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
        `;

        const title = document.createElement('div');
        title.textContent = 'Properties';
        title.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 15px; color: #0066cc;';
        panel.appendChild(title);

        this.propertiesContent = document.createElement('div');
        this.propertiesContent.id = 'properties-content';
        panel.appendChild(this.propertiesContent);

        // Remove existing panel if it exists
        const existing = document.getElementById('properties-panel');
        if (existing) {
            existing.remove();
        }
        
        document.body.appendChild(panel);
    }

    createControls() {
        // Remove existing controls if they exist
        const existing = document.getElementById('circuit-controls');
        if (existing) {
            existing.remove();
        }
        
        const controls = document.createElement('div');
        controls.id = 'circuit-controls';
        controls.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 20px;
            border-radius: 5px;
            border: 2px solid #0066cc;
            z-index: 1000;
            display: flex;
            gap: 10px;
        `;

        const playBtn = document.createElement('button');
        playBtn.textContent = '▶ Simulate';
        playBtn.style.cssText = 'padding: 8px 15px; background: #00cc66; color: white; border: none; border-radius: 3px; cursor: pointer;';
        playBtn.addEventListener('click', () => this.toggleSimulation());
        controls.appendChild(playBtn);

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.cssText = 'padding: 8px 15px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer;';
        resetBtn.addEventListener('click', () => this.resetCircuit());
        controls.appendChild(resetBtn);

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear All';
        clearBtn.style.cssText = 'padding: 8px 15px; background: #ffa500; color: white; border: none; border-radius: 3px; cursor: pointer;';
        clearBtn.addEventListener('click', () => this.clearAll());
        controls.appendChild(clearBtn);

        const viewToggleBtn = document.createElement('button');
        viewToggleBtn.textContent = 'Switch to Schematic';
        viewToggleBtn.style.cssText = 'padding: 8px 15px; background: #9b59b6; color: white; border: none; border-radius: 3px; cursor: pointer;';
        viewToggleBtn.addEventListener('click', () => this.toggleViewMode());
        controls.appendChild(viewToggleBtn);

        const docBtn = document.createElement('button');
        docBtn.textContent = '📚 Documentation';
        docBtn.style.cssText = 'padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer;';
        docBtn.addEventListener('click', () => {
            if (this.documentation) {
                this.documentation.toggle();
                docBtn.textContent = this.documentation.isVisible ? '📚 Hide Docs' : '📚 Documentation';
            }
        });
        controls.appendChild(docBtn);

        this.viewToggleBtn = viewToggleBtn;
        document.body.appendChild(controls);
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'circuit' ? 'schematic' : 'circuit';
        this.viewToggleBtn.textContent = this.viewMode === 'circuit' ? 'Switch to Schematic' : 'Switch to Circuit';
        this.drawCircuit();
    }

    setupMouseInteraction() {
        // Store handlers for cleanup
        this.mouseDownHandler = (e) => {
            const rect = this.circuitCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.selectedComponentType) {
                // Place component
                this.placeComponent(this.selectedComponentType, x, y);
                this.selectedComponentType = null;
                this.circuitCanvas.style.cursor = 'default';
            } else if (this.isPlacingWire && this.wireStartPin) {
                // Complete wire connection
                const clicked = this.findComponentAt(x, y);
                if (clicked.component && clicked.pin !== null) {
                    const startComp = this.wireStartPin.component;
                    const startPinIdx = this.wireStartPin.pinIndex;
                    const endComp = clicked.component;
                    const endPinIdx = clicked.pin;
                    
                    // Don't connect pin to itself
                    if (startComp !== endComp || startPinIdx !== endPinIdx) {
                        this.wires.push({
                            from: { component: startComp, pinIndex: startPinIdx },
                            to: { component: endComp, pinIndex: endPinIdx }
                        });
                    }
                }
                this.isPlacingWire = false;
                this.wireStartPin = null;
                this.drawCircuit();
            } else {
                // Check if clicking on component or pin
                const clicked = this.findComponentAt(x, y);
                if (clicked.component) {
                    if (clicked.pin !== null) {
                        // Start wire connection
                        this.startWireConnection(clicked.component, clicked.pin);
                    } else {
                        // Select component
                        this.selectComponent(clicked.component);
                    }
                } else {
                    this.selectComponent(null);
                    // Cancel wire placement if clicking empty space
                    if (this.isPlacingWire) {
                        this.isPlacingWire = false;
                        this.wireStartPin = null;
                        this.drawCircuit();
                    }
                }
            }
        };
        
        this.mouseMoveHandler = (e) => {
            const rect = this.circuitCanvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
            this.updateWirePreview();
        };
        
        this.contextMenuHandler = (e) => {
            e.preventDefault();
            const rect = this.circuitCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const clicked = this.findComponentAt(x, y);
            if (clicked.component) {
                this.deleteComponent(clicked.component);
            }
        };
        
        // Attach event listeners
        this.circuitCanvas.addEventListener('mousedown', this.mouseDownHandler);
        this.circuitCanvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.circuitCanvas.addEventListener('contextmenu', this.contextMenuHandler);
    }

    placeComponent(type, x, y) {
        const compData = this.componentTypes[type];
        const comp = {
            id: Date.now() + Math.random(),
            type: type,
            name: compData.name,
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize,
            value: compData.defaultValue,
            pins: [],
            rotation: 0
        };

        // Create pins based on component type
        if (compData.pins === 1) {
            comp.pins.push({ x: comp.x, y: comp.y, connections: [] });
        } else if (compData.pins === 2) {
            comp.pins.push({ x: comp.x - 20, y: comp.y, connections: [] });
            comp.pins.push({ x: comp.x + 20, y: comp.y, connections: [] });
        } else if (compData.pins === 3) {
            // For gates: 2 inputs, 1 output
            comp.pins.push({ x: comp.x - 20, y: comp.y - 15, connections: [], type: 'input' });
            comp.pins.push({ x: comp.x - 20, y: comp.y + 15, connections: [], type: 'input' });
            comp.pins.push({ x: comp.x + 20, y: comp.y, connections: [], type: 'output' });
        }

        this.components.push(comp);
        this.drawCircuit();
    }

    findComponentAt(x, y) {
        for (const comp of this.components) {
            // Check if clicking on component body
            const compData = this.componentTypes[comp.type];
            const width = compData.type === 'digital' ? 40 : 40;
            const height = compData.type === 'digital' ? 40 : 20;
            
            if (x >= comp.x - width/2 && x <= comp.x + width/2 &&
                y >= comp.y - height/2 && y <= comp.y + height/2) {
                // Check if clicking on a pin
                for (let i = 0; i < comp.pins.length; i++) {
                    const pin = comp.pins[i];
                    const dist = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
                    if (dist < 8) {
                        return { component: comp, pin: i };
                    }
                }
                return { component: comp, pin: null };
            }
        }
        return { component: null, pin: null };
    }

    startWireConnection(component, pinIndex) {
        this.wireStartPin = { component, pinIndex };
        this.isPlacingWire = true;
    }

    updateWirePreview() {
        if (this.isPlacingWire && this.wireStartPin) {
            this.drawCircuit();
            const startPin = this.wireStartPin.component.pins[this.wireStartPin.pinIndex];
            this.circuitCtx.strokeStyle = '#0066cc';
            this.circuitCtx.lineWidth = 2;
            this.circuitCtx.setLineDash([5, 5]);
            this.circuitCtx.beginPath();
            this.circuitCtx.moveTo(startPin.x, startPin.y);
            this.circuitCtx.lineTo(this.mousePos.x, this.mousePos.y);
            this.circuitCtx.stroke();
            this.circuitCtx.setLineDash([]);
        }
    }

    selectComponent(component) {
        this.selectedComponent = component;
        this.updatePropertiesPanel();
    }

    updatePropertiesPanel() {
        const content = this.propertiesContent;
        content.innerHTML = '';
        
        if (!this.selectedComponent) {
            content.innerHTML = '<div style="color: #666;">Select a component to edit properties</div>';
            return;
        }

        const comp = this.selectedComponent;
        const compData = this.componentTypes[comp.type];

        // Component name
        const nameDiv = document.createElement('div');
        nameDiv.textContent = comp.name;
        nameDiv.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px;';
        content.appendChild(nameDiv);

        // Value editor (if applicable)
        if (compData.defaultValue !== null) {
            const valueLabel = document.createElement('div');
            valueLabel.textContent = `Value (${compData.unit}):`;
            valueLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px; font-size: 12px;';
            content.appendChild(valueLabel);

            const valueInput = document.createElement('input');
            valueInput.type = 'number';
            valueInput.value = comp.value;
            valueInput.step = comp.value < 1 ? '0.000001' : '1';
            valueInput.style.cssText = 'width: 100%; padding: 5px; margin-bottom: 10px;';
            valueInput.addEventListener('input', (e) => {
                comp.value = parseFloat(e.target.value) || 0;
                this.drawCircuit();
            });
            content.appendChild(valueInput);
        }

        // Position info
        const posDiv = document.createElement('div');
        posDiv.textContent = `Position: (${comp.x}, ${comp.y})`;
        posDiv.style.cssText = 'margin-top: 10px; font-size: 11px; color: #666;';
        content.appendChild(posDiv);
    }

    deleteComponent(component) {
        // Remove all wires connected to this component
        this.wires = this.wires.filter(wire => 
            wire.from.component !== component && wire.to.component !== component
        );
        
        // Remove component
        this.components = this.components.filter(c => c !== component);
        
        if (this.selectedComponent === component) {
            this.selectedComponent = null;
            this.updatePropertiesPanel();
        }
        
        this.drawCircuit();
    }

    drawCircuit() {
        // Clear canvas
        this.circuitCtx.clearRect(0, 0, this.circuitCanvas.width, this.circuitCanvas.height);
        
        // Redraw grid
        this.drawGrid();
        
        // Draw wires
        this.wires.forEach(wire => {
            const fromPin = wire.from.component.pins[wire.from.pinIndex];
            const toPin = wire.to.component.pins[wire.to.pinIndex];
            
            this.circuitCtx.strokeStyle = wire.voltage !== undefined ? this.getVoltageColor(wire.voltage) : '#333';
            this.circuitCtx.lineWidth = 2;
            this.circuitCtx.beginPath();
            this.circuitCtx.moveTo(fromPin.x, fromPin.y);
            this.circuitCtx.lineTo(toPin.x, toPin.y);
            this.circuitCtx.stroke();
        });
        
        // Draw components based on view mode
        this.components.forEach(comp => {
            if (this.viewMode === 'schematic') {
                this.drawComponentSchematic(comp);
            } else {
                this.drawComponent(comp);
            }
        });
        
        // Draw wire preview
        this.updateWirePreview();
    }

    drawComponent(comp) {
        const compData = this.componentTypes[comp.type];
        const ctx = this.circuitCtx;
        
        ctx.fillStyle = comp === this.selectedComponent ? '#ffd93d' : `#${compData.color.toString(16).padStart(6, '0')}`;
        ctx.strokeStyle = comp === this.selectedComponent ? '#ff6b6b' : '#333';
        ctx.lineWidth = comp === this.selectedComponent ? 3 : 2;
        
        if (compData.type === 'digital') {
            // Draw gate shape
            ctx.beginPath();
            ctx.moveTo(comp.x - 20, comp.y - 20);
            ctx.lineTo(comp.x + 20, comp.y);
            ctx.lineTo(comp.x - 20, comp.y + 20);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(compData.name.substring(0, 3).toUpperCase(), comp.x, comp.y + 4);
        } else {
            // Draw component body
            if (comp.type === 'resistor') {
                // Zigzag for resistor
                ctx.beginPath();
                ctx.moveTo(comp.x - 20, comp.y);
                ctx.lineTo(comp.x - 10, comp.y - 10);
                ctx.lineTo(comp.x, comp.y);
                ctx.lineTo(comp.x + 10, comp.y + 10);
                ctx.lineTo(comp.x + 20, comp.y);
                ctx.stroke();
            } else if (comp.type === 'capacitor') {
                // Two parallel lines
                ctx.beginPath();
                ctx.moveTo(comp.x - 20, comp.y);
                ctx.lineTo(comp.x - 5, comp.y);
                ctx.moveTo(comp.x + 5, comp.y);
                ctx.lineTo(comp.x + 20, comp.y);
                ctx.moveTo(comp.x - 5, comp.y - 10);
                ctx.lineTo(comp.x - 5, comp.y + 10);
                ctx.moveTo(comp.x + 5, comp.y - 10);
                ctx.lineTo(comp.x + 5, comp.y + 10);
                ctx.stroke();
            } else if (comp.type === 'voltageSource') {
                // Circle with + and -
                ctx.beginPath();
                ctx.arc(comp.x, comp.y, 15, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = '#333';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+', comp.x, comp.y + 5);
            } else if (comp.type === 'ground') {
                // Ground symbol
                ctx.beginPath();
                ctx.moveTo(comp.x, comp.y);
                ctx.lineTo(comp.x - 10, comp.y + 10);
                ctx.lineTo(comp.x + 10, comp.y + 10);
                ctx.moveTo(comp.x - 7, comp.y + 15);
                ctx.lineTo(comp.x + 7, comp.y + 15);
                ctx.moveTo(comp.x - 4, comp.y + 18);
                ctx.lineTo(comp.x + 4, comp.y + 18);
                ctx.stroke();
            } else {
                // Default rectangle
                ctx.fillRect(comp.x - 20, comp.y - 10, 40, 20);
            }
        }
        
        // Draw pins
        ctx.fillStyle = '#333';
        comp.pins.forEach(pin => {
            ctx.beginPath();
            ctx.arc(pin.x, pin.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw value label
        if (compData.defaultValue !== null && comp.value !== undefined) {
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const valueText = comp.value < 0.001 ? comp.value.toExponential(2) : comp.value.toString();
            ctx.fillText(valueText + compData.unit, comp.x, comp.y + (compData.type === 'digital' ? 35 : 25));
        }
    }

    drawComponentSchematic(comp) {
        const compData = this.componentTypes[comp.type];
        const ctx = this.circuitCtx;
        
        ctx.strokeStyle = comp === this.selectedComponent ? '#ff6b6b' : '#000';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = comp === this.selectedComponent ? 3 : 2;
        
        // Draw standard electrical symbols
        if (comp.type === 'resistor') {
            // Zigzag resistor symbol
            ctx.beginPath();
            ctx.moveTo(comp.x - 30, comp.y);
            for (let i = 0; i < 5; i++) {
                const x = comp.x - 30 + (i * 12);
                const y = comp.y + (i % 2 === 0 ? -8 : 8);
                ctx.lineTo(x, y);
            }
            ctx.lineTo(comp.x + 30, comp.y);
            ctx.stroke();
        } else if (comp.type === 'capacitor') {
            // Two parallel lines
            ctx.beginPath();
            ctx.moveTo(comp.x - 30, comp.y);
            ctx.lineTo(comp.x - 10, comp.y);
            ctx.moveTo(comp.x + 10, comp.y);
            ctx.lineTo(comp.x + 30, comp.y);
            ctx.moveTo(comp.x - 10, comp.y - 15);
            ctx.lineTo(comp.x - 10, comp.y + 15);
            ctx.moveTo(comp.x + 10, comp.y - 15);
            ctx.lineTo(comp.x + 10, comp.y + 15);
            ctx.stroke();
        } else if (comp.type === 'inductor') {
            // Curved inductor symbol
            ctx.beginPath();
            ctx.moveTo(comp.x - 30, comp.y);
            ctx.lineTo(comp.x - 20, comp.y);
            for (let i = 0; i < 3; i++) {
                const x = comp.x - 15 + (i * 10);
                ctx.arc(x, comp.y, 5, Math.PI, 0, false);
            }
            ctx.moveTo(comp.x + 15, comp.y);
            ctx.lineTo(comp.x + 30, comp.y);
            ctx.stroke();
        } else if (comp.type === 'diode') {
            // Triangle + line diode symbol
            ctx.beginPath();
            ctx.moveTo(comp.x - 20, comp.y);
            ctx.lineTo(comp.x, comp.y - 15);
            ctx.lineTo(comp.x, comp.y + 15);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(comp.x, comp.y - 15);
            ctx.lineTo(comp.x + 20, comp.y);
            ctx.lineTo(comp.x, comp.y + 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(comp.x + 20, comp.y);
            ctx.lineTo(comp.x + 30, comp.y);
            ctx.stroke();
        } else if (comp.type === 'voltageSource') {
            // Circle with + and -
            ctx.beginPath();
            ctx.arc(comp.x, comp.y, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', comp.x - 8, comp.y + 5);
            ctx.fillText('-', comp.x + 8, comp.y + 5);
        } else if (comp.type === 'ground') {
            // Ground symbol (three horizontal lines)
            ctx.beginPath();
            ctx.moveTo(comp.x, comp.y);
            ctx.lineTo(comp.x, comp.y + 10);
            ctx.moveTo(comp.x - 10, comp.y + 10);
            ctx.lineTo(comp.x + 10, comp.y + 10);
            ctx.moveTo(comp.x - 7, comp.y + 15);
            ctx.lineTo(comp.x + 7, comp.y + 15);
            ctx.moveTo(comp.x - 4, comp.y + 18);
            ctx.lineTo(comp.x + 4, comp.y + 18);
            ctx.stroke();
        } else if (compData.type === 'digital') {
            // Draw gate symbol
            ctx.beginPath();
            ctx.moveTo(comp.x - 25, comp.y - 20);
            ctx.lineTo(comp.x + 25, comp.y);
            ctx.lineTo(comp.x - 25, comp.y + 20);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fill();
            
            // Gate label
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            const label = compData.name.substring(0, comp.type === 'notGate' ? 3 : 3).toUpperCase();
            ctx.fillText(label, comp.x, comp.y + 5);
        }
        
        // Draw pins
        ctx.fillStyle = '#000';
        comp.pins.forEach(pin => {
            ctx.beginPath();
            ctx.arc(pin.x, pin.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw value label
        if (compData.defaultValue !== null && comp.value !== undefined) {
            ctx.fillStyle = '#333';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            const valueText = comp.value < 0.001 ? comp.value.toExponential(2) : comp.value.toString();
            ctx.fillText(valueText + compData.unit, comp.x, comp.y + (compData.type === 'digital' ? 40 : 30));
        }
    }

    getVoltageColor(voltage) {
        // Color code wires by voltage (red = positive, blue = negative, gray = ground)
        if (voltage === 0) return '#888';
        const normalized = Math.min(Math.abs(voltage) / 5, 1);
        if (voltage > 0) {
            return `rgb(${255}, ${255 - normalized * 255}, ${255 - normalized * 255})`;
        } else {
            return `rgb(${255 - normalized * 255}, ${255 - normalized * 255}, 255)`;
        }
    }

    toggleSimulation() {
        this.isSimulating = !this.isSimulating;
        if (this.isSimulating) {
            this.simulateCircuit();
        }
        this.drawCircuit();
    }

    simulateCircuit() {
        // Basic DC circuit simulation using nodal analysis
        // For now, simple voltage propagation for digital circuits
        if (!this.isSimulating) return;
        
        // Reset node voltages
        this.nodeVoltages.clear();
        
        // Find voltage sources and set their voltages
        this.components.forEach(comp => {
            if (comp.type === 'voltageSource') {
                const pin = comp.pins[0];
                const nodeKey = `${pin.x},${pin.y}`;
                this.nodeVoltages.set(nodeKey, comp.value);
            } else if (comp.type === 'ground') {
                const pin = comp.pins[0];
                const nodeKey = `${pin.x},${pin.y}`;
                this.nodeVoltages.set(nodeKey, 0);
            }
        });
        
        // Propagate voltages through wires (simplified)
        this.wires.forEach(wire => {
            const fromPin = wire.from.component.pins[wire.from.pinIndex];
            const toPin = wire.to.component.pins[wire.to.pinIndex];
            const fromKey = `${fromPin.x},${fromPin.y}`;
            const toKey = `${toPin.x},${toPin.y}`;
            
            if (this.nodeVoltages.has(fromKey)) {
                wire.voltage = this.nodeVoltages.get(fromKey);
                this.nodeVoltages.set(toKey, wire.voltage);
            }
        });
        
        // Simulate digital gates
        this.components.forEach(comp => {
            if (this.componentTypes[comp.type].type === 'digital') {
                this.simulateGate(comp);
            }
        });
    }

    simulateGate(comp) {
        const compData = this.componentTypes[comp.type];
        if (comp.pins.length < 3) return; // Need inputs and output
        
        const input1Pin = comp.pins[0];
        const input2Pin = comp.pins[1];
        const outputPin = comp.pins[2];
        
        const input1Key = `${input1Pin.x},${input1Pin.y}`;
        const input2Key = `${input2Pin.x},${input2Pin.y}`;
        const outputKey = `${outputPin.x},${outputPin.y}`;
        
        const input1 = this.nodeVoltages.get(input1Key) || 0;
        const input2 = this.nodeVoltages.get(input2Key) || 0;
        const input1High = input1 > 2.5;
        const input2High = input2 > 2.5;
        
        let output = 0;
        switch (comp.type) {
            case 'andGate':
                output = (input1High && input2High) ? 5 : 0;
                break;
            case 'orGate':
                output = (input1High || input2High) ? 5 : 0;
                break;
            case 'nandGate':
                output = !(input1High && input2High) ? 5 : 0;
                break;
            case 'norGate':
                output = !(input1High || input2High) ? 5 : 0;
                break;
            case 'xorGate':
                output = (input1High !== input2High) ? 5 : 0;
                break;
            case 'notGate':
                const inputPin = comp.pins[0];
                const inputKey = `${inputPin.x},${inputPin.y}`;
                const input = this.nodeVoltages.get(inputKey) || 0;
                output = input > 2.5 ? 0 : 5;
                break;
        }
        
        this.nodeVoltages.set(outputKey, output);
        
        // Update wire voltages
        this.wires.forEach(wire => {
            if (wire.to.component === comp && wire.to.pinIndex === 2) {
                wire.voltage = output;
            }
        });
    }

    resetCircuit() {
        this.isSimulating = false;
        this.nodeVoltages.clear();
        this.wires.forEach(wire => delete wire.voltage);
        this.drawCircuit();
    }

    clearAll() {
        this.components = [];
        this.wires = [];
        this.selectedComponent = null;
        this.isSimulating = false;
        this.nodeVoltages.clear();
        this.updatePropertiesPanel();
        this.drawCircuit();
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        // Resize circuit canvas
        if (this.circuitCanvas) {
            this.circuitCanvas.width = width - 580;
            this.circuitCanvas.height = height - 120;
            this.circuitCanvas.style.width = (width - 580) + 'px';
            this.circuitCanvas.style.height = (height - 120) + 'px';
            this.drawCircuit();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isSimulating) {
            this.simulateCircuit();
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Remove mouse event listeners
        if (this.circuitCanvas) {
            if (this.mouseDownHandler) {
                this.circuitCanvas.removeEventListener('mousedown', this.mouseDownHandler);
            }
            if (this.mouseMoveHandler) {
                this.circuitCanvas.removeEventListener('mousemove', this.mouseMoveHandler);
            }
            if (this.contextMenuHandler) {
                this.circuitCanvas.removeEventListener('contextmenu', this.contextMenuHandler);
            }
        }
        
        // Dispose documentation
        if (this.documentation) {
            this.documentation.dispose();
        }
        
        // Remove UI elements
        const palette = document.getElementById('component-palette');
        if (palette) palette.remove();
        
        const panel = document.getElementById('properties-panel');
        if (panel) panel.remove();
        
        const controls = document.getElementById('circuit-controls');
        if (controls) controls.remove();
        
        if (this.circuitCanvas) {
            this.circuitCanvas.remove();
        }
        
        // Clean up Three.js resources
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

