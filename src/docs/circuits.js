/**
 * Circuit Theory Documentation
 */

export const circuitsDocumentation = {
    title: 'Circuit Theory and Electricity',
    sections: [
        {
            title: 'Overview',
            content: `
                <p>Circuit theory is the foundation of electrical engineering, describing how electrical components interact to create functional circuits. Understanding circuits is essential for designing everything from simple LED circuits to complex computer processors.</p>
            `
        },
        {
            title: 'Fundamental Concepts',
            content: `
                <h3>Voltage (V)</h3>
                <p>Voltage, measured in volts (V), is the electrical potential difference between two points. It's the "pressure" that pushes electric charge through a circuit.</p>
                
                <h3>Current (I)</h3>
                <p>Current, measured in amperes (A), is the flow of electric charge. One ampere equals one coulomb of charge passing per second.</p>
                
                <h3>Resistance (R)</h3>
                <p>Resistance, measured in ohms (Ω), opposes the flow of current. Higher resistance means less current flows for a given voltage.</p>
                
                <h3>Power (P)</h3>
                <p>Power, measured in watts (W), is the rate at which electrical energy is converted. P = V × I.</p>
            `
        },
        {
            title: 'Ohm\'s Law',
            content: `
                <p>The fundamental relationship in circuit analysis:</p>
                <div class="equation">V = I × R</div>
                <p>Where:</p>
                <ul>
                    <li>V = Voltage (volts)</li>
                    <li>I = Current (amperes)</li>
                    <li>R = Resistance (ohms)</li>
                </ul>
                <p>This can be rearranged to:</p>
                <div class="equation">I = V / R</div>
                <div class="equation">R = V / I</div>
            `
        },
        {
            title: 'Kirchhoff\'s Laws',
            content: `
                <h3>Kirchhoff's Current Law (KCL)</h3>
                <p>The sum of currents entering a node equals the sum of currents leaving it:</p>
                <div class="equation">Σ I<sub>in</sub> = Σ I<sub>out</sub></div>
                <p>This is based on conservation of charge - charge cannot accumulate at a node.</p>
                
                <h3>Kirchhoff's Voltage Law (KVL)</h3>
                <p>The sum of voltage drops around any closed loop equals zero:</p>
                <div class="equation">Σ V = 0</div>
                <p>This is based on conservation of energy - energy gained equals energy lost in a closed path.</p>
            `
        },
        {
            title: 'Series and Parallel Circuits',
            content: `
                <h3>Series Circuits</h3>
                <p>Components connected end-to-end in a single path:</p>
                <ul>
                    <li>Current is the same through all components: I<sub>total</sub> = I<sub>1</sub> = I<sub>2</sub> = ...</li>
                    <li>Voltage divides across components: V<sub>total</sub> = V<sub>1</sub> + V<sub>2</sub> + ...</li>
                    <li>Total resistance: R<sub>total</sub> = R<sub>1</sub> + R<sub>2</sub> + ...</li>
                </ul>
                
                <h3>Parallel Circuits</h3>
                <p>Components connected across the same voltage source:</p>
                <ul>
                    <li>Voltage is the same across all components: V<sub>total</sub> = V<sub>1</sub> = V<sub>2</sub> = ...</li>
                    <li>Current divides among branches: I<sub>total</sub> = I<sub>1</sub> + I<sub>2</sub> + ...</li>
                    <li>Total resistance: 1/R<sub>total</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub> + ...</li>
                </ul>
            `
        },
        {
            title: 'Circuit Components',
            content: `
                <h3>Resistor</h3>
                <p>Opposes current flow. Value measured in ohms (Ω). Power dissipation: P = I²R = V²/R</p>
                
                <h3>Capacitor</h3>
                <p>Stores electrical energy in an electric field. Value measured in farads (F). Blocks DC, passes AC. Charging: V(t) = V₀(1 - e^(-t/RC))</p>
                
                <h3>Inductor</h3>
                <p>Stores energy in a magnetic field. Value measured in henries (H). Opposes changes in current. V = L(di/dt)</p>
                
                <h3>Diode</h3>
                <p>Allows current flow in one direction only. Forward voltage drop typically 0.7V for silicon diodes.</p>
                
                <h3>Voltage Source</h3>
                <p>Provides constant voltage regardless of current drawn (ideal source).</p>
                
                <h3>Ground</h3>
                <p>Reference point for voltage measurements, typically 0V.</p>
            `
        },
        {
            title: 'Digital Logic Gates',
            content: `
                <h3>AND Gate</h3>
                <p>Output is HIGH only when all inputs are HIGH.</p>
                <p>Truth Table: 00→0, 01→0, 10→0, 11→1</p>
                
                <h3>OR Gate</h3>
                <p>Output is HIGH when any input is HIGH.</p>
                <p>Truth Table: 00→0, 01→1, 10→1, 11→1</p>
                
                <h3>NOT Gate (Inverter)</h3>
                <p>Output is the inverse of input.</p>
                <p>Truth Table: 0→1, 1→0</p>
                
                <h3>NAND Gate</h3>
                <p>Output is LOW only when all inputs are HIGH (AND + NOT).</p>
                
                <h3>NOR Gate</h3>
                <p>Output is LOW when any input is HIGH (OR + NOT).</p>
                
                <h3>XOR Gate</h3>
                <p>Output is HIGH when inputs differ.</p>
                <p>Truth Table: 00→0, 01→1, 10→1, 11→0</p>
            `
        },
        {
            title: 'Circuit Analysis Methods',
            content: `
                <h3>Nodal Analysis</h3>
                <p>Based on KCL. Assign voltage variables to nodes, write KCL equations, solve system.</p>
                
                <h3>Mesh Analysis</h3>
                <p>Based on KVL. Assign current variables to meshes, write KVL equations, solve system.</p>
                
                <h3>Superposition Theorem</h3>
                <p>For linear circuits, response equals sum of responses to individual sources.</p>
                
                <h3>Thevenin's Theorem</h3>
                <p>Any linear circuit can be replaced by equivalent voltage source and series resistance.</p>
                
                <h3>Norton's Theorem</h3>
                <p>Any linear circuit can be replaced by equivalent current source and parallel resistance.</p>
            `
        },
        {
            title: 'AC Circuit Analysis',
            content: `
                <h3>Impedance</h3>
                <p>Complex resistance in AC circuits: Z = R + jX</p>
                <p>Where j = √(-1), R is resistance, X is reactance</p>
                
                <h3>Reactance</h3>
                <p>Capacitive: X<sub>C</sub> = 1/(2πfC)</p>
                <p>Inductive: X<sub>L</sub> = 2πfL</p>
                
                <h3>Resonance</h3>
                <p>Occurs when X<sub>L</sub> = X<sub>C</sub> at frequency f = 1/(2π√LC)</p>
            `
        },
        {
            title: 'Power Calculations',
            content: `
                <h3>DC Power</h3>
                <div class="equation">P = V × I = I²R = V²/R</div>
                
                <h3>AC Power</h3>
                <p>Average power: P<sub>avg</sub> = V<sub>rms</sub> × I<sub>rms</sub> × cos(φ)</p>
                <p>Where φ is the phase angle between voltage and current</p>
                
                <h3>Power Factor</h3>
                <p>cos(φ) = P / (V<sub>rms</sub> × I<sub>rms</sub>)</p>
            `
        },
        {
            title: 'Applications',
            content: `
                <ul>
                    <li><strong>Power Distribution:</strong> Designing electrical grids and power systems</li>
                    <li><strong>Electronics:</strong> Creating amplifiers, filters, oscillators</li>
                    <li><strong>Digital Systems:</strong> Building logic circuits, processors, memory</li>
                    <li><strong>Signal Processing:</strong> Filtering, modulation, demodulation</li>
                    <li><strong>Control Systems:</strong> Feedback loops, PID controllers</li>
                </ul>
            `
        }
    ]
};

