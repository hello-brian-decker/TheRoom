/**
 * ESP32 DevKit Board Data
 */

export const esp32Data = {
    name: 'ESP32 DevKit V1',
    dimensions: { width: 55, height: 28 },
    scale: 5,
    
    components: [
        {
            id: 'mcu',
            name: 'ESP32-WROOM-32',
            type: 'Microcontroller',
            description: 'Dual-core Xtensa LX6 @ 240MHz, WiFi, Bluetooth, 520KB SRAM',
            position: { x: 27.5, y: 14 },
            size: { width: 18, height: 18 },
            pins: 30,
            color: '#4a90e2',
            connections: ['gpio', 'power', 'antenna']
        },
        {
            id: 'gpio',
            name: 'GPIO Pins',
            type: 'GPIO',
            description: '30 GPIO pins with multiple functions (ADC, DAC, PWM, I2C, SPI, UART)',
            position: { x: 5, y: 20 },
            size: { width: 45, height: 5 },
            color: '#50c878',
            pins: 30,
            pinMapping: [
                { pin: 0, name: 'GPIO0', type: 'gpio', function: 'Boot' },
                { pin: 1, name: 'GPIO1', type: 'gpio', function: 'TX' },
                { pin: 2, name: 'GPIO2', type: 'gpio' },
                { pin: 3, name: 'GPIO3', type: 'gpio', function: 'RX' },
                { pin: 4, name: 'GPIO4', type: 'gpio' },
                { pin: 5, name: 'GPIO5', type: 'gpio' },
                { pin: 12, name: 'GPIO12', type: 'gpio' },
                { pin: 13, name: 'GPIO13', type: 'gpio' },
                { pin: 14, name: 'GPIO14', type: 'gpio' },
                { pin: 15, name: 'GPIO15', type: 'gpio' },
                { pin: 16, name: 'GPIO16', type: 'gpio' },
                { pin: 17, name: 'GPIO17', type: 'gpio' },
                { pin: 18, name: 'GPIO18', type: 'gpio', function: 'I2C' },
                { pin: 19, name: 'GPIO19', type: 'gpio', function: 'I2C' },
                { pin: 21, name: 'GPIO21', type: 'gpio', function: 'I2C' },
                { pin: 22, name: 'GPIO22', type: 'gpio', function: 'I2C' },
                { pin: 23, name: 'GPIO23', type: 'gpio', function: 'SPI' },
                { pin: 25, name: 'GPIO25', type: 'gpio', function: 'DAC' },
                { pin: 26, name: 'GPIO26', type: 'gpio', function: 'DAC' },
                { pin: 27, name: 'GPIO27', type: 'gpio' },
                { pin: 32, name: 'GPIO32', type: 'gpio', function: 'ADC' },
                { pin: 33, name: 'GPIO33', type: 'gpio', function: 'ADC' },
                { pin: 34, name: 'GPIO34', type: 'gpio', function: 'ADC' },
                { pin: 35, name: 'GPIO35', type: 'gpio', function: 'ADC' }
            ],
            connections: ['mcu']
        },
        {
            id: 'power',
            name: 'Power Pins',
            type: 'Power',
            description: '5V, 3.3V, GND power pins',
            position: { x: 35, y: 3 },
            size: { width: 15, height: 5 },
            color: '#ff6b6b',
            pins: 3,
            pinMapping: [
                { pin: 0, name: '5V', type: 'power', voltage: 5 },
                { pin: 1, name: 'GND', type: 'ground' },
                { pin: 2, name: '3.3V', type: 'power', voltage: 3.3 }
            ],
            connections: ['usb', 'regulator']
        },
        {
            id: 'usb',
            name: 'USB-C Connector',
            type: 'Connector',
            description: 'USB-C for power and programming',
            position: { x: 45, y: 12 },
            size: { width: 6, height: 6 },
            color: '#3498db',
            connections: ['regulator', 'mcu']
        },
        {
            id: 'regulator',
            name: 'Voltage Regulator',
            type: 'Power',
            description: '5V to 3.3V step-down regulator',
            position: { x: 40, y: 8 },
            size: { width: 5, height: 3 },
            color: '#f39c12',
            connections: ['usb', 'power', 'mcu']
        },
        {
            id: 'antenna',
            name: 'WiFi/Bluetooth Antenna',
            type: 'Antenna',
            description: 'PCB trace antenna for 2.4GHz WiFi and Bluetooth',
            position: { x: 10, y: 5 },
            size: { width: 8, height: 4 },
            color: '#e74c3c',
            connections: ['mcu']
        },
        {
            id: 'flash',
            name: 'Flash Memory',
            type: 'Memory',
            description: '4MB SPI flash for program storage',
            position: { x: 20, y: 8 },
            size: { width: 6, height: 4 },
            color: '#7b68ee',
            connections: ['mcu']
        }
    ],
    
    layers: {
        power: [
            { from: 'usb', to: 'regulator', voltage: 5.0 },
            { from: 'regulator', to: 'power', voltage: 3.3 },
            { from: 'regulator', to: 'mcu', voltage: 3.3 },
            { from: 'usb', to: 'power', voltage: 5.0 }
        ],
        ground: [
            { component: 'usb', connected: true },
            { component: 'mcu', connected: true },
            { component: 'power', connected: true },
            { component: 'gpio', connected: true }
        ],
        signals: [
            { from: 'mcu', to: 'gpio', type: 'GPIO', bus: 'GPIO' },
            { from: 'mcu', to: 'flash', type: 'SPI', bus: 'SPI' },
            { from: 'mcu', to: 'antenna', type: 'RF', bus: '2.4GHz' },
            { from: 'mcu', to: 'usb', type: 'USB', bus: 'USB2' }
        ]
    },
    
    power: {
        input: { voltage: 5.0, current: 0.5 },
        outputs: [
            { name: '3.3V', voltage: 3.3, maxCurrent: 0.5 },
            { name: '5V', voltage: 5.0, maxCurrent: 0.2 }
        ]
    }
};

