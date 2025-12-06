/**
 * ArduinoScene - Arduino Simulator and Educational Tool
 * 
 * Learn Arduino programming and simulate hardware interactions
 */

import * as THREE from 'three';
import { PhysicsDocumentation } from '../components/PhysicsDocumentation.js';
import { arduinoDocumentation } from '../docs/arduino.js';

export class ArduinoScene {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.animationId = null;
        
        // Arduino state
        this.pins = {
            digital: Array(14).fill({ mode: 'INPUT', value: 0, pwm: false }),
            analog: Array(6).fill(0)
        };
        this.isRunning = false;
        this.code = '';
        this.setupCode = '';
        this.loopCode = '';
        this.executionContext = null;
        this.serialOutput = [];
        
        // Components
        this.components = [];
        this.selectedComponentType = null;
        
        // View mode: 'board' or 'schematic'
        this.viewMode = 'board';
        this.documentation = null;
    }

    async init() {
        try {
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0xf5f5f5);

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

            // Create UI
            this.createCodeEditor();
            this.createArduinoBoard();
            this.createComponentPalette();
            this.createSerialMonitor();
            this.createEducationalPanel();
            
            // Create documentation panel
            this.documentation = new PhysicsDocumentation(arduinoDocumentation);
            const docPanel = this.documentation.createPanel();
            document.body.appendChild(docPanel);
            window.currentDocumentation = this.documentation;
            
            // Setup default code
            this.setDefaultCode();
            
            // Store resize handler for cleanup
            this.resizeHandler = () => this.handleResize();
            window.addEventListener('resize', this.resizeHandler);
            this.animate();
        } catch (error) {
            console.error('Error initializing ArduinoScene:', error);
            throw error;
        }
    }

    createCodeEditor() {
        // Remove existing editor if it exists
        const existing = document.getElementById('arduino-editor-container');
        if (existing) {
            existing.remove();
        }
        
        const editorContainer = document.createElement('div');
        editorContainer.id = 'arduino-editor-container';
        editorContainer.style.cssText = `
            position: fixed;
            top: 60px;
            left: 10px;
            width: 45%;
            bottom: 200px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            z-index: 1000;
        `;

        const header = document.createElement('div');
        header.style.cssText = 'padding: 10px; background: #0066cc; color: white; font-weight: bold;';
        header.textContent = 'Arduino Code Editor';
        editorContainer.appendChild(header);

        const textarea = document.createElement('textarea');
        textarea.id = 'arduino-code';
        textarea.style.cssText = `
            flex: 1;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border: none;
            resize: none;
            outline: none;
            background: #1e1e1e;
            color: #d4d4d4;
        `;
        textarea.value = this.code;
        textarea.addEventListener('input', (e) => {
            this.code = e.target.value;
        });
        editorContainer.appendChild(textarea);

        const controls = document.createElement('div');
        controls.style.cssText = 'padding: 10px; background: #f0f0f0; display: flex; gap: 10px;';
        
        const runBtn = document.createElement('button');
        runBtn.textContent = '▶ Run';
        runBtn.style.cssText = 'padding: 8px 15px; background: #00cc66; color: white; border: none; border-radius: 3px; cursor: pointer;';
        runBtn.addEventListener('click', () => this.runCode());
        controls.appendChild(runBtn);

        const stopBtn = document.createElement('button');
        stopBtn.textContent = '⏹ Stop';
        stopBtn.style.cssText = 'padding: 8px 15px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer;';
        stopBtn.addEventListener('click', () => this.stopCode());
        controls.appendChild(stopBtn);

        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Reset';
        resetBtn.style.cssText = 'padding: 8px 15px; background: #ffa500; color: white; border: none; border-radius: 3px; cursor: pointer;';
        resetBtn.addEventListener('click', () => this.resetArduino());
        controls.appendChild(resetBtn);

        editorContainer.appendChild(controls);
        document.body.appendChild(editorContainer);
        this.codeEditor = textarea;
    }

    createArduinoBoard() {
        // Remove existing board if it exists
        const existing = document.getElementById('arduino-board-container');
        if (existing) {
            existing.remove();
        }
        
        const boardContainer = document.createElement('div');
        boardContainer.id = 'arduino-board-container';
        boardContainer.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 50%;
            bottom: 200px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 20px;
            overflow-y: auto;
            z-index: 1000;
        `;

        const header = document.createElement('div');
        header.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 20px; color: #0066cc;';
        header.textContent = 'Arduino Uno Board';
        boardContainer.appendChild(header);

        // Create board visualization
        const boardCanvas = document.createElement('canvas');
        boardCanvas.id = 'arduino-board';
        boardCanvas.width = 600;
        boardCanvas.height = 400;
        boardCanvas.style.cssText = 'width: 100%; max-width: 600px; border: 2px solid #333; background: #006699; border-radius: 5px;';
        boardContainer.appendChild(boardCanvas);
        this.boardCanvas = boardCanvas;
        this.boardCtx = boardCanvas.getContext('2d');
        
        // Draw board
        this.drawArduinoBoard();

        // Pin status display
        const pinStatusDiv = document.createElement('div');
        pinStatusDiv.id = 'pin-status';
        pinStatusDiv.style.cssText = 'margin-top: 20px; font-size: 12px;';
        boardContainer.appendChild(pinStatusDiv);
        this.pinStatusDiv = pinStatusDiv;

        document.body.appendChild(boardContainer);
    }

    toggleViewMode() {
        this.viewMode = this.viewMode === 'board' ? 'schematic' : 'board';
        this.viewToggleBtn.textContent = this.viewMode === 'board' ? 'Switch to Schematic' : 'Switch to Board';
        this.drawArduinoBoard();
    }

    drawArduinoBoard() {
        const ctx = this.boardCtx;
        const width = this.boardCanvas.width;
        const height = this.boardCanvas.height;
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        if (this.viewMode === 'schematic') {
            this.drawArduinoSchematic();
            return;
        }
        
        // Clear
        ctx.fillStyle = '#006699';
        ctx.fillRect(0, 0, width, height);
        
        // Board body
        ctx.fillStyle = '#0a5490';
        ctx.fillRect(50, 50, width - 100, height - 100);
        
        // Digital pins (right side)
        ctx.fillStyle = '#333';
        for (let i = 0; i < 14; i++) {
            const y = 80 + i * 20;
            ctx.fillRect(width - 60, y, 15, 12);
            
            // Pin label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`D${i}`, width - 55, y + 9);
            
            // Pin state indicator
            const pin = this.pins.digital[i];
            if (pin.mode === 'OUTPUT') {
                ctx.fillStyle = pin.value > 0 ? '#00ff00' : '#333';
                ctx.beginPath();
                ctx.arc(width - 52, y + 6, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#333';
        }
        
        // Analog pins (left side)
        for (let i = 0; i < 6; i++) {
            const y = 80 + i * 20;
            ctx.fillRect(45, y, 15, 12);
            
            // Pin label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(`A${i}`, 50, y + 9);
            
            // Analog value indicator
            const value = this.pins.analog[i];
            ctx.fillStyle = `rgb(${Math.floor(value / 4)}, 0, ${255 - Math.floor(value / 4)})`;
            ctx.fillRect(45, y, Math.floor(value / 4), 12);
            
            ctx.fillStyle = '#333';
        }
        
        // Power pins
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(width - 60, height - 80, 15, 12);
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText('5V', width - 55, height - 72);
        
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(width - 60, height - 60, 15, 12);
        ctx.fillStyle = '#fff';
        ctx.fillText('GND', width - 58, height - 52);
        
        // Arduino label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ARDUINO UNO', width / 2, height / 2);
        ctx.textAlign = 'left';
    }

    drawArduinoSchematic() {
        const ctx = this.boardCtx;
        const width = this.boardCanvas.width;
        const height = this.boardCanvas.height;
        
        // Clear with white background for schematic
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw schematic-style Arduino representation
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#fff';
        
        // Main microcontroller rectangle
        const mcuX = width / 2;
        const mcuY = height / 2;
        const mcuWidth = 200;
        const mcuHeight = 150;
        
        ctx.strokeRect(mcuX - mcuWidth/2, mcuY - mcuHeight/2, mcuWidth, mcuHeight);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ATmega328P', mcuX, mcuY);
        
        // Digital pins (right side)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 14; i++) {
            const y = mcuY - mcuHeight/2 + 20 + i * 10;
            const pinX = mcuX + mcuWidth/2;
            
            // Pin line
            ctx.beginPath();
            ctx.moveTo(pinX, y);
            ctx.lineTo(pinX + 30, y);
            ctx.stroke();
            
            // Pin label
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`D${i}`, pinX + 35, y + 3);
            
            // Pin state indicator
            const pin = this.pins.digital[i];
            if (pin.mode === 'OUTPUT') {
                ctx.fillStyle = pin.value > 0 ? '#00ff00' : '#888';
                ctx.beginPath();
                ctx.arc(pinX + 15, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Analog pins (left side)
        for (let i = 0; i < 6; i++) {
            const y = mcuY - mcuHeight/2 + 20 + i * 10;
            const pinX = mcuX - mcuWidth/2;
            
            // Pin line
            ctx.beginPath();
            ctx.moveTo(pinX, y);
            ctx.lineTo(pinX - 30, y);
            ctx.stroke();
            
            // Pin label
            ctx.fillStyle = '#000';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`A${i}`, pinX - 35, y + 3);
            
            // Analog value indicator
            const value = this.pins.analog[i];
            ctx.fillStyle = `rgb(${Math.floor(value / 4)}, 0, ${255 - Math.floor(value / 4)})`;
            ctx.fillRect(pinX - 30, y - 2, Math.floor(value / 4), 4);
        }
        
        // Power pins
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(mcuX - mcuWidth/2, mcuY + mcuHeight/2 - 20);
        ctx.lineTo(mcuX - mcuWidth/2 - 30, mcuY + mcuHeight/2 - 20);
        ctx.stroke();
        ctx.fillStyle = '#ff0000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('5V', mcuX - mcuWidth/2 - 35, mcuY + mcuHeight/2 - 17);
        
        ctx.strokeStyle = '#0000ff';
        ctx.beginPath();
        ctx.moveTo(mcuX - mcuWidth/2, mcuY + mcuHeight/2 - 10);
        ctx.lineTo(mcuX - mcuWidth/2 - 30, mcuY + mcuHeight/2 - 10);
        ctx.stroke();
        ctx.fillStyle = '#0000ff';
        ctx.fillText('GND', mcuX - mcuWidth/2 - 35, mcuY + mcuHeight/2 - 7);
        
        ctx.textAlign = 'left';
    }

    createComponentPalette() {
        // Remove existing palette if it exists
        const existing = document.getElementById('arduino-components');
        if (existing) {
            existing.remove();
        }
        
        const palette = document.createElement('div');
        palette.id = 'arduino-components';
        palette.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            height: 180px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            z-index: 1000;
        `;

        const title = document.createElement('div');
        title.textContent = 'Components (Click to add, then click on board pin to connect)';
        title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
        palette.appendChild(title);

        const components = [
            { type: 'led', name: 'LED', color: '#ff6b6b' },
            { type: 'button', name: 'Button', color: '#4ecdc4' },
            { type: 'potentiometer', name: 'Potentiometer', color: '#95e1d3' },
            { type: 'servo', name: 'Servo Motor', color: '#f38181' }
        ];

        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 15px;';
        
        components.forEach(comp => {
            const btn = document.createElement('button');
            btn.textContent = comp.name;
            btn.style.cssText = `
                padding: 15px 25px;
                background: ${comp.color};
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                min-width: 120px;
            `;
            btn.onmouseover = () => btn.style.opacity = '0.8';
            btn.onmouseout = () => btn.style.opacity = '1';
            btn.addEventListener('click', () => {
                this.selectedComponentType = comp.type;
                alert(`Click on a pin on the Arduino board to connect ${comp.name}`);
            });
            container.appendChild(btn);
        });
        
        palette.appendChild(container);
        document.body.appendChild(palette);
    }

    createSerialMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'serial-monitor';
        monitor.style.cssText = `
            position: fixed;
            bottom: 200px;
            left: 10px;
            width: 45%;
            height: 180px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 10px;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 1000;
        `;

        const header = document.createElement('div');
        header.textContent = 'Serial Monitor';
        header.style.cssText = 'color: #fff; font-weight: bold; margin-bottom: 5px;';
        monitor.appendChild(header);

        const output = document.createElement('div');
        output.id = 'serial-output';
        output.style.cssText = 'min-height: 150px;';
        monitor.appendChild(output);
        this.serialOutputDiv = output;

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.style.cssText = 'position: absolute; top: 5px; right: 10px; padding: 5px 10px; background: #ff6b6b; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;';
        clearBtn.addEventListener('click', () => {
            this.serialOutput = [];
            this.updateSerialMonitor();
        });
        monitor.appendChild(clearBtn);

        document.body.appendChild(monitor);
    }

    createEducationalPanel() {
        // Remove existing panel if it exists
        const existing = document.getElementById('arduino-education');
        if (existing) {
            existing.remove();
        }
        
        const panel = document.createElement('div');
        panel.id = 'arduino-education';
        panel.style.cssText = `
            position: fixed;
            bottom: 200px;
            right: 10px;
            width: 50%;
            height: 180px;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #0066cc;
            border-radius: 5px;
            padding: 15px;
            overflow-y: auto;
            z-index: 1000;
        `;

        const title = document.createElement('div');
        title.textContent = 'Arduino Basics';
        title.style.cssText = 'font-weight: bold; font-size: 16px; margin-bottom: 10px; color: #0066cc;';
        panel.appendChild(title);

        const content = document.createElement('div');
        content.innerHTML = `
            <p style="font-size: 12px; line-height: 1.6; margin: 5px 0;">
                <strong>What is Arduino?</strong> Arduino is an open-source electronics platform based on easy-to-use hardware and software.
            </p>
            <p style="font-size: 12px; line-height: 1.6; margin: 5px 0;">
                <strong>GPIO Pins:</strong> Digital pins (0-13) can be INPUT or OUTPUT. Analog pins (A0-A5) read 0-1023 values.
            </p>
            <p style="font-size: 12px; line-height: 1.6; margin: 5px 0;">
                <strong>Functions:</strong> pinMode(pin, mode), digitalRead/Write(pin, value), analogRead/Write(pin, value), delay(ms)
            </p>
            <p style="font-size: 12px; line-height: 1.6; margin: 5px 0;">
                <strong>Structure:</strong> setup() runs once, loop() runs continuously.
            </p>
        `;
        panel.appendChild(content);

        document.body.appendChild(panel);
    }

    setDefaultCode() {
        this.code = `void setup() {
    pinMode(13, OUTPUT);
    Serial.begin(9600);
}

void loop() {
    digitalWrite(13, HIGH);
    delay(500);
    digitalWrite(13, LOW);
    delay(500);
    Serial.println("Blink!");
}`;
        if (this.codeEditor) {
            this.codeEditor.value = this.code;
        }
    }

    runCode() {
        if (this.isRunning) return;
        
        this.code = this.codeEditor.value;
        this.parseCode();
        this.isRunning = true;
        this.executeCode();
    }

    stopCode() {
        this.isRunning = false;
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
        }
    }

    resetArduino() {
        this.stopCode();
        this.pins = {
            digital: Array(14).fill({ mode: 'INPUT', value: 0, pwm: false }),
            analog: Array(6).fill(0)
        };
        this.serialOutput = [];
        this.updateSerialMonitor();
        this.drawArduinoBoard();
        this.updatePinStatus();
    }

    parseCode() {
        // Simple parser to extract setup() and loop() functions
        const code = this.code;
        
        // Extract setup function
        const setupMatch = code.match(/void\s+setup\s*\([^)]*\)\s*\{([^}]*)\}/s);
        this.setupCode = setupMatch ? setupMatch[1] : '';
        
        // Extract loop function
        const loopMatch = code.match(/void\s+loop\s*\([^)]*\)\s*\{([^}]*)\}/s);
        this.loopCode = loopMatch ? loopMatch[1] : '';
        
        // Create execution context
        this.executionContext = {
            pins: this.pins,
            serialOutput: this.serialOutput,
            delay: (ms) => {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        };
    }

    async executeCode() {
        if (!this.isRunning) return;
        
        // Execute setup once
        if (this.setupCode) {
            await this.executeBlock(this.setupCode);
        }
        
        // Execute loop repeatedly
        const executeLoop = async () => {
            if (!this.isRunning) return;
            
            if (this.loopCode) {
                await this.executeBlock(this.loopCode);
            }
            
            this.updateArduinoBoard();
            
            if (this.isRunning) {
                setTimeout(executeLoop, 100); // Small delay between loop iterations
            }
        };
        
        executeLoop();
    }

    async executeBlock(block) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        
        for (const line of lines) {
            if (!this.isRunning) break;
            
            await this.executeLine(line);
        }
    }

    async executeLine(line) {
        // Remove semicolon
        line = line.replace(/;$/, '').trim();
        
        // pinMode(pin, mode)
        const pinModeMatch = line.match(/pinMode\s*\(\s*(\d+)\s*,\s*(INPUT|OUTPUT)\s*\)/i);
        if (pinModeMatch) {
            const pin = parseInt(pinModeMatch[1]);
            const mode = pinModeMatch[2].toUpperCase();
            if (pin >= 0 && pin < 14) {
                this.pins.digital[pin] = { ...this.pins.digital[pin], mode };
            }
            return;
        }
        
        // digitalWrite(pin, value)
        const digitalWriteMatch = line.match(/digitalWrite\s*\(\s*(\d+)\s*,\s*(HIGH|LOW)\s*\)/i);
        if (digitalWriteMatch) {
            const pin = parseInt(digitalWriteMatch[1]);
            const value = digitalWriteMatch[2].toUpperCase() === 'HIGH' ? 1 : 0;
            if (pin >= 0 && pin < 14) {
                this.pins.digital[pin] = { ...this.pins.digital[pin], value };
            }
            return;
        }
        
        // digitalRead(pin)
        const digitalReadMatch = line.match(/digitalRead\s*\(\s*(\d+)\s*\)/i);
        if (digitalReadMatch) {
            const pin = parseInt(digitalReadMatch[1]);
            if (pin >= 0 && pin < 14) {
                return this.pins.digital[pin].value;
            }
            return 0;
        }
        
        // analogWrite(pin, value)
        const analogWriteMatch = line.match(/analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/i);
        if (analogWriteMatch) {
            const pin = parseInt(analogWriteMatch[1]);
            const value = parseInt(analogWriteMatch[2]);
            if (pin >= 0 && pin < 14) {
                this.pins.digital[pin] = { ...this.pins.digital[pin], value: value / 255, pwm: true };
            }
            return;
        }
        
        // analogRead(pin)
        const analogReadMatch = line.match(/analogRead\s*\(\s*A?(\d+)\s*\)/i);
        if (analogReadMatch) {
            const pin = parseInt(analogReadMatch[1]);
            if (pin >= 0 && pin < 6) {
                return this.pins.analog[pin];
            }
            return 0;
        }
        
        // delay(ms)
        const delayMatch = line.match(/delay\s*\(\s*(\d+)\s*\)/i);
        if (delayMatch) {
            const ms = parseInt(delayMatch[1]);
            await new Promise(resolve => setTimeout(resolve, Math.min(ms, 1000))); // Cap at 1 second for simulation
            return;
        }
        
        // Serial.begin(baud)
        const serialBeginMatch = line.match(/Serial\.begin\s*\(\s*(\d+)\s*\)/i);
        if (serialBeginMatch) {
            // Just acknowledge, no action needed
            return;
        }
        
        // Serial.println(value)
        const serialPrintMatch = line.match(/Serial\.(print|println)\s*\(\s*["']?([^"']+)["']?\s*\)/i);
        if (serialPrintMatch) {
            const value = serialPrintMatch[2];
            this.serialOutput.push(value);
            this.updateSerialMonitor();
            return;
        }
        
        // Variable assignments (simplified)
        const assignMatch = line.match(/(\w+)\s*=\s*(\d+)/);
        if (assignMatch) {
            // Store in execution context
            if (!this.executionContext.vars) {
                this.executionContext.vars = {};
            }
            this.executionContext.vars[assignMatch[1]] = parseInt(assignMatch[2]);
            return;
        }
    }

    updateArduinoBoard() {
        this.drawArduinoBoard();
        this.updatePinStatus();
    }

    updatePinStatus() {
        let html = '<strong>Pin States:</strong><br>';
        for (let i = 0; i < 14; i++) {
            const pin = this.pins.digital[i];
            html += `D${i}: ${pin.mode} ${pin.value > 0 ? 'HIGH' : 'LOW'}<br>`;
        }
        for (let i = 0; i < 6; i++) {
            html += `A${i}: ${this.pins.analog[i]}<br>`;
        }
        this.pinStatusDiv.innerHTML = html;
    }

    updateSerialMonitor() {
        this.serialOutputDiv.innerHTML = this.serialOutput.map(line => 
            `<div>${line}</div>`
        ).join('');
        this.serialOutputDiv.scrollTop = this.serialOutputDiv.scrollHeight;
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
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
        
        this.stopCode();
        
        // Dispose documentation
        if (this.documentation) {
            this.documentation.dispose();
        }
        
        // Remove UI elements
        const editor = document.getElementById('arduino-editor-container');
        if (editor) editor.remove();
        
        const board = document.getElementById('arduino-board-container');
        if (board) board.remove();
        
        const components = document.getElementById('arduino-components');
        if (components) components.remove();
        
        const monitor = document.getElementById('serial-monitor');
        if (monitor) monitor.remove();
        
        const education = document.getElementById('arduino-education');
        if (education) education.remove();
        
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

