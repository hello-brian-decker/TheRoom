/**
 * BoardElectricalScene - Computer Board Electrical Diagrams
 * 
 * Professional, modern, and educational page showcasing how electricity flows
 * through computer boards like Raspberry Pi, Arduino, and ESP32
 */

import * as THREE from 'three';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { boardElectricalDocumentation } from '../docs/boardElectrical.js';
import { raspberryPi4Data } from '../data/boards/raspberryPi4.js';
import { arduinoUnoData } from '../data/boards/arduinoUno.js';
import { esp32Data } from '../data/boards/esp32.js';

export class BoardElectricalScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        
        // Board data
        this.boards = {
            'raspberry-pi': raspberryPi4Data,
            'arduino': arduinoUnoData,
            'esp32': esp32Data
        };
        this.currentBoard = 'raspberry-pi';
        this.boardData = this.boards[this.currentBoard];
        
        // View modes: 'physical', 'schematic', 'layers'
        this.viewMode = 'physical';
        this.activeLayer = 'power'; // 'power', 'ground', 'signals'
        
        // Interaction state
        this.selectedComponent = null;
        this.hoveredComponent = null;
        this.selectedSignal = null;
        this.isSimulating = false;
        this.signalAnimations = [];
        
        // GPIO state
        this.gpioStates = new Map();
        
        // Zoom and pan
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.documentation = null;
    }

    async init() {
        try {
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

            // Create board canvas
            this.createBoardCanvas();
            
            // Create UI
            this.createControls();
            this.createSidebars();
            this.createEducationalPanel();
            
            // Create documentation
            this.documentation = new PhysicsDocumentation(boardElectricalDocumentation);
            const docPanel = this.documentation.createPanel();
            document.body.appendChild(docPanel);
            window.currentDocumentation = this.documentation;
            
            // Setup interactions
            this.setupInteractions();
            
            // Initial render
            this.updateComponentList();
            this.updateSignalList();
            this.updateGpioControls();
            this.drawBoard();

            // Store resize handler for cleanup
            this.resizeHandler = () => this.handleResize();
            window.addEventListener('resize', this.resizeHandler);
            this.animate();
        } catch (error) {
            console.error('Error initializing BoardElectricalScene:', error);
            throw error;
        }
    }

    createBoardCanvas() {
        // Remove existing canvas if it exists
        const existing = document.getElementById('board-canvas');
        if (existing) {
            existing.remove();
        }
        
        this.boardCanvas = document.createElement('canvas');
        this.boardCanvas.id = 'board-canvas';
        this.boardCanvas.style.cssText = `
            position: fixed;
            top: 100px;
            left: 300px;
            right: 350px;
            bottom: 200px;
            background: #ffffff;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: grab;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;
        this.boardCanvas.width = window.innerWidth - 650;
        this.boardCanvas.height = window.innerHeight - 300;
        this.boardCtx = this.boardCanvas.getContext('2d');
        document.body.appendChild(this.boardCanvas);
    }

    createControls() {
        // Remove existing controls if they exist
        const existing = document.getElementById('board-controls');
        if (existing) {
            existing.remove();
        }
        
        const controls = document.createElement('div');
        controls.id = 'board-controls';
        controls.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.98);
            padding: 12px 20px;
            border-radius: 8px;
            border: 2px solid #0066cc;
            z-index: 1000;
            display: flex;
            gap: 15px;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // Board selector
        const boardLabel = document.createElement('span');
        boardLabel.textContent = 'Board:';
        boardLabel.style.cssText = 'font-weight: bold; color: #333;';
        controls.appendChild(boardLabel);

        const boardSelect = document.createElement('select');
        boardSelect.style.cssText = 'padding: 6px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;';
        boardSelect.innerHTML = `
            <option value="raspberry-pi">Raspberry Pi 4</option>
            <option value="arduino">Arduino Uno</option>
            <option value="esp32">ESP32 DevKit</option>
        `;
        boardSelect.value = this.currentBoard;
        boardSelect.addEventListener('change', (e) => {
            this.currentBoard = e.target.value;
            this.boardData = this.boards[this.currentBoard];
            this.resetView();
            this.drawBoard();
        });
        controls.appendChild(boardSelect);

        // View mode buttons
        const viewModes = [
            { mode: 'physical', label: 'Physical Board', icon: '🔲' },
            { mode: 'schematic', label: 'Schematic', icon: '📐' },
            { mode: 'layers', label: 'Layers', icon: '📚' }
        ];

        viewModes.forEach(vm => {
            const btn = document.createElement('button');
            btn.textContent = `${vm.icon} ${vm.label}`;
            btn.style.cssText = `
                padding: 8px 15px;
                background: ${this.viewMode === vm.mode ? '#0066cc' : '#f0f0f0'};
                color: ${this.viewMode === vm.mode ? 'white' : '#333'};
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            `;
            btn.onmouseover = () => {
                if (this.viewMode !== vm.mode) btn.style.background = '#e0e0e0';
            };
            btn.onmouseout = () => {
                if (this.viewMode !== vm.mode) btn.style.background = '#f0f0f0';
            };
            btn.addEventListener('click', () => {
                this.viewMode = vm.mode;
                viewModes.forEach(v => {
                    const b = controls.querySelector(`button[data-mode="${v.mode}"]`);
                    if (b) {
                        b.style.background = '#f0f0f0';
                        b.style.color = '#333';
                    }
                });
                btn.style.background = '#0066cc';
                btn.style.color = 'white';
                this.drawBoard();
            });
            btn.setAttribute('data-mode', vm.mode);
            controls.appendChild(btn);
        });

        // Documentation button
        const docBtn = document.createElement('button');
        docBtn.textContent = '📚 Documentation';
        docBtn.style.cssText = 'padding: 8px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;';
        docBtn.addEventListener('click', () => {
            if (this.documentation) {
                this.documentation.toggle();
                docBtn.textContent = this.documentation.isVisible ? '📚 Hide Docs' : '📚 Documentation';
            }
        });
        controls.appendChild(docBtn);

        document.body.appendChild(controls);
    }

    createSidebars() {
        // Remove existing sidebars if they exist
        const existingLeft = document.getElementById('board-left-sidebar');
        if (existingLeft) {
            existingLeft.remove();
        }
        const existingRight = document.getElementById('board-right-sidebar');
        if (existingRight) {
            existingRight.remove();
        }
        
        // Left sidebar - Component list and signal selector
        const leftSidebar = document.createElement('div');
        leftSidebar.id = 'board-left-sidebar';
        leftSidebar.style.cssText = `
            position: fixed;
            top: 100px;
            left: 10px;
            width: 280px;
            bottom: 200px;
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;

        const componentsTitle = document.createElement('div');
        componentsTitle.textContent = 'Components';
        componentsTitle.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 15px; color: #0066cc;';
        leftSidebar.appendChild(componentsTitle);

        this.componentList = document.createElement('div');
        this.componentList.id = 'component-list';
        leftSidebar.appendChild(this.componentList);

        const signalsTitle = document.createElement('div');
        signalsTitle.textContent = 'Signals';
        signalsTitle.style.cssText = 'font-weight: bold; font-size: 16px; margin-top: 20px; margin-bottom: 15px; color: #0066cc;';
        leftSidebar.appendChild(signalsTitle);

        this.signalList = document.createElement('div');
        this.signalList.id = 'signal-list';
        leftSidebar.appendChild(this.signalList);

        // Layer toggle (for layer view)
        const layerToggle = document.createElement('div');
        layerToggle.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;';
        const layerTitle = document.createElement('div');
        layerTitle.textContent = 'Active Layer';
        layerTitle.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0066cc;';
        layerToggle.appendChild(layerTitle);
        
        const layers = ['power', 'ground', 'signals'];
        layers.forEach(layer => {
            const btn = document.createElement('button');
            btn.textContent = layer.charAt(0).toUpperCase() + layer.slice(1);
            btn.style.cssText = `
                width: 100%;
                padding: 8px;
                margin-bottom: 5px;
                background: ${this.activeLayer === layer ? '#0066cc' : '#f0f0f0'};
                color: ${this.activeLayer === layer ? 'white' : '#333'};
                border: 1px solid #ddd;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            `;
            btn.addEventListener('click', () => {
                this.activeLayer = layer;
                layers.forEach(l => {
                    const b = layerToggle.querySelector(`button[data-layer="${l}"]`);
                    if (b) {
                        b.style.background = '#f0f0f0';
                        b.style.color = '#333';
                    }
                });
                btn.style.background = '#0066cc';
                btn.style.color = 'white';
                this.drawBoard();
            });
            btn.setAttribute('data-layer', layer);
            layerToggle.appendChild(btn);
        });
        leftSidebar.appendChild(layerToggle);

        document.body.appendChild(leftSidebar);

        // Right sidebar - Component details and GPIO controls
        const rightSidebar = document.createElement('div');
        rightSidebar.id = 'board-right-sidebar';
        rightSidebar.style.cssText = `
            position: fixed;
            top: 100px;
            right: 10px;
            width: 330px;
            bottom: 200px;
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;

        this.detailsPanel = document.createElement('div');
        this.detailsPanel.id = 'component-details';
        this.detailsPanel.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Select a component to see details</div>';
        rightSidebar.appendChild(this.detailsPanel);

        // GPIO Controls (if board has GPIO)
        this.gpioPanel = document.createElement('div');
        this.gpioPanel.id = 'gpio-controls';
        this.gpioPanel.style.cssText = 'margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;';
        const gpioTitle = document.createElement('div');
        gpioTitle.textContent = 'GPIO Controls';
        gpioTitle.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0066cc;';
        this.gpioPanel.appendChild(gpioTitle);
        rightSidebar.appendChild(this.gpioPanel);

        document.body.appendChild(rightSidebar);
    }

    createEducationalPanel() {
        // Remove existing panel if it exists
        const existing = document.getElementById('board-education');
        if (existing) {
            existing.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'board-education';
        panel.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 300px;
            right: 350px;
            height: 180px;
            background: rgba(255, 255, 255, 0.98);
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;

        const title = document.createElement('div');
        title.textContent = '💡 Educational Information';
        title.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #0066cc;';
        panel.appendChild(title);

        this.educationContent = document.createElement('div');
        this.educationContent.id = 'education-content';
        this.educationContent.style.cssText = 'font-size: 13px; line-height: 1.6; color: #333;';
        panel.appendChild(this.educationContent);

        document.body.appendChild(panel);
        this.updateEducationContent();
    }

    setupInteractions() {
        // Store handlers for cleanup
        this.mouseDownHandler = (e) => {
            const rect = this.boardCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panX) / this.zoom;
            const y = (e.clientY - rect.top - this.panY) / this.zoom;
            
            const clicked = this.findComponentAt(x, y);
            if (clicked) {
                this.selectComponent(clicked);
            } else {
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.boardCanvas.style.cursor = 'grabbing';
            }
        };
        
        this.mouseMoveHandler = (e) => {
            const rect = this.boardCanvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.panX) / this.zoom;
            const y = (e.clientY - rect.top - this.panY) / this.zoom;
            
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                this.panX += dx;
                this.panY += dy;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                this.drawBoard();
            } else {
                const hovered = this.findComponentAt(x, y);
                if (hovered !== this.hoveredComponent) {
                    this.hoveredComponent = hovered;
                    this.drawBoard();
                }
            }
        };
        
        this.mouseUpHandler = () => {
            this.isDragging = false;
            this.boardCanvas.style.cursor = 'grab';
        };
        
        this.wheelHandler = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(0.5, Math.min(3.0, this.zoom * delta));
            this.drawBoard();
        };
        
        // Attach event listeners
        this.boardCanvas.addEventListener('mousedown', this.mouseDownHandler);
        this.boardCanvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.boardCanvas.addEventListener('mouseup', this.mouseUpHandler);
        this.boardCanvas.addEventListener('wheel', this.wheelHandler);
    }

    findComponentAt(x, y) {
        for (const comp of this.boardData.components) {
            const px = comp.position.x * this.boardData.scale;
            const py = comp.position.y * this.boardData.scale;
            const w = comp.size.width * this.boardData.scale;
            const h = comp.size.height * this.boardData.scale;
            
            if (x >= px - w/2 && x <= px + w/2 &&
                y >= py - h/2 && y <= py + h/2) {
                return comp;
            }
        }
        return null;
    }

    selectComponent(component) {
        this.selectedComponent = component;
        this.updateComponentDetails();
        this.updateComponentList();
        this.drawBoard();
    }

    updateComponentList() {
        const list = this.componentList;
        list.innerHTML = '';
        
        this.boardData.components.forEach(comp => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 10px;
                margin-bottom: 8px;
                background: ${comp === this.selectedComponent ? '#e3f2fd' : '#f5f5f5'};
                border: 2px solid ${comp === this.selectedComponent ? '#0066cc' : '#ddd'};
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            `;
            item.onmouseover = () => {
                if (comp !== this.selectedComponent) {
                    item.style.background = '#f0f0f0';
                }
            };
            item.onmouseout = () => {
                if (comp !== this.selectedComponent) {
                    item.style.background = '#f5f5f5';
                }
            };
            item.addEventListener('click', () => this.selectComponent(comp));
            
            const name = document.createElement('div');
            name.textContent = comp.name;
            name.style.cssText = 'font-weight: bold; color: #333; margin-bottom: 4px;';
            item.appendChild(name);
            
            const type = document.createElement('div');
            type.textContent = comp.type;
            type.style.cssText = 'font-size: 12px; color: #666;';
            item.appendChild(type);
            
            list.appendChild(item);
        });
    }

    updateSignalList() {
        const list = this.signalList;
        list.innerHTML = '';
        
        if (!this.boardData.layers.signals) return;
        
        this.boardData.layers.signals.forEach((signal, idx) => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px;
                margin-bottom: 5px;
                background: ${signal === this.selectedSignal ? '#e8f5e9' : '#f5f5f5'};
                border: 1px solid ${signal === this.selectedSignal ? '#4caf50' : '#ddd'};
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            `;
            item.onmouseover = () => {
                if (signal !== this.selectedSignal) {
                    item.style.background = '#f0f0f0';
                }
            };
            item.onmouseout = () => {
                if (signal !== this.selectedSignal) {
                    item.style.background = '#f5f5f5';
                }
            };
            item.addEventListener('click', () => {
                this.selectedSignal = signal;
                this.updateSignalList();
                this.simulateSignal(signal);
            });
            
            const name = document.createElement('div');
            name.textContent = `${signal.bus} (${signal.type})`;
            name.style.cssText = 'font-weight: bold; color: #333;';
            item.appendChild(name);
            
            const route = document.createElement('div');
            route.textContent = `${signal.from} → ${signal.to}`;
            route.style.cssText = 'font-size: 11px; color: #666; margin-top: 2px;';
            item.appendChild(route);
            
            list.appendChild(item);
        });
    }

    updateGpioControls() {
        const panel = this.gpioPanel;
        panel.innerHTML = '';
        
        const gpioComp = this.boardData.components.find(c => 
            c.type === 'GPIO' || c.id === 'gpio' || c.id === 'digital-pins'
        );
        
        if (!gpioComp || !gpioComp.pinMapping) {
            const msg = document.createElement('div');
            msg.textContent = 'No GPIO pins available';
            msg.style.cssText = 'color: #666; font-size: 12px; text-align: center; padding: 10px;';
            panel.appendChild(msg);
            return;
        }
        
        const title = document.createElement('div');
        title.textContent = 'GPIO Controls';
        title.style.cssText = 'font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #0066cc;';
        panel.appendChild(title);
        
        // Show first 8 GPIO pins
        gpioComp.pinMapping.slice(0, 8).forEach(pin => {
            if (pin.type !== 'gpio') return;
            
            const pinDiv = document.createElement('div');
            pinDiv.style.cssText = 'margin-bottom: 10px; padding: 8px; background: #f9f9f9; border-radius: 4px;';
            
            const pinLabel = document.createElement('div');
            pinLabel.textContent = `${pin.name}${pin.function ? ` (${pin.function})` : ''}`;
            pinLabel.style.cssText = 'font-weight: bold; font-size: 12px; margin-bottom: 5px;';
            pinDiv.appendChild(pinLabel);
            
            const controls = document.createElement('div');
            controls.style.cssText = 'display: flex; gap: 5px;';
            
            const highBtn = document.createElement('button');
            highBtn.textContent = 'HIGH';
            highBtn.style.cssText = 'flex: 1; padding: 5px; background: #4caf50; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;';
            highBtn.addEventListener('click', () => {
                this.setGpioPin(pin.pin, 1);
                this.drawBoard();
            });
            controls.appendChild(highBtn);
            
            const lowBtn = document.createElement('button');
            lowBtn.textContent = 'LOW';
            lowBtn.style.cssText = 'flex: 1; padding: 5px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;';
            lowBtn.addEventListener('click', () => {
                this.setGpioPin(pin.pin, 0);
                this.drawBoard();
            });
            controls.appendChild(lowBtn);
            
            pinDiv.appendChild(controls);
            panel.appendChild(pinDiv);
        });
    }

    setGpioPin(pin, value) {
        this.gpioStates.set(pin, value);
        this.isSimulating = true;
        
        // Animate signal propagation
        setTimeout(() => {
            this.isSimulating = false;
            this.drawBoard();
        }, 1000);
    }

    simulateSignal(signal) {
        this.isSimulating = true;
        this.selectedSignal = signal;
        
        // Create animation
        const animation = {
            signal: signal,
            progress: 0,
            startTime: performance.now()
        };
        this.signalAnimations.push(animation);
        
        setTimeout(() => {
            this.isSimulating = false;
            this.signalAnimations = this.signalAnimations.filter(a => a !== animation);
            this.drawBoard();
        }, 2000);
    }

    updateComponentDetails() {
        const panel = this.detailsPanel;
        if (!this.selectedComponent) {
            panel.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Select a component to see details</div>';
            return;
        }
        
        const comp = this.selectedComponent;
        let html = `
            <div style="margin-bottom: 15px;">
                <h3 style="color: #0066cc; margin-bottom: 8px;">${comp.name}</h3>
                <div style="color: #666; font-size: 13px; margin-bottom: 10px;">${comp.type}</div>
                <p style="color: #333; font-size: 13px; line-height: 1.6;">${comp.description}</p>
            </div>
        `;
        
        if (comp.pinMapping) {
            html += `<div style="margin-top: 15px;">
                <h4 style="color: #333; margin-bottom: 8px;">Pin Mapping:</h4>
                <div style="max-height: 200px; overflow-y: auto;">`;
            comp.pinMapping.forEach(pin => {
                html += `<div style="padding: 5px; margin-bottom: 3px; background: #f9f9f9; border-radius: 3px; font-size: 12px;">
                    Pin ${pin.pin}: ${pin.name} ${pin.function ? `(${pin.function})` : ''}
                </div>`;
            });
            html += `</div></div>`;
        }
        
        if (comp.connections && comp.connections.length > 0) {
            html += `<div style="margin-top: 15px;">
                <h4 style="color: #333; margin-bottom: 8px;">Connections:</h4>
                <div style="font-size: 12px; color: #666;">`;
            comp.connections.forEach(conn => {
                html += `<div style="margin-bottom: 3px;">→ ${conn}</div>`;
            });
            html += `</div></div>`;
        }
        
        panel.innerHTML = html;
    }

    updateEducationContent() {
        const content = this.educationContent;
        const boardName = this.boardData.name;
        
        content.innerHTML = `
            <p><strong>${boardName}</strong> - This board demonstrates how electricity flows through modern computer systems.</p>
            <p><strong>Power Distribution:</strong> Power enters through USB/DC input, flows through voltage regulators to create stable 3.3V and 5V rails, and distributes to all components.</p>
            <p><strong>Signal Routing:</strong> Digital signals travel from the CPU/microcontroller through GPIO pins, communication buses (I2C, SPI, UART), and connect to peripherals.</p>
            <p><strong>Click components</strong> to learn more about their function and electrical connections.</p>
        `;
    }

    resetView() {
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        this.selectedComponent = null;
        this.hoveredComponent = null;
        this.selectedSignal = null;
        this.isSimulating = false;
        this.signalAnimations = [];
        this.gpioStates.clear();
        this.updateComponentList();
        this.updateSignalList();
        this.updateComponentDetails();
        this.updateGpioControls();
        this.updateEducationContent();
    }

    drawBoard() {
        const ctx = this.boardCtx;
        const width = this.boardCanvas.width;
        const height = this.boardCanvas.height;
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        // Apply zoom and pan
        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoom, this.zoom);
        
        // Draw based on view mode
        if (this.viewMode === 'physical') {
            this.drawPhysicalBoard(ctx);
        } else if (this.viewMode === 'schematic') {
            this.drawSchematicBoard(ctx);
        } else if (this.viewMode === 'layers') {
            this.drawLayerBoard(ctx);
        }
        
        ctx.restore();
    }

    drawPhysicalBoard(ctx) {
        const boardWidth = this.boardData.dimensions.width * this.boardData.scale;
        const boardHeight = this.boardData.dimensions.height * this.boardData.scale;
        const offsetX = (this.boardCanvas.width / this.zoom - boardWidth) / 2;
        const offsetY = (this.boardCanvas.height / this.zoom - boardHeight) / 2;
        
        // Board background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
        
        // Board outline
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, boardWidth, boardHeight);
        
        // Draw components
        this.boardData.components.forEach(comp => {
            const x = offsetX + comp.position.x * this.boardData.scale;
            const y = offsetY + comp.position.y * this.boardData.scale;
            const w = comp.size.width * this.boardData.scale;
            const h = comp.size.height * this.boardData.scale;
            
            // Highlight if selected or hovered
            if (comp === this.selectedComponent) {
                ctx.strokeStyle = '#0066cc';
                ctx.lineWidth = 3;
                ctx.strokeRect(x - w/2 - 2, y - h/2 - 2, w + 4, h + 4);
            } else if (comp === this.hoveredComponent) {
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - w/2 - 1, y - h/2 - 1, w + 2, h + 2);
            }
            
            // Component body
            ctx.fillStyle = comp.color;
            ctx.fillRect(x - w/2, y - h/2, w, h);
            
            // Component outline
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1;
            ctx.strokeRect(x - w/2, y - h/2, w, h);
            
            // Component label
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.max(8, w/8)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const label = comp.name.length > 12 ? comp.name.substring(0, 10) + '...' : comp.name;
            ctx.fillText(label, x, y);
            
            // Show GPIO state if applicable
            if (comp.pinMapping && this.gpioStates.size > 0) {
                comp.pinMapping.forEach(pin => {
                    if (pin.type === 'gpio' && this.gpioStates.has(pin.pin)) {
                        const state = this.gpioStates.get(pin.pin);
                        ctx.fillStyle = state ? '#4caf50' : '#f44336';
                        ctx.beginPath();
                        ctx.arc(x + w/2 - 5, y - h/2 + 5, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });
            }
        });
    }

    drawSchematicBoard(ctx) {
        // Draw schematic representation
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.boardCanvas.width / this.zoom, this.boardCanvas.height / this.zoom);
        
        const centerX = this.boardCanvas.width / (2 * this.zoom);
        const centerY = this.boardCanvas.height / (2 * this.zoom);
        
        // Draw main CPU/MCU as central component
        const mainComp = this.boardData.components.find(c => c.type === 'CPU' || c.type === 'Microcontroller');
        if (mainComp) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.fillStyle = '#fff';
            ctx.fillRect(centerX - 60, centerY - 40, 120, 80);
            ctx.strokeRect(centerX - 60, centerY - 40, 120, 80);
            
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(mainComp.name, centerX, centerY);
        }
        
        // Draw other components as schematic symbols
        this.boardData.components.forEach((comp, idx) => {
            if (comp.type === 'CPU' || comp.type === 'Microcontroller') return;
            
            const angle = (idx / this.boardData.components.length) * Math.PI * 2;
            const radius = 150;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // Draw component symbol
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.fillStyle = '#f0f0f0';
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw connection line
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            
            // Label
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(comp.name.substring(0, 8), x, y + 35);
        });
        
        // Draw signal animations if simulating
        if (this.isSimulating && this.signalAnimations.length > 0) {
            this.signalAnimations.forEach(anim => {
                const progress = Math.min(1, (performance.now() - anim.startTime) / 2000);
                const signal = anim.signal;
                const fromComp = this.boardData.components.find(c => c.id === signal.from);
                const toComp = this.boardData.components.find(c => c.id === signal.to);
                
                if (fromComp && toComp) {
                    const fromX = centerX + (fromComp.position.x - this.boardData.dimensions.width/2) * this.boardData.scale * 0.1;
                    const fromY = centerY + (fromComp.position.y - this.boardData.dimensions.height/2) * this.boardData.scale * 0.1;
                    const toX = centerX + (toComp.position.x - this.boardData.dimensions.width/2) * this.boardData.scale * 0.1;
                    const toY = centerY + (toComp.position.y - this.boardData.dimensions.height/2) * this.boardData.scale * 0.1;
                    
                    const x = fromX + (toX - fromX) * progress;
                    const y = fromY + (toY - fromY) * progress;
                    
                    ctx.fillStyle = '#4caf50';
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }

    drawLayerBoard(ctx) {
        const boardWidth = this.boardData.dimensions.width * this.boardData.scale;
        const boardHeight = this.boardData.dimensions.height * this.boardData.scale;
        const offsetX = (this.boardCanvas.width / this.zoom - boardWidth) / 2;
        const offsetY = (this.boardCanvas.height / this.zoom - boardHeight) / 2;
        
        // Draw layer based on activeLayer
        if (this.activeLayer === 'power') {
            ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
            
            // Draw power traces
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 3;
            this.boardData.layers.power.forEach(trace => {
                const fromComp = this.boardData.components.find(c => c.id === trace.from);
                const toComp = this.boardData.components.find(c => c.id === trace.to);
                if (fromComp && toComp) {
                    ctx.beginPath();
                    ctx.moveTo(
                        offsetX + fromComp.position.x * this.boardData.scale,
                        offsetY + fromComp.position.y * this.boardData.scale
                    );
                    ctx.lineTo(
                        offsetX + toComp.position.x * this.boardData.scale,
                        offsetY + toComp.position.y * this.boardData.scale
                    );
                    ctx.stroke();
                }
            });
        } else if (this.activeLayer === 'ground') {
            ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
            ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
            
            // Draw ground connections
            ctx.fillStyle = '#4a90e2';
            this.boardData.layers.ground.forEach(ground => {
                const comp = this.boardData.components.find(c => c.id === ground.component);
                if (comp) {
                    const x = offsetX + comp.position.x * this.boardData.scale;
                    const y = offsetY + comp.position.y * this.boardData.scale;
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        } else if (this.activeLayer === 'signals') {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
            ctx.fillRect(offsetX, offsetY, boardWidth, boardHeight);
            
            // Draw signal traces
            ctx.strokeStyle = '#50c878';
            ctx.lineWidth = 2;
            this.boardData.layers.signals.forEach(signal => {
                const fromComp = this.boardData.components.find(c => c.id === signal.from);
                const toComp = this.boardData.components.find(c => c.id === signal.to);
                if (fromComp && toComp) {
                    const highlight = signal === this.selectedSignal;
                    ctx.strokeStyle = highlight ? '#4caf50' : '#50c878';
                    ctx.lineWidth = highlight ? 3 : 2;
                    
                    ctx.beginPath();
                    ctx.moveTo(
                        offsetX + fromComp.position.x * this.boardData.scale,
                        offsetY + fromComp.position.y * this.boardData.scale
                    );
                    ctx.lineTo(
                        offsetX + toComp.position.x * this.boardData.scale,
                        offsetY + toComp.position.y * this.boardData.scale
                    );
                    ctx.stroke();
                    
                    // Label
                    const midX = (fromComp.position.x + toComp.position.x) * this.boardData.scale / 2 + offsetX;
                    const midY = (fromComp.position.y + toComp.position.y) * this.boardData.scale / 2 + offsetY;
                    ctx.fillStyle = highlight ? '#2e7d32' : '#333';
                    ctx.font = highlight ? 'bold 11px Arial' : '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(signal.bus, midX, midY - 5);
                }
            });
            
            // Draw signal animations
            if (this.isSimulating && this.signalAnimations.length > 0) {
                this.signalAnimations.forEach(anim => {
                    const progress = Math.min(1, (performance.now() - anim.startTime) / 2000);
                    const signal = anim.signal;
                    const fromComp = this.boardData.components.find(c => c.id === signal.from);
                    const toComp = this.boardData.components.find(c => c.id === signal.to);
                    
                    if (fromComp && toComp) {
                        const fromX = offsetX + fromComp.position.x * this.boardData.scale;
                        const fromY = offsetY + fromComp.position.y * this.boardData.scale;
                        const toX = offsetX + toComp.position.x * this.boardData.scale;
                        const toY = offsetY + toComp.position.y * this.boardData.scale;
                        
                        const x = fromX + (toX - fromX) * progress;
                        const y = fromY + (toY - fromY) * progress;
                        
                        ctx.fillStyle = '#4caf50';
                        ctx.beginPath();
                        ctx.arc(x, y, 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#2e7d32';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });
            }
        }
        
        // Draw component outlines
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        this.boardData.components.forEach(comp => {
            const x = offsetX + comp.position.x * this.boardData.scale;
            const y = offsetY + comp.position.y * this.boardData.scale;
            const w = comp.size.width * this.boardData.scale;
            const h = comp.size.height * this.boardData.scale;
            ctx.strokeRect(x - w/2, y - h/2, w, h);
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        
        if (this.boardCanvas) {
            this.boardCanvas.width = width - 650;
            this.boardCanvas.height = height - 300;
            this.boardCanvas.style.width = (width - 650) + 'px';
            this.boardCanvas.style.height = (height - 300) + 'px';
            this.drawBoard();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Redraw board if simulating signals
        if (this.isSimulating && this.signalAnimations.length > 0) {
            this.drawBoard();
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
        if (this.boardCanvas) {
            if (this.mouseDownHandler) {
                this.boardCanvas.removeEventListener('mousedown', this.mouseDownHandler);
            }
            if (this.mouseMoveHandler) {
                this.boardCanvas.removeEventListener('mousemove', this.mouseMoveHandler);
            }
            if (this.mouseUpHandler) {
                this.boardCanvas.removeEventListener('mouseup', this.mouseUpHandler);
            }
            if (this.wheelHandler) {
                this.boardCanvas.removeEventListener('wheel', this.wheelHandler);
            }
        }
        
        // Dispose documentation
        if (this.documentation) {
            this.documentation.dispose();
        }
        
        // Remove UI elements
        const controls = document.getElementById('board-controls');
        if (controls) controls.remove();
        
        const leftSidebar = document.getElementById('board-left-sidebar');
        if (leftSidebar) leftSidebar.remove();
        
        const rightSidebar = document.getElementById('board-right-sidebar');
        if (rightSidebar) rightSidebar.remove();
        
        const education = document.getElementById('board-education');
        if (education) education.remove();
        
        if (this.boardCanvas) {
            this.boardCanvas.remove();
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


