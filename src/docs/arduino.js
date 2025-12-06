/**
 * Arduino Documentation
 */

export const arduinoDocumentation = {
    title: 'Arduino Programming and Electronics',
    sections: [
        {
            title: 'What is Arduino?',
            content: `
                <p>Arduino is an open-source electronics platform based on easy-to-use hardware and software. It consists of a programmable microcontroller board and a development environment for writing code.</p>
                <p>Arduino boards can read inputs (sensor data, button presses) and turn them into outputs (activating motors, turning on LEDs, publishing data online).</p>
            `
        },
        {
            title: 'Arduino Hardware',
            content: `
                <h3>Microcontroller</h3>
                <p>The Arduino Uno uses an ATmega328P microcontroller running at 16 MHz. It has:</p>
                <ul>
                    <li>14 digital I/O pins (pins 0-13)</li>
                    <li>6 analog input pins (A0-A5)</li>
                    <li>6 PWM-capable pins (3, 5, 6, 9, 10, 11)</li>
                    <li>32 KB flash memory for program storage</li>
                    <li>2 KB SRAM for variables</li>
                    <li>1 KB EEPROM for non-volatile storage</li>
                </ul>
                
                <h3>Power</h3>
                <ul>
                    <li>5V pin: Provides 5V regulated power</li>
                    <li>3.3V pin: Provides 3.3V regulated power</li>
                    <li>GND: Ground reference (0V)</li>
                    <li>VIN: Unregulated input voltage (7-12V recommended)</li>
                </ul>
            `
        },
        {
            title: 'Arduino Program Structure',
            content: `
                <h3>setup() Function</h3>
                <p>Runs once when the Arduino starts or resets. Used for initialization:</p>
                <pre><code>void setup() {
    pinMode(13, OUTPUT);  // Set pin 13 as output
    Serial.begin(9600);   // Initialize serial communication
}</code></pre>
                
                <h3>loop() Function</h3>
                <p>Runs continuously after setup(). Contains the main program logic:</p>
                <pre><code>void loop() {
    digitalWrite(13, HIGH);  // Turn LED on
    delay(1000);              // Wait 1 second
    digitalWrite(13, LOW);    // Turn LED off
    delay(1000);              // Wait 1 second
}</code></pre>
            `
        },
        {
            title: 'Digital I/O Functions',
            content: `
                <h3>pinMode(pin, mode)</h3>
                <p>Configures a pin as INPUT or OUTPUT:</p>
                <pre><code>pinMode(13, OUTPUT);  // Pin 13 as output
pinMode(2, INPUT);    // Pin 2 as input</code></pre>
                
                <h3>digitalWrite(pin, value)</h3>
                <p>Sets a digital pin HIGH (5V) or LOW (0V):</p>
                <pre><code>digitalWrite(13, HIGH);  // Turn on
digitalWrite(13, LOW);   // Turn off</code></pre>
                
                <h3>digitalRead(pin)</h3>
                <p>Reads the value from a digital pin (returns HIGH or LOW):</p>
                <pre><code>int buttonState = digitalRead(2);
if (buttonState == HIGH) {
    // Button is pressed
}</code></pre>
            `
        },
        {
            title: 'Analog I/O Functions',
            content: `
                <h3>analogRead(pin)</h3>
                <p>Reads analog voltage from analog pin (A0-A5). Returns 0-1023 (0V to 5V):</p>
                <pre><code>int sensorValue = analogRead(A0);
// sensorValue ranges from 0 to 1023
float voltage = sensorValue * (5.0 / 1023.0);</code></pre>
                
                <h3>analogWrite(pin, value)</h3>
                <p>Writes PWM signal to pin. Value ranges 0-255 (0% to 100% duty cycle):</p>
                <pre><code>analogWrite(9, 128);  // 50% brightness
analogWrite(9, 255);  // 100% brightness
analogWrite(9, 0);    // 0% brightness (off)</code></pre>
                <p><strong>Note:</strong> Only works on PWM-capable pins (3, 5, 6, 9, 10, 11)</p>
            `
        },
        {
            title: 'Time Functions',
            content: `
                <h3>delay(ms)</h3>
                <p>Pauses program execution for specified milliseconds:</p>
                <pre><code>delay(1000);  // Wait 1 second
delay(500);   // Wait 0.5 seconds</code></pre>
                
                <h3>delayMicroseconds(us)</h3>
                <p>Pauses for microseconds (more precise timing):</p>
                <pre><code>delayMicroseconds(1000);  // Wait 1000 microseconds</code></pre>
                
                <h3>millis()</h3>
                <p>Returns milliseconds since Arduino started (non-blocking timing):</p>
                <pre><code>unsigned long currentTime = millis();
if (currentTime - lastTime > 1000) {
    // Do something every second
    lastTime = currentTime;
}</code></pre>
            `
        },
        {
            title: 'Serial Communication',
            content: `
                <h3>Serial.begin(baud)</h3>
                <p>Initializes serial communication at specified baud rate:</p>
                <pre><code>Serial.begin(9600);  // 9600 bits per second</code></pre>
                
                <h3>Serial.print() / Serial.println()</h3>
                <p>Prints data to serial monitor:</p>
                <pre><code>Serial.print("Hello");
Serial.println("World");  // Adds newline
Serial.print(42);
Serial.print("Temperature: ");
Serial.println(temperature);</code></pre>
                
                <h3>Serial.read()</h3>
                <p>Reads incoming serial data:</p>
                <pre><code>if (Serial.available() > 0) {
    int data = Serial.read();
}</code></pre>
            `
        },
        {
            title: 'Common Components',
            content: `
                <h3>LED (Light Emitting Diode)</h3>
                <p>Requires current-limiting resistor (typically 220Ω-1kΩ). Connect anode to pin, cathode to GND.</p>
                
                <h3>Button/Switch</h3>
                <p>Requires pull-up or pull-down resistor. Use INPUT_PULLUP mode for built-in pull-up:</p>
                <pre><code>pinMode(2, INPUT_PULLUP);
int buttonState = digitalRead(2);</code></pre>
                
                <h3>Potentiometer</h3>
                <p>Variable resistor. Connect outer pins to 5V and GND, middle pin to analog input.</p>
                
                <h3>Servo Motor</h3>
                <p>Controlled with PWM. Use Servo library:</p>
                <pre><code>#include &lt;Servo.h&gt;
Servo myservo;
myservo.attach(9);
myservo.write(90);  // 0-180 degrees</code></pre>
                
                <h3>Resistor</h3>
                <p>Current-limiting component. Color bands indicate value. Common values: 220Ω, 1kΩ, 10kΩ.</p>
            `
        },
        {
            title: 'Programming Concepts',
            content: `
                <h3>Variables</h3>
                <pre><code>int ledPin = 13;           // Integer
float temperature = 25.5;  // Floating point
bool isOn = true;          // Boolean
char letter = 'A';         // Character</code></pre>
                
                <h3>Control Structures</h3>
                <pre><code>// If statement
if (sensorValue > 500) {
    digitalWrite(13, HIGH);
} else {
    digitalWrite(13, LOW);
}

// For loop
for (int i = 0; i < 10; i++) {
    digitalWrite(13, HIGH);
    delay(100);
    digitalWrite(13, LOW);
    delay(100);
}

// While loop
while (buttonPressed) {
    // Do something
}</code></pre>
            `
        },
        {
            title: 'Best Practices',
            content: `
                <ul>
                    <li><strong>Always use current-limiting resistors</strong> with LEDs to prevent damage</li>
                    <li><strong>Use INPUT_PULLUP</strong> for buttons to avoid floating pins</li>
                    <li><strong>Avoid blocking delays</strong> in time-sensitive applications - use millis() instead</li>
                    <li><strong>Initialize serial</strong> in setup() before using Serial functions</li>
                    <li><strong>Use descriptive variable names</strong> for better code readability</li>
                    <li><strong>Comment your code</strong> to explain complex logic</li>
                    <li><strong>Test incrementally</strong> - build and test small parts before combining</li>
                </ul>
            `
        },
        {
            title: 'Common Projects',
            content: `
                <ul>
                    <li><strong>Blink LED:</strong> First Arduino project - turn LED on/off</li>
                    <li><strong>Button Control:</strong> Toggle LED with button press</li>
                    <li><strong>Potentiometer Dimmer:</strong> Control LED brightness with potentiometer</li>
                    <li><strong>Temperature Sensor:</strong> Read temperature and display on serial monitor</li>
                    <li><strong>Servo Control:</strong> Move servo motor to different positions</li>
                    <li><strong>Traffic Light:</strong> Sequence multiple LEDs</li>
                    <li><strong>Distance Sensor:</strong> Measure distance with ultrasonic sensor</li>
                </ul>
            `
        },
        {
            title: 'Troubleshooting',
            content: `
                <h3>LED Not Lighting</h3>
                <ul>
                    <li>Check polarity (anode/cathode)</li>
                    <li>Verify resistor is connected</li>
                    <li>Check pin is set to OUTPUT</li>
                    <li>Verify pin number in code matches wiring</li>
                </ul>
                
                <h3>Button Not Working</h3>
                <ul>
                    <li>Use INPUT_PULLUP mode</li>
                    <li>Check wiring connections</li>
                    <li>Verify button state logic (HIGH/LOW)</li>
                </ul>
                
                <h3>Serial Not Showing</h3>
                <ul>
                    <li>Check baud rate matches Serial Monitor</li>
                    <li>Verify Serial.begin() is called</li>
                    <li>Check USB connection</li>
                </ul>
            `
        }
    ]
};

