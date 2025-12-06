/**
 * Computer Board Electrical Systems Documentation
 */

export const boardElectricalDocumentation = {
    title: 'Computer Board Electrical Systems',
    sections: [
        {
            title: 'Overview',
            content: `
                <p>Computer boards like Raspberry Pi, Arduino, and ESP32 are complex systems where electricity flows through carefully designed pathways to power components and transmit data. Understanding these electrical systems is fundamental to electronics and embedded systems design.</p>
                <p>This page demonstrates how electricity flows through modern computer boards, showing power distribution, signal routing, and component communication.</p>
            `
        },
        {
            title: 'Power Distribution',
            content: `
                <h3>Power Input</h3>
                <p>Most boards receive power through USB connectors (USB-C, USB-B, or Micro-USB). The input voltage is typically 5V DC, though some boards accept a range (e.g., 7-12V for Arduino VIN).</p>
                
                <h3>Voltage Regulation</h3>
                <p>Boards use voltage regulators to convert input power to the required voltages:</p>
                <ul>
                    <li><strong>5V Rail:</strong> Used for USB ports, GPIO pins, and some peripherals</li>
                    <li><strong>3.3V Rail:</strong> Standard for modern microcontrollers and digital logic</li>
                    <li><strong>1.8V/1.2V:</strong> Used internally by CPUs and high-speed components</li>
                </ul>
                <p>Linear regulators are simple but inefficient. Switching regulators (buck converters) are more efficient for higher current loads.</p>
                
                <h3>Power Planes</h3>
                <p>PCBs use dedicated layers called "power planes" - large copper areas that distribute power evenly across the board. This reduces voltage drop and provides stable power to all components.</p>
                
                <h3>Decoupling Capacitors</h3>
                <p>Small capacitors placed near power pins filter out noise and provide instant current during switching events. They act as local energy reservoirs.</p>
            `
        },
        {
            title: 'Ground System',
            content: `
                <h3>Ground Planes</h3>
                <p>Just as important as power planes, ground planes provide a common reference point (0V) for all components. Large ground planes also help reduce electromagnetic interference (EMI).</p>
                
                <h3>Star Grounding</h3>
                <p>In some designs, ground connections radiate from a central point (star topology) to prevent ground loops and reduce noise.</p>
                
                <h3>Digital vs Analog Ground</h3>
                <p>High-precision analog circuits often use separate ground planes that connect at a single point to prevent digital noise from affecting analog signals.</p>
            `
        },
        {
            title: 'Signal Routing',
            content: `
                <h3>Digital Signals</h3>
                <p>Digital signals represent binary data (0s and 1s) as voltage levels:</p>
                <ul>
                    <li><strong>LOW (0):</strong> Typically 0V to 0.8V</li>
                    <li><strong>HIGH (1):</strong> Typically 2V to 3.3V (or 5V for older systems)</li>
                </ul>
                <p>Signals travel along traces (copper pathways) on the PCB. Trace width determines current capacity and impedance.</p>
                
                <h3>Signal Integrity</h3>
                <p>High-speed signals require careful design:</p>
                <ul>
                    <li><strong>Impedance Matching:</strong> Traces must have controlled impedance (typically 50Ω or 90Ω)</li>
                    <li><strong>Differential Pairs:</strong> High-speed signals use paired traces (e.g., USB, Ethernet)</li>
                    <li><strong>Length Matching:</strong> Parallel signals must have equal trace lengths to maintain timing</li>
                </ul>
                
                <h3>Clock Signals</h3>
                <p>Crystal oscillators generate precise clock signals that synchronize all operations. Clock distribution networks ensure all components receive synchronized timing.</p>
            `
        },
        {
            title: 'Communication Buses',
            content: `
                <h3>I2C (Inter-Integrated Circuit)</h3>
                <p>Two-wire bus (SDA, SCL) for connecting multiple devices:</p>
                <ul>
                    <li>Low-speed communication (100kHz to 3.4MHz)</li>
                    <li>Uses pull-up resistors</li>
                    <li>Master-slave architecture</li>
                    <li>Common for sensors and small peripherals</li>
                </ul>
                
                <h3>SPI (Serial Peripheral Interface)</h3>
                <p>Four-wire bus (MOSI, MISO, SCLK, CS) for high-speed communication:</p>
                <ul>
                    <li>Full-duplex communication</li>
                    <li>Higher speeds than I2C (up to 50MHz+)</li>
                    <li>Point-to-point connections</li>
                    <li>Common for displays, flash memory, ADCs</li>
                </ul>
                
                <h3>UART (Universal Asynchronous Receiver-Transmitter)</h3>
                <p>Two-wire serial communication (TX, RX):</p>
                <ul>
                    <li>Asynchronous (no clock signal)</li>
                    <li>Common baud rates: 9600, 115200</li>
                    <li>Used for debugging, GPS modules, Bluetooth modules</li>
                </ul>
                
                <h3>USB (Universal Serial Bus)</h3>
                <p>High-speed serial bus for data and power:</p>
                <ul>
                    <li>USB 2.0: Up to 480 Mbps</li>
                    <li>USB 3.0: Up to 5 Gbps</li>
                    <li>Differential signaling for noise immunity</li>
                    <li>Power delivery up to 100W (USB-C PD)</li>
                </ul>
            `
        },
        {
            title: 'GPIO (General Purpose Input/Output)',
            content: `
                <h3>Digital GPIO</h3>
                <p>Pins that can be configured as inputs or outputs:</p>
                <ul>
                    <li><strong>Input Mode:</strong> Read external signals (buttons, sensors)</li>
                    <li><strong>Output Mode:</strong> Drive external devices (LEDs, relays)</li>
                    <li><strong>Pull-up/Pull-down:</strong> Internal resistors prevent floating inputs</li>
                </ul>
                
                <h3>PWM (Pulse Width Modulation)</h3>
                <p>Many GPIO pins support PWM - rapidly switching between HIGH and LOW to simulate analog output:</p>
                <ul>
                    <li>Used for dimming LEDs, controlling servo motors, generating tones</li>
                    <li>Duty cycle determines effective voltage (0-100%)</li>
                    <li>Frequency typically 500Hz to 20kHz</li>
                </ul>
                
                <h3>Analog Input (ADC)</h3>
                <p>Some pins can read analog voltages:</p>
                <ul>
                    <li>Converts continuous voltage to digital value</li>
                    <li>Resolution: 8-bit (0-255) to 12-bit (0-4095)</li>
                    <li>Used for potentiometers, temperature sensors, light sensors</li>
                </ul>
            `
        },
        {
            title: 'Component Communication',
            content: `
                <h3>CPU/Microcontroller</h3>
                <p>The central processing unit coordinates all operations:</p>
                <ul>
                    <li>Executes program instructions</li>
                    <li>Manages memory access</li>
                    <li>Controls GPIO pins and peripherals</li>
                    <li>Processes interrupts from external events</li>
                </ul>
                
                <h3>Memory Interfaces</h3>
                <p>Different types of memory connect via specialized buses:</p>
                <ul>
                    <li><strong>Flash Memory:</strong> Stores program code (SPI or parallel interface)</li>
                    <li><strong>RAM:</strong> Fast temporary storage (DDR, LPDDR for high-speed)</li>
                    <li><strong>EEPROM:</strong> Non-volatile storage for settings</li>
                </ul>
                
                <h3>Peripheral Communication</h3>
                <p>Components communicate through standardized interfaces:</p>
                <ul>
                    <li>Ethernet controllers for network connectivity</li>
                    <li>WiFi/Bluetooth modules for wireless communication</li>
                    <li>Display controllers for graphics output</li>
                    <li>Audio codecs for sound processing</li>
                </ul>
            `
        },
        {
            title: 'PCB Design Concepts',
            content: `
                <h3>Multi-Layer Boards</h3>
                <p>Modern PCBs use multiple layers (2-20+ layers):</p>
                <ul>
                    <li>Dedicated power and ground layers</li>
                    <li>Signal layers for routing</li>
                    <li>Allows complex routing without crossing traces</li>
                </ul>
                
                <h3>Vias</h3>
                <p>Holes drilled through the board to connect layers:</p>
                <ul>
                    <li>Through-hole vias: Connect all layers</li>
                    <li>Blind vias: Connect outer layer to inner layer</li>
                    <li>Buried vias: Connect only inner layers</li>
                </ul>
                
                <h3>Trace Width and Current</h3>
                <p>Trace width determines current capacity:</p>
                <ul>
                    <li>Power traces: Wider (20-50 mils) for higher current</li>
                    <li>Signal traces: Narrower (5-10 mils) for dense routing</li>
                    <li>High-speed signals: Controlled width for impedance matching</li>
                </ul>
                
                <h3>EMI Reduction</h3>
                <p>Techniques to reduce electromagnetic interference:</p>
                <ul>
                    <li>Ground planes act as shields</li>
                    <li>Keep high-speed traces away from sensitive analog circuits</li>
                    <li>Use ground vias to create "fences" around noisy areas</li>
                    <li>Proper component placement and routing</li>
                </ul>
            `
        },
        {
            title: 'Board Comparison',
            content: `
                <h3>Raspberry Pi 4</h3>
                <ul>
                    <li><strong>CPU:</strong> Quad-core ARM Cortex-A72 @ 1.8GHz</li>
                    <li><strong>Power:</strong> 5V USB-C, ~3A</li>
                    <li><strong>GPIO:</strong> 40-pin header, 3.3V logic</li>
                    <li><strong>Communication:</strong> USB 3.0, Gigabit Ethernet, WiFi, Bluetooth</li>
                    <li><strong>Use Case:</strong> Full Linux computer, multimedia, IoT projects</li>
                </ul>
                
                <h3>Arduino Uno</h3>
                <ul>
                    <li><strong>CPU:</strong> ATmega328P @ 16MHz</li>
                    <li><strong>Power:</strong> 5V USB-B or 7-12V VIN</li>
                    <li><strong>GPIO:</strong> 14 digital, 6 analog inputs</li>
                    <li><strong>Communication:</strong> USB 2.0, I2C, SPI, UART</li>
                    <li><strong>Use Case:</strong> Simple projects, learning, prototyping</li>
                </ul>
                
                <h3>ESP32</h3>
                <ul>
                    <li><strong>CPU:</strong> Dual-core Xtensa LX6 @ 240MHz</li>
                    <li><strong>Power:</strong> 5V USB-C, ~500mA</li>
                    <li><strong>GPIO:</strong> 30+ pins with multiple functions</li>
                    <li><strong>Communication:</strong> WiFi, Bluetooth, I2C, SPI, UART</li>
                    <li><strong>Use Case:</strong> IoT projects, wireless connectivity, low power</li>
                </ul>
            `
        },
        {
            title: 'PCB Manufacturing Process',
            content: `
                <h3>Design to Production Workflow</h3>
                <p>The journey from circuit design to finished PCB involves several stages:</p>
                <ol>
                    <li><strong>Schematic Design:</strong> Create circuit diagram showing component connections</li>
                    <li><strong>PCB Layout:</strong> Place components and route traces on board</li>
                    <li><strong>Design Rule Check (DRC):</strong> Verify design meets manufacturing constraints</li>
                    <li><strong>Gerber File Generation:</strong> Export manufacturing files (copper layers, drill files, etc.)</li>
                    <li><strong>Fabrication:</strong> PCB manufacturer creates the board</li>
                    <li><strong>Assembly:</strong> Components are soldered onto the board</li>
                    <li><strong>Testing:</strong> Verify functionality and quality</li>
                </ol>
                
                <h3>Gerber Files and Manufacturing Data</h3>
                <p>Gerber files are the standard format for PCB manufacturing:</p>
                <ul>
                    <li><strong>Copper Layers:</strong> One file per layer showing trace patterns</li>
                    <li><strong>Drill Files:</strong> Specify hole locations and sizes</li>
                    <li><strong>Solder Mask:</strong> Protective coating over copper (except pads)</li>
                    <li><strong>Silkscreen:</strong> Text and component outlines printed on board</li>
                    <li><strong>Paste Mask:</strong> For SMT assembly, shows where solder paste is applied</li>
                </ul>
                
                <h3>PCB Fabrication Steps</h3>
                <ol>
                    <li><strong>Substrate Preparation:</strong> Start with fiberglass-epoxy laminate (FR-4)</li>
                    <li><strong>Copper Lamination:</strong> Bond copper foil to substrate</li>
                    <li><strong>Photoresist Application:</strong> Apply light-sensitive resist layer</li>
                    <li><strong>Exposure:</strong> UV light exposes resist through photomask</li>
                    <li><strong>Etching:</strong> Remove exposed copper, leaving traces</li>
                    <li><strong>Drilling:</strong> Drill holes for vias and through-hole components</li>
                    <li><strong>Plating:</strong> Electroplate vias and holes with copper</li>
                    <li><strong>Solder Mask:</strong> Apply protective coating</li>
                    <li><strong>Silkscreen:</strong> Print component labels and markings</li>
                    <li><strong>Surface Finish:</strong> Apply finish (HASL, ENIG, OSP) to prevent oxidation</li>
                </ol>
                
                <h3>Assembly Process</h3>
                <p><strong>Surface Mount Technology (SMT):</strong></p>
                <ul>
                    <li>Solder paste is applied to pads via stencil</li>
                    <li>Components are placed by pick-and-place machines</li>
                    <li>Board passes through reflow oven to melt solder</li>
                    <li>Most common for modern electronics</li>
                </ul>
                <p><strong>Through-Hole Assembly:</strong></p>
                <ul>
                    <li>Component leads inserted through holes</li>
                    <li>Wave soldering or hand soldering</li>
                    <li>More robust but less space-efficient</li>
                </ul>
                
                <h3>Quality Control</h3>
                <ul>
                    <li><strong>Automated Optical Inspection (AOI):</strong> Camera-based component verification</li>
                    <li><strong>In-Circuit Testing (ICT):</strong> Electrical testing of connections</li>
                    <li><strong>X-Ray Inspection:</strong> For BGA and hidden solder joints</li>
                    <li><strong>Functional Testing:</strong> Verify board operates correctly</li>
                </ul>
            `
        },
        {
            title: 'Component Types and Packages',
            content: `
                <h3>Through-Hole vs Surface Mount</h3>
                <p><strong>Through-Hole Components:</strong></p>
                <ul>
                    <li>Leads inserted through holes in PCB</li>
                    <li>More robust mechanical connection</li>
                    <li>Easier to hand-solder and replace</li>
                    <li>Larger footprint, requires drilling</li>
                    <li>Examples: DIP ICs, axial resistors, radial capacitors</li>
                </ul>
                <p><strong>Surface Mount (SMT) Components:</strong></p>
                <ul>
                    <li>Mounted directly on PCB surface</li>
                    <li>Smaller size, higher density</li>
                    <li>Better high-frequency performance</li>
                    <li>Requires reflow soldering</li>
                    <li>Examples: 0805 resistors, SOIC ICs, QFP packages</li>
                </ul>
                
                <h3>Common Package Types</h3>
                <p><strong>DIP (Dual In-line Package):</strong> Through-hole IC package with two rows of pins</p>
                <p><strong>SOIC (Small Outline Integrated Circuit):</strong> SMT version of DIP, smaller footprint</p>
                <p><strong>QFP (Quad Flat Package):</strong> Square package with pins on all four sides</p>
                <p><strong>BGA (Ball Grid Array):</strong> Pins replaced by solder balls underneath, very high density</p>
                <p><strong>QFN (Quad Flat No-leads):</strong> Similar to QFP but with pads instead of leads</p>
                <p><strong>0603, 0805, 1206:</strong> SMT resistor/capacitor sizes (in mils)</p>
                
                <h3>Component Selection Criteria</h3>
                <ul>
                    <li><strong>Electrical Specifications:</strong> Voltage, current, power ratings</li>
                    <li><strong>Package Size:</strong> Physical dimensions and pin count</li>
                    <li><strong>Temperature Range:</strong> Operating and storage temperatures</li>
                    <li><strong>Reliability:</strong> MTBF (Mean Time Between Failures)</li>
                    <li><strong>Cost:</strong> Component and assembly costs</li>
                    <li><strong>Availability:</strong> Lead times and stock levels</li>
                </ul>
                
                <h3>Passive Components</h3>
                <p><strong>Resistors:</strong> Control current flow, voltage division, pull-up/down</p>
                <p><strong>Capacitors:</strong> Filter noise, store energy, coupling/decoupling</p>
                <p><strong>Inductors:</strong> Filter signals, energy storage, RF circuits</p>
                <p><strong>Diodes:</strong> Rectification, protection, signal switching</p>
                
                <h3>Active Components</h3>
                <p><strong>Transistors:</strong> Amplification, switching, current control</p>
                <p><strong>Integrated Circuits:</strong> Microcontrollers, amplifiers, logic gates, memory</p>
                <p><strong>Voltage Regulators:</strong> Convert and regulate power supply voltages</p>
                <p><strong>Oscillators:</strong> Generate clock signals</p>
                
                <h3>Connectors</h3>
                <ul>
                    <li><strong>Headers:</strong> Pin headers for GPIO, power, communication</li>
                    <li><strong>USB Connectors:</strong> USB-A, USB-B, USB-C, Micro-USB</li>
                    <li><strong>Power Connectors:</strong> Barrel jacks, terminal blocks</li>
                    <li><strong>RF Connectors:</strong> SMA, UFL for antennas</li>
                </ul>
            `
        },
        {
            title: 'PCB Layers and Stack-up Design',
            content: `
                <h3>Layer Stack-up</h3>
                <p>PCB stack-up defines the arrangement of copper and dielectric layers:</p>
                <ul>
                    <li><strong>2-Layer:</strong> Top and bottom signal layers, simplest design</li>
                    <li><strong>4-Layer:</strong> Typically: Signal, Ground, Power, Signal</li>
                    <li><strong>6-Layer+:</strong> Multiple signal layers with dedicated power/ground planes</li>
                </ul>
                
                <h3>Typical 4-Layer Stack-up</h3>
                <ol>
                    <li><strong>Top Layer:</strong> Signal routing and component placement</li>
                    <li><strong>Ground Plane:</strong> Solid copper ground reference</li>
                    <li><strong>Power Plane:</strong> Power distribution (may be split for multiple voltages)</li>
                    <li><strong>Bottom Layer:</strong> Signal routing and component placement</li>
                </ol>
                
                <h3>Signal Layer Organization</h3>
                <ul>
                    <li>Group related signals together</li>
                    <li>Keep high-speed signals on outer layers (better impedance control)</li>
                    <li>Route sensitive analog signals away from digital noise</li>
                    <li>Minimize layer transitions (vias add inductance)</li>
                </ul>
                
                <h3>Power Plane Design</h3>
                <ul>
                    <li>Use solid planes for power distribution when possible</li>
                    <li>Split planes for multiple voltages (careful routing required)</li>
                    <li>Provide adequate copper area for current capacity</li>
                    <li>Place power planes adjacent to ground planes (capacitance)</li>
                </ul>
                
                <h3>Ground Plane Strategies</h3>
                <ul>
                    <li><strong>Solid Ground Plane:</strong> Best for most designs, provides low impedance return path</li>
                    <li><strong>Split Ground:</strong> Separate analog and digital grounds, connect at single point</li>
                    <li><strong>Gridded Ground:</strong> Used in some RF designs</li>
                </ul>
                
                <h3>Via Types</h3>
                <ul>
                    <li><strong>Through-Hole Via:</strong> Connects all layers, most common</li>
                    <li><strong>Blind Via:</strong> Connects outer layer to inner layer</li>
                    <li><strong>Buried Via:</strong> Connects only inner layers</li>
                    <li><strong>Microvia:</strong> Small vias (< 0.15mm) for high-density designs</li>
                    <li><strong>Via-in-Pad:</strong> Via directly under component pad</li>
                </ul>
                
                <h3>Controlled Impedance</h3>
                <p>For high-speed signals, trace impedance must be controlled:</p>
                <ul>
                    <li><strong>Single-ended:</strong> Typically 50Ω or 75Ω</li>
                    <li><strong>Differential:</strong> Typically 90Ω or 100Ω</li>
                    <li>Impedance depends on trace width, dielectric thickness, and dielectric constant</li>
                    <li>Calculated using field solvers or online calculators</li>
                </ul>
            `
        },
        {
            title: 'Design Rules and Constraints',
            content: `
                <h3>Minimum Trace Width</h3>
                <p>Trace width determines current capacity and manufacturability:</p>
                <ul>
                    <li><strong>Standard:</strong> 0.1mm (4 mils) minimum for most manufacturers</li>
                    <li><strong>Power Traces:</strong> Wider traces for higher current (use calculators)</li>
                    <li><strong>Current Capacity:</strong> I = k × (ΔT)^0.44 × A^0.725 (k = 0.024 for outer layers)</li>
                    <li>Example: 1oz copper, 10°C rise: 1mm trace ≈ 1A capacity</li>
                </ul>
                
                <h3>Trace Spacing</h3>
                <ul>
                    <li><strong>Minimum Spacing:</strong> 0.1mm (4 mils) for standard designs</li>
                    <li><strong>High Voltage:</strong> Increased spacing (e.g., 0.5mm for 50V)</li>
                    <li><strong>Differential Pairs:</strong> Tight spacing within pair, wider spacing to other signals</li>
                </ul>
                
                <h3>Via Requirements</h3>
                <ul>
                    <li><strong>Minimum Via Size:</strong> 0.2mm hole, 0.4mm pad typical</li>
                    <li><strong>Aspect Ratio:</strong> Board thickness / via diameter < 10:1</li>
                    <li><strong>Via Pad Size:</strong> Hole diameter + 0.2mm minimum</li>
                    <li><strong>Via Spacing:</strong> Minimum 0.5mm between via centers</li>
                </ul>
                
                <h3>Component Placement Rules</h3>
                <ul>
                    <li>Keep components at least 0.5mm from board edge</li>
                    <li>Maintain clearance around connectors for mating</li>
                    <li>Group related components together</li>
                    <li>Consider assembly and rework access</li>
                    <li>Place decoupling capacitors close to IC power pins</li>
                </ul>
                
                <h3>Keep-Out Areas</h3>
                <ul>
                    <li><strong>Board Edge:</strong> 0.5-1mm clearance for routing</li>
                    <li><strong>Mounting Holes:</strong> Clearance around screw holes</li>
                    <li><strong>Connectors:</strong> Space for mating connectors</li>
                    <li><strong>Heatsinks:</strong> Clearance for thermal management</li>
                </ul>
                
                <h3>Design for Manufacturability (DFM)</h3>
                <ul>
                    <li>Use standard component sizes and packages</li>
                    <li>Avoid unnecessarily small features</li>
                    <li>Ensure adequate spacing for assembly</li>
                    <li>Use standard drill sizes when possible</li>
                    <li>Provide test points for debugging</li>
                    <li>Consider panelization for small boards</li>
                </ul>
                
                <h3>Design for Testability (DFT)</h3>
                <ul>
                    <li>Add test points for critical signals</li>
                    <li>Provide access to power and ground</li>
                    <li>Include test pads for boundary scan (JTAG)</li>
                    <li>Design for in-circuit testing (ICT) if needed</li>
                </ul>
            `
        },
        {
            title: 'Thermal Management',
            content: `
                <h3>Heat Generation</h3>
                <p>Components generate heat through power dissipation:</p>
                <div class="equation">P = V × I</div>
                <p>Power dissipation causes temperature rise, which must be managed to prevent:</p>
                <ul>
                    <li>Component failure or reduced lifespan</li>
                    <li>Performance degradation</li>
                    <li>Thermal stress on solder joints</li>
                </ul>
                
                <h3>Thermal Resistance</h3>
                <p>Thermal resistance (θ) measures how difficult it is for heat to flow:</p>
                <div class="equation">ΔT = P × θ</div>
                <p>Where:</p>
                <ul>
                    <li>ΔT = Temperature rise (°C)</li>
                    <li>P = Power dissipation (W)</li>
                    <li>θ = Thermal resistance (°C/W)</li>
                </ul>
                
                <h3>Thermal Vias</h3>
                <p>Thermal vias conduct heat from top to bottom layers:</p>
                <ul>
                    <li>Place under hot components (ICs, power devices)</li>
                    <li>Fill with solder or copper for better conduction</li>
                    <li>Connect to ground plane (acts as heat spreader)</li>
                    <li>Multiple small vias better than one large via</li>
                </ul>
                
                <h3>Heat Sinks</h3>
                <p>Heat sinks increase surface area for convection cooling:</p>
                <ul>
                    <li>Attached to hot components with thermal paste</li>
                    <li>Fins increase surface area</li>
                    <li>Require airflow for effectiveness</li>
                    <li>Thermal resistance: θ<sub>JA</sub> = θ<sub>JC</sub> + θ<sub>CS</sub> + θ<sub>SA</sub></li>
                </ul>
                
                <h3>Thermal Pads</h3>
                <p>Exposed copper pads on PCB act as heat spreaders:</p>
                <ul>
                    <li>Large copper areas under hot components</li>
                    <li>Connected to ground plane via thermal vias</li>
                    <li>May have solder mask removed for better heat transfer</li>
                </ul>
                
                <h3>Airflow Considerations</h3>
                <ul>
                    <li>Design for natural or forced convection</li>
                    <li>Ensure clear airflow paths</li>
                    <li>Position hot components near board edges</li>
                    <li>Consider enclosure ventilation</li>
                </ul>
                
                <h3>Power Dissipation Calculations</h3>
                <p>For linear regulators:</p>
                <div class="equation">P = (V<sub>in</sub> - V<sub>out</sub>) × I<sub>out</sub></div>
                <p>For switching regulators (more efficient):</p>
                <div class="equation">P = V<sub>out</sub> × I<sub>out</sub> × (1 - η) / η</div>
                <p>Where η is efficiency (typically 80-95%)</p>
            `
        },
        {
            title: 'High-Speed Design and Signal Integrity',
            content: `
                <h3>Signal Integrity Fundamentals</h3>
                <p>Signal integrity ensures signals arrive at destination with correct timing and voltage levels:</p>
                <ul>
                    <li><strong>Rise Time:</strong> Time for signal to transition from LOW to HIGH</li>
                    <li><strong>Propagation Delay:</strong> Time for signal to travel along trace</li>
                    <li><strong>Reflections:</strong> Signal bouncing due to impedance mismatch</li>
                    <li><strong>Crosstalk:</strong> Unwanted coupling between adjacent traces</li>
                </ul>
                
                <h3>Transmission Line Theory</h3>
                <p>At high frequencies, traces behave as transmission lines:</p>
                <ul>
                    <li><strong>Characteristic Impedance:</strong> Z<sub>0</sub> = √(L/C)</li>
                    <li><strong>Propagation Velocity:</strong> v = 1/√(LC) ≈ c/√ε<sub>r</sub></li>
                    <li><strong>Critical Length:</strong> l<sub>crit</sub> = t<sub>r</sub> / (2 × t<sub>pd</sub>)</li>
                    <li>If trace length > l<sub>crit</sub>, treat as transmission line</li>
                </ul>
                
                <h3>Impedance Control</h3>
                <p>Controlled impedance traces maintain signal quality:</p>
                <ul>
                    <li><strong>Microstrip:</strong> Trace on outer layer over ground plane</li>
                    <li><strong>Stripline:</strong> Trace between two ground planes</li>
                    <li><strong>Differential:</strong> Two traces with equal and opposite signals</li>
                    <li>Impedance calculated based on trace geometry and dielectric properties</li>
                </ul>
                
                <h3>Differential Signaling</h3>
                <p>Used for high-speed interfaces (USB, Ethernet, PCIe):</p>
                <ul>
                    <li>Two traces carry equal and opposite signals</li>
                    <li>Receiver detects difference between signals</li>
                    <li>Rejects common-mode noise</li>
                    <li>Requires tight coupling and length matching</li>
                    <li>Typical impedance: 90Ω or 100Ω differential</li>
                </ul>
                
                <h3>Crosstalk Prevention</h3>
                <ul>
                    <li><strong>3W Rule:</strong> Keep traces 3× trace width apart</li>
                    <li><strong>Ground Guard Traces:</strong> Ground traces between sensitive signals</li>
                    <li><strong>Layer Separation:</strong> Route on different layers with ground plane between</li>
                    <li><strong>Reduce Parallel Length:</strong> Minimize length of parallel traces</li>
                </ul>
                
                <h3>EMI/EMC Considerations</h3>
                <p><strong>Electromagnetic Interference (EMI):</strong> Unwanted emissions from board</p>
                <p><strong>Electromagnetic Compatibility (EMC):</strong> Board's ability to function in electromagnetic environment</p>
                <ul>
                    <li>Use ground planes to shield signals</li>
                    <li>Keep high-speed traces away from board edges</li>
                    <li>Add ground vias around high-speed signals</li>
                    <li>Use ferrite beads on power lines</li>
                    <li>Proper component placement and routing</li>
                </ul>
                
                <h3>Length Matching</h3>
                <p>For parallel signals (data buses, differential pairs):</p>
                <ul>
                    <li>Match trace lengths to maintain timing</li>
                    <li>Use serpentine routing to add length</li>
                    <li>Tolerance typically ±0.1mm for high-speed signals</li>
                    <li>Critical for DDR memory, PCIe, USB 3.0+</li>
                </ul>
            `
        },
        {
            title: 'Testing and Debugging',
            content: `
                <h3>Continuity Testing</h3>
                <p>Verify all connections are correct:</p>
                <ul>
                    <li>Use multimeter in continuity mode</li>
                    <li>Check all nets for shorts and opens</li>
                    <li>Verify power and ground connections</li>
                    <li>Test before powering on</li>
                </ul>
                
                <h3>Power-On Testing</h3>
                <p>Safe power-up procedure:</p>
                <ol>
                    <li>Check for shorts between power and ground</li>
                    <li>Verify correct voltage levels</li>
                    <li>Monitor current draw (should match expected)</li>
                    <li>Check for hot components (indicates problems)</li>
                    <li>Verify all power rails are present</li>
                </ol>
                
                <h3>Signal Probing</h3>
                <p><strong>Oscilloscope:</strong> View analog and digital signals in time domain</p>
                <ul>
                    <li>Measure voltage levels and timing</li>
                    <li>Check signal integrity (rise time, overshoot)</li>
                    <li>Debug communication protocols</li>
                    <li>Bandwidth should be 3-5× signal frequency</li>
                </ul>
                <p><strong>Logic Analyzer:</strong> Capture multiple digital signals</p>
                <ul>
                    <li>Decode protocols (I2C, SPI, UART)</li>
                    <li>Analyze timing relationships</li>
                    <li>Trigger on specific patterns</li>
                </ul>
                
                <h3>Common Failure Modes</h3>
                <ul>
                    <li><strong>Shorts:</strong> Two nets accidentally connected</li>
                    <li><strong>Opens:</strong> Broken connection or missing via</li>
                    <li><strong>Wrong Component:</strong> Incorrect part value or orientation</li>
                    <li><strong>Power Issues:</strong> Wrong voltage, insufficient current</li>
                    <li><strong>Signal Integrity:</strong> Reflections, crosstalk, EMI</li>
                    <li><strong>Thermal:</strong> Overheating causing failures</li>
                </ul>
                
                <h3>Debugging Techniques</h3>
                <ul>
                    <li><strong>Visual Inspection:</strong> Check for obvious problems (solder bridges, missing components)</li>
                    <li><strong>Voltage Measurements:</strong> Verify power rails and signal levels</li>
                    <li><strong>Current Measurements:</strong> Check for excessive current draw</li>
                    <li><strong>Signal Tracing:</strong> Follow signals from source to destination</li>
                    <li><strong>Component Testing:</strong> Test individual components if possible</li>
                    <li><strong>Compare with Working Board:</strong> If available, compare measurements</li>
                </ul>
                
                <h3>Test Points</h3>
                <p>Add test points for easy access:</p>
                <ul>
                    <li>Power and ground test points</li>
                    <li>Critical signal test points</li>
                    <li>Clock signals</li>
                    <li>Reset and enable signals</li>
                    <li>Use 0.5mm or 1mm pads for probe access</li>
                </ul>
            `
        },
        {
            title: 'Advanced Topics',
            content: `
                <h3>RF Circuit Design</h3>
                <p>Radio frequency circuits require special considerations:</p>
                <ul>
                    <li><strong>Impedance Matching:</strong> Match source, transmission line, and load impedances</li>
                    <li><strong>RF Traces:</strong> Controlled impedance, typically 50Ω</li>
                    <li><strong>Ground Planes:</strong> Solid ground planes essential</li>
                    <li><strong>Component Placement:</strong> Keep RF components close together</li>
                    <li><strong>Shielding:</strong> RF sections may need shielding cans</li>
                    <li><strong>Antenna Design:</strong> PCB trace antennas or external antennas</li>
                </ul>
                
                <h3>Mixed-Signal Design</h3>
                <p>Combining analog and digital circuits:</p>
                <ul>
                    <li><strong>Separate Grounds:</strong> Analog and digital ground planes</li>
                    <li><strong>Single Ground Point:</strong> Connect grounds at one point only</li>
                    <li><strong>Component Placement:</strong> Keep analog and digital sections separate</li>
                    <li><strong>Power Supply Isolation:</strong> Separate power supplies or filtering</li>
                    <li><strong>Routing:</strong> Keep digital traces away from analog sections</li>
                </ul>
                
                <h3>Power Supply Design</h3>
                <p><strong>Linear Regulators:</strong></p>
                <ul>
                    <li>Simple, low noise</li>
                    <li>Inefficient (P = (V<sub>in</sub> - V<sub>out</sub>) × I)</li>
                    <li>Good for low current, noise-sensitive applications</li>
                </ul>
                <p><strong>Switching Regulators:</strong></p>
                <ul>
                    <li>Efficient (80-95%)</li>
                    <li>More complex, requires inductors and capacitors</li>
                    <li>Can generate noise</li>
                    <li>Good for higher current applications</li>
                </ul>
                <p><strong>Power Supply Filtering:</strong></p>
                <ul>
                    <li>Input capacitors for bulk storage</li>
                    <li>Output capacitors for stability</li>
                    <li>Decoupling capacitors near ICs</li>
                    <li>Ferrite beads for high-frequency filtering</li>
                </ul>
                
                <h3>Clock Distribution</h3>
                <ul>
                    <li><strong>Clock Tree:</strong> Distribute clock to all components</li>
                    <li><strong>Length Matching:</strong> Equal path lengths for synchronous systems</li>
                    <li><strong>Termination:</strong> Proper termination to prevent reflections</li>
                    <li><strong>Jitter:</strong> Minimize clock jitter for reliable operation</li>
                </ul>
                
                <h3>Reset Circuits</h3>
                <ul>
                    <li><strong>Power-On Reset:</strong> Ensure clean startup</li>
                    <li><strong>Reset Button:</strong> Manual reset capability</li>
                    <li><strong>Watchdog Timer:</strong> Automatic reset on system hang</li>
                    <li><strong>Brown-Out Detection:</strong> Reset on low voltage</li>
                </ul>
                
                <h3>Protection Circuits</h3>
                <p><strong>ESD Protection:</strong></p>
                <ul>
                    <li>TVS diodes on I/O pins</li>
                    <li>ESD protection ICs</li>
                    <li>Prevent damage from static discharge</li>
                </ul>
                <p><strong>Overcurrent Protection:</strong></p>
                <ul>
                    <li>Fuses or PTCs (Polymer Positive Temperature Coefficient)</li>
                    <li>Current sense resistors</li>
                    <li>Protect against shorts and overloads</li>
                </ul>
                <p><strong>Overvoltage Protection:</strong></p>
                <ul>
                    <li>Zener diodes or TVS diodes</li>
                    <li>Voltage clamp circuits</li>
                    <li>Protect against voltage spikes</li>
                </ul>
            `
        },
        {
            title: 'Real-World Examples',
            content: `
                <h3>Simple LED Circuit Board</h3>
                <p>A basic board with LED and current-limiting resistor:</p>
                <ul>
                    <li><strong>Components:</strong> LED, resistor, power connector</li>
                    <li><strong>Design:</strong> Single-sided PCB, through-hole components</li>
                    <li><strong>Power:</strong> 5V DC input</li>
                    <li><strong>Current:</strong> ~20mA through LED</li>
                    <li><strong>Key Considerations:</strong> Correct resistor value, LED polarity</li>
                </ul>
                
                <h3>Sensor Interface Board</h3>
                <p>Board connecting sensors to microcontroller:</p>
                <ul>
                    <li><strong>Components:</strong> Microcontroller, sensors, level shifters, connectors</li>
                    <li><strong>Communication:</strong> I2C or SPI to sensors</li>
                    <li><strong>Power:</strong> 3.3V for sensors, 5V for microcontroller</li>
                    <li><strong>Key Considerations:</strong> Signal integrity, power filtering, pull-up resistors</li>
                </ul>
                
                <h3>Power Supply Board</h3>
                <p>Dedicated power supply module:</p>
                <ul>
                    <li><strong>Components:</strong> Switching regulator, input/output capacitors, inductors</li>
                    <li><strong>Input:</strong> 12V DC</li>
                    <li><strong>Output:</strong> 5V and 3.3V rails</li>
                    <li><strong>Key Considerations:</strong> Efficiency, thermal management, filtering, protection</li>
                </ul>
                
                <h3>Communication Module</h3>
                <p>WiFi or Bluetooth module board:</p>
                <ul>
                    <li><strong>Components:</strong> RF module, antenna, matching network, microcontroller</li>
                    <li><strong>RF Design:</strong> 50Ω impedance matching, antenna placement</li>
                    <li><strong>Key Considerations:</strong> RF layout, ground planes, EMI, antenna clearance</li>
                </ul>
                
                <h3>Complete System Board</h3>
                <p>Full-featured board with multiple functions:</p>
                <ul>
                    <li><strong>Components:</strong> CPU, memory, power management, communication, I/O</li>
                    <li><strong>Layers:</strong> 4-8 layer PCB</li>
                    <li><strong>Key Considerations:</strong> Power distribution, signal integrity, thermal management, EMI</li>
                    <li><strong>Examples:</strong> Raspberry Pi, Arduino, custom embedded systems</li>
                </ul>
            `
        },
        {
            title: 'Tools and Software',
            content: `
                <h3>PCB Design Software</h3>
                <p><strong>KiCad (Free, Open Source):</strong></p>
                <ul>
                    <li>Complete PCB design suite</li>
                    <li>Schematic capture and PCB layout</li>
                    <li>3D viewer and Gerber export</li>
                    <li>Active community and extensive libraries</li>
                </ul>
                <p><strong>Altium Designer (Commercial):</strong></p>
                <ul>
                    <li>Professional-grade tool</li>
                    <li>Advanced features and simulation</li>
                    <li>Used by many professional designers</li>
                </ul>
                <p><strong>Eagle (Now Fusion 360 Electronics):</strong></p>
                <ul>
                    <li>Popular hobbyist and professional tool</li>
                    <li>Integrated with Autodesk ecosystem</li>
                    <li>Extensive component libraries</li>
                </ul>
                <p><strong>EasyEDA (Online):</strong></p>
                <ul>
                    <li>Web-based PCB design</li>
                    <li>Integrated with JLCPCB manufacturing</li>
                    <li>Good for simple to medium complexity designs</li>
                </ul>
                
                <h3>Simulation Tools</h3>
                <p><strong>SPICE Simulators:</strong></p>
                <ul>
                    <li>LTspice (Free, Linear Technology)</li>
                    <li>ngspice (Open source)</li>
                    <li>Simulate circuit behavior before building</li>
                </ul>
                <p><strong>Signal Integrity Tools:</strong></p>
                <ul>
                    <li>Impedance calculators (online tools)</li>
                    <li>Field solvers for complex geometries</li>
                    <li>Simulate signal propagation and reflections</li>
                </ul>
                
                <h3>Manufacturing Preparation</h3>
                <ul>
                    <li><strong>Gerber Viewers:</strong> Verify Gerber files before sending to manufacturer</li>
                    <li><strong>DFM Checkers:</strong> Verify design meets manufacturing constraints</li>
                    <li><strong>Panelization Tools:</strong> Arrange multiple boards on panel</li>
                </ul>
                
                <h3>Component Libraries</h3>
                <ul>
                    <li>Create custom footprints for components</li>
                    <li>Use manufacturer-provided libraries</li>
                    <li>Community libraries (KiCad, Eagle)</li>
                    <li>Verify footprints match actual components</li>
                </ul>
            `
        },
        {
            title: 'Best Practices',
            content: `
                <ul>
                    <li><strong>Power Planning:</strong> Calculate total power requirements before designing</li>
                    <li><strong>Ground Strategy:</strong> Use solid ground planes, avoid ground loops</li>
                    <li><strong>Signal Integrity:</strong> Keep high-speed traces short and away from noise sources</li>
                    <li><strong>Component Placement:</strong> Group related components together</li>
                    <li><strong>Thermal Management:</strong> Provide adequate cooling for power-hungry components</li>
                    <li><strong>Testing:</strong> Use oscilloscopes and multimeters to verify designs</li>
                    <li><strong>Documentation:</strong> Keep schematics and layout files organized</li>
                    <li><strong>Version Control:</strong> Use version control for design files</li>
                    <li><strong>Design Reviews:</strong> Have designs reviewed before manufacturing</li>
                    <li><strong>Prototyping:</strong> Build and test prototypes before full production</li>
                    <li><strong>Component Selection:</strong> Choose components with good availability and documentation</li>
                    <li><strong>Cost Optimization:</strong> Balance performance, reliability, and cost</li>
                </ul>
            `
        }
    ]
};

