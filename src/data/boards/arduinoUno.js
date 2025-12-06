/**
 * Arduino Uno Board Data
 */

export const arduinoUnoData = {
    name: 'Arduino Uno R3',
    dimensions: { width: 68.6, height: 53.4 },
    scale: 4,
    
    components: [
        {
            id: 'mcu',
            name: 'ATmega328P',
            type: 'Microcontroller',
            description: '8-bit AVR microcontroller @ 16MHz, 32KB flash, 2KB SRAM',
            position: { x: 34, y: 27 },
            size: { width: 14, height: 14 },
            pins: 28,
            color: '#4a90e2',
            connections: ['digital-pins', 'analog-pins', 'power', 'crystal']
        },
        {
            id: 'digital-pins',
            name: 'Digital Pins',
            type: 'GPIO',
            description: '14 digital I/O pins (0-13), 6 support PWM',
            position: { x: 5, y: 45 },
            size: { width: 58, height: 5 },
            color: '#50c878',
            pins: 14,
            pinMapping: [
                { pin: 0, name: 'RX', type: 'gpio', function: 'UART' },
                { pin: 1, name: 'TX', type: 'gpio', function: 'UART' },
                { pin: 2, name: 'D2', type: 'gpio' },
                { pin: 3, name: 'D3 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 4, name: 'D4', type: 'gpio' },
                { pin: 5, name: 'D5 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 6, name: 'D6 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 7, name: 'D7', type: 'gpio' },
                { pin: 8, name: 'D8', type: 'gpio' },
                { pin: 9, name: 'D9 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 10, name: 'D10 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 11, name: 'D11 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 12, name: 'D12', type: 'gpio' },
                { pin: 13, name: 'D13 (LED)', type: 'gpio' }
            ],
            connections: ['mcu']
        },
        {
            id: 'analog-pins',
            name: 'Analog Input Pins',
            type: 'ADC',
            description: '6 analog input pins (A0-A5), 10-bit ADC (0-1023)',
            position: { x: 5, y: 3 },
            size: { width: 20, height: 5 },
            color: '#e67e22',
            pins: 6,
            pinMapping: [
                { pin: 0, name: 'A0', type: 'analog' },
                { pin: 1, name: 'A1', type: 'analog' },
                { pin: 2, name: 'A2', type: 'analog' },
                { pin: 3, name: 'A3', type: 'analog' },
                { pin: 4, name: 'A4 (SDA)', type: 'analog', function: 'I2C' },
                { pin: 5, name: 'A5 (SCL)', type: 'analog', function: 'I2C' }
            ],
            connections: ['mcu']
        },
        {
            id: 'power',
            name: 'Power Pins',
            type: 'Power',
            description: '5V, 3.3V, GND, VIN power pins',
            position: { x: 45, y: 3 },
            size: { width: 18, height: 5 },
            color: '#ff6b6b',
            pins: 4,
            pinMapping: [
                { pin: 0, name: 'VIN', type: 'power', voltage: 7 },
                { pin: 1, name: 'GND', type: 'ground' },
                { pin: 2, name: '5V', type: 'power', voltage: 5 },
                { pin: 3, name: '3.3V', type: 'power', voltage: 3.3 }
            ],
            connections: ['regulator', 'usb']
        },
        {
            id: 'usb',
            name: 'USB-B Connector',
            type: 'Connector',
            description: 'USB connection for power and programming',
            position: { x: 60, y: 25 },
            size: { width: 6, height: 8 },
            color: '#3498db',
            connections: ['regulator', 'mcu']
        },
        {
            id: 'regulator',
            name: 'Voltage Regulator',
            type: 'Power',
            description: '5V to 3.3V linear regulator',
            position: { x: 50, y: 15 },
            size: { width: 6, height: 4 },
            color: '#f39c12',
            connections: ['usb', 'power', 'mcu']
        },
        {
            id: 'crystal',
            name: '16MHz Crystal',
            type: 'Oscillator',
            description: '16MHz crystal oscillator for system clock',
            position: { x: 20, y: 20 },
            size: { width: 4, height: 3 },
            color: '#9b59b6',
            connections: ['mcu']
        },
        {
            id: 'led',
            name: 'Built-in LED',
            type: 'LED',
            description: 'LED connected to pin 13',
            position: { x: 15, y: 40 },
            size: { width: 2, height: 2 },
            color: '#ffd700',
            connections: ['mcu']
        }
    ],
    
    layers: {
        power: [
            { from: 'usb', to: 'regulator', voltage: 5.0 },
            { from: 'regulator', to: 'power', voltage: 3.3 },
            { from: 'usb', to: 'power', voltage: 5.0 },
            { from: 'power', to: 'mcu', voltage: 5.0 }
        ],
        ground: [
            { component: 'usb', connected: true },
            { component: 'mcu', connected: true },
            { component: 'power', connected: true },
            { component: 'digital-pins', connected: true },
            { component: 'analog-pins', connected: true }
        ],
        signals: [
            { from: 'mcu', to: 'digital-pins', type: 'GPIO', bus: 'Digital' },
            { from: 'mcu', to: 'analog-pins', type: 'ADC', bus: 'Analog' },
            { from: 'mcu', to: 'usb', type: 'USB', bus: 'USB2' }
        ]
    },
    
    power: {
        input: { voltage: 5.0, current: 0.5 },
        outputs: [
            { name: '5V', voltage: 5.0, maxCurrent: 0.4 },
            { name: '3.3V', voltage: 3.3, maxCurrent: 0.05 }
        ]
    }
};

