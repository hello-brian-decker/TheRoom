/**
 * Raspberry Pi 4 Model B Board Data
 */

export const raspberryPi4Data = {
    name: 'Raspberry Pi 4 Model B',
    dimensions: { width: 88, height: 58 }, // mm, scaled for display
    scale: 4, // pixels per mm
    
    components: [
        {
            id: 'cpu',
            name: 'BCM2711',
            type: 'CPU',
            description: 'Broadcom BCM2711 Quad-core Cortex-A72 (ARM v8) 64-bit SoC @ 1.8GHz',
            position: { x: 44, y: 29 },
            size: { width: 15, height: 15 },
            pins: 0, // BGA package
            color: '#4a90e2',
            connections: ['ram', 'usb', 'ethernet', 'gpio']
        },
        {
            id: 'ram',
            name: 'LPDDR4 RAM',
            type: 'Memory',
            description: '2GB/4GB/8GB LPDDR4-3200 SDRAM',
            position: { x: 44, y: 15 },
            size: { width: 12, height: 8 },
            color: '#7b68ee',
            connections: ['cpu']
        },
        {
            id: 'gpio',
            name: '40-Pin GPIO Header',
            type: 'Connector',
            description: 'GPIO pins for digital I/O, PWM, I2C, SPI, UART',
            position: { x: 10, y: 50 },
            size: { width: 52, height: 5 },
            color: '#50c878',
            pins: 40,
            pinMapping: [
                { pin: 1, name: '3.3V', type: 'power' },
                { pin: 2, name: '5V', type: 'power' },
                { pin: 3, name: 'GPIO2 (SDA)', type: 'gpio', function: 'I2C' },
                { pin: 4, name: '5V', type: 'power' },
                { pin: 5, name: 'GPIO3 (SCL)', type: 'gpio', function: 'I2C' },
                { pin: 6, name: 'GND', type: 'ground' },
                { pin: 7, name: 'GPIO4', type: 'gpio' },
                { pin: 8, name: 'GPIO14 (TXD)', type: 'gpio', function: 'UART' },
                { pin: 9, name: 'GND', type: 'ground' },
                { pin: 10, name: 'GPIO15 (RXD)', type: 'gpio', function: 'UART' },
                { pin: 11, name: 'GPIO17', type: 'gpio' },
                { pin: 12, name: 'GPIO18 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 13, name: 'GPIO27', type: 'gpio' },
                { pin: 14, name: 'GND', type: 'ground' },
                { pin: 15, name: 'GPIO22', type: 'gpio' },
                { pin: 16, name: 'GPIO23', type: 'gpio' },
                { pin: 17, name: '3.3V', type: 'power' },
                { pin: 18, name: 'GPIO24', type: 'gpio' },
                { pin: 19, name: 'GPIO10 (MOSI)', type: 'gpio', function: 'SPI' },
                { pin: 20, name: 'GND', type: 'ground' },
                { pin: 21, name: 'GPIO9 (MISO)', type: 'gpio', function: 'SPI' },
                { pin: 22, name: 'GPIO25', type: 'gpio' },
                { pin: 23, name: 'GPIO11 (SCLK)', type: 'gpio', function: 'SPI' },
                { pin: 24, name: 'GPIO8 (CE0)', type: 'gpio', function: 'SPI' },
                { pin: 25, name: 'GND', type: 'ground' },
                { pin: 26, name: 'GPIO7 (CE1)', type: 'gpio', function: 'SPI' },
                { pin: 27, name: 'GPIO0 (ID_SD)', type: 'gpio' },
                { pin: 28, name: 'GPIO1 (ID_SC)', type: 'gpio' },
                { pin: 29, name: 'GPIO5', type: 'gpio' },
                { pin: 30, name: 'GND', type: 'ground' },
                { pin: 31, name: 'GPIO6', type: 'gpio' },
                { pin: 32, name: 'GPIO12 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 33, name: 'GPIO13 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 34, name: 'GND', type: 'ground' },
                { pin: 35, name: 'GPIO19 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 36, name: 'GPIO16', type: 'gpio' },
                { pin: 37, name: 'GPIO26', type: 'gpio' },
                { pin: 38, name: 'GPIO20 (PWM)', type: 'gpio', function: 'PWM' },
                { pin: 39, name: 'GND', type: 'ground' },
                { pin: 40, name: 'GPIO21 (PWM)', type: 'gpio', function: 'PWM' }
            ],
            connections: ['cpu']
        },
        {
            id: 'usb-c',
            name: 'USB-C Power',
            type: 'Power',
            description: '5V USB-C power input (5V, 3A minimum)',
            position: { x: 75, y: 5 },
            size: { width: 8, height: 4 },
            color: '#ff6b6b',
            connections: ['power-regulator']
        },
        {
            id: 'usb',
            name: 'USB 3.0 Ports',
            type: 'Connector',
            description: '2x USB 3.0, 2x USB 2.0 ports',
            position: { x: 75, y: 20 },
            size: { width: 8, height: 12 },
            color: '#3498db',
            connections: ['cpu']
        },
        {
            id: 'ethernet',
            name: 'Gigabit Ethernet',
            type: 'Connector',
            description: 'Gigabit Ethernet port',
            position: { x: 75, y: 35 },
            size: { width: 12, height: 8 },
            color: '#95a5a6',
            connections: ['cpu']
        },
        {
            id: 'hdmi',
            name: 'HDMI Ports',
            type: 'Connector',
            description: '2x Micro HDMI ports (4K support)',
            position: { x: 5, y: 5 },
            size: { width: 6, height: 8 },
            color: '#e74c3c',
            connections: ['cpu']
        },
        {
            id: 'power-regulator',
            name: 'Power Regulators',
            type: 'Power',
            description: '5V to 3.3V step-down regulators',
            position: { x: 60, y: 45 },
            size: { width: 10, height: 6 },
            color: '#f39c12',
            connections: ['usb-c', 'cpu', 'gpio']
        },
        {
            id: 'crystal',
            name: 'Crystal Oscillator',
            type: 'Oscillator',
            description: '54MHz crystal for system clock',
            position: { x: 30, y: 40 },
            size: { width: 4, height: 3 },
            color: '#9b59b6',
            connections: ['cpu']
        }
    ],
    
    layers: {
        power: [
            { from: 'usb-c', to: 'power-regulator', voltage: 5.0 },
            { from: 'power-regulator', to: 'cpu', voltage: 3.3 },
            { from: 'power-regulator', to: 'gpio', voltage: 3.3 },
            { from: 'usb-c', to: 'gpio', voltage: 5.0 }
        ],
        ground: [
            { component: 'usb-c', connected: true },
            { component: 'cpu', connected: true },
            { component: 'gpio', connected: true },
            { component: 'usb', connected: true },
            { component: 'ethernet', connected: true }
        ],
        signals: [
            { from: 'cpu', to: 'gpio', type: 'GPIO', bus: 'GPIO' },
            { from: 'cpu', to: 'usb', type: 'USB', bus: 'USB3' },
            { from: 'cpu', to: 'ethernet', type: 'Ethernet', bus: 'Gigabit' },
            { from: 'cpu', to: 'ram', type: 'Memory', bus: 'LPDDR4' }
        ]
    },
    
    power: {
        input: { voltage: 5.0, current: 3.0 },
        outputs: [
            { name: '3.3V', voltage: 3.3, maxCurrent: 0.5 },
            { name: '5V', voltage: 5.0, maxCurrent: 2.5 }
        ]
    }
};

