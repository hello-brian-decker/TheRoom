/**
 * Pendulum Systems Documentation
 */

export const pendulumDocumentation = {
    overview: `Pendulums are among the most studied systems in physics, demonstrating oscillatory motion, energy 
    conservation, and chaos theory. From the simple pendulum's predictable oscillations to the double pendulum's 
    chaotic behavior, these systems illustrate fundamental principles of classical mechanics.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'θ\'\' + (g/L)sin(θ) = 0',
                description: 'Nonlinear pendulum equation (exact, for all angles)',
                variables: 'θ = angle, g = gravitational acceleration, L = length'
            },
            {
                formula: 'θ\'\' + (g/L)θ = 0',
                description: 'Linearized pendulum equation (small angle approximation)',
                variables: 'Valid for |θ| << 1 radian'
            },
            {
                formula: 'T = 2π√(L/g)',
                description: 'Period of simple pendulum (small angle approximation)',
                variables: 'T = period, independent of mass and amplitude'
            },
            {
                formula: 'ω₀ = √(g/L)',
                description: 'Natural angular frequency',
                variables: 'ω₀ = angular frequency'
            },
            {
                formula: 'E = ½mv² + mgh = ½mL²θ\'² + mgL(1 - cos(θ))',
                description: 'Total mechanical energy (kinetic + potential)',
                variables: 'h = L(1 - cos(θ)) = vertical height'
            },
            {
                formula: 'θ(t) = θ₀cos(ω₀t)',
                description: 'Solution for small-angle harmonic motion',
                variables: 'θ₀ = initial angle'
            },
            {
                formula: 'T ≈ 2π√(L/g)[1 + (1/16)θ₀² + ...]',
                description: 'Period correction for large amplitudes (series expansion)',
                variables: ''
            },
            {
                formula: 'θ\'\'₁ = -(g/L₁)sin(θ₁) - (m₂L₂/(m₁L₁))[θ\'\'₂cos(θ₁-θ₂) + θ\'₂²sin(θ₁-θ₂)]',
                description: 'Double pendulum: first mass equation',
                variables: 'Subscripts 1,2 refer to first and second masses'
            },
            {
                formula: 'θ\'\'₂ = -(g/L₂)sin(θ₂) - (L₁/L₂)[θ\'\'₁cos(θ₁-θ₂) - θ\'₁²sin(θ₁-θ₂)]',
                description: 'Double pendulum: second mass equation',
                variables: ''
            }
        ],
        concepts: [
            {
                name: 'Simple Harmonic Motion',
                description: `For small angles (θ << 1), sin(θ) ≈ θ, and the pendulum equation becomes that of 
                a simple harmonic oscillator. The motion is sinusoidal with constant period, independent of amplitude. 
                This is an excellent approximation for angles less than about 15°.`
            },
            {
                name: 'Energy Conservation',
                description: `In the absence of damping, total mechanical energy (kinetic + potential) is conserved. 
                At the extremes, all energy is potential. At the bottom, all energy is kinetic. The continuous 
                exchange between these forms creates the oscillatory motion.`
            },
            {
                name: 'Large Amplitude Effects',
                description: `For large amplitudes, the period increases because the restoring force becomes 
                nonlinear. The exact period involves elliptic integrals. The period becomes infinite as the amplitude 
                approaches 180° (inverted pendulum).`
            },
            {
                name: 'Double Pendulum and Chaos',
                description: `The double pendulum exhibits chaotic motion for most initial conditions. Small changes 
                in initial conditions lead to exponentially diverging trajectories. This is a classic example of 
                deterministic chaos - the motion is governed by deterministic equations but appears random.`
            },
            {
                name: 'Coupled Pendulums',
                description: `When two pendulums are connected (e.g., by a spring), energy transfers between them. 
                The system exhibits normal modes - specific patterns where both pendulums oscillate at the same 
                frequency. This is fundamental to understanding wave propagation and resonance.`
            },
            {
                name: 'Damping',
                description: `Real pendulums lose energy due to air resistance and friction. This is modeled by 
                adding a damping term proportional to velocity: θ'' + 2ζω₀θ' + ω₀²θ = 0, where ζ is the damping 
                ratio. Underdamped systems oscillate with decreasing amplitude.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Timekeeping: Pendulum clocks were the most accurate timekeepers for centuries',
            'Seismology: Pendulum seismometers detect and measure earthquakes',
            'Structural engineering: Understanding pendulum dynamics helps design earthquake-resistant buildings',
            'Mechanical systems: Tuned mass dampers use pendulum principles to reduce vibrations',
            'Navigation: Foucault pendulum demonstrates Earth\'s rotation',
            'Energy harvesting: Pendulum-based systems convert mechanical motion to electrical energy'
        ],
        physics: [
            'Classical mechanics: Fundamental example of oscillatory systems and energy conservation',
            'Chaos theory: Double pendulum is a canonical example of deterministic chaos',
            'Nonlinear dynamics: Demonstrates transition from regular to chaotic motion',
            'Quantum mechanics: Pendulum provides classical limit for quantum harmonic oscillator',
            'General relativity: Test of equivalence principle and gravitational theories'
        ],
        examples: [
            'Grandfather clocks: Long pendulums provide accurate timekeeping',
            'Playground swings: Children learn to pump energy into the system',
            'Metronomes: Musicians use pendulums to keep time',
            'Foucault pendulum: Demonstrates Earth\'s rotation in museums worldwide',
            'Swinging bridges: Understanding resonance prevents dangerous oscillations',
            'Chandeliers: Large pendulums that can be set swinging',
            'Newton\'s cradle: Multiple pendulums demonstrating momentum transfer'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Simple but less accurate. For pendulum systems, Euler can accumulate errors over time, 
                especially for large amplitudes. The angular acceleration depends on the current angle, creating 
                coupling between position and acceleration.`
            },
            {
                name: 'Runge-Kutta 4th Order',
                description: `More accurate for pendulum systems. RK4 evaluates the acceleration at multiple points 
                within each timestep, providing better accuracy for the nonlinear equations. Essential for double 
                pendulums where small errors compound rapidly.`
            },
            {
                name: 'Verlet Integration',
                description: `Excellent for conservative systems. Verlet integration preserves energy better than 
                Euler, making it ideal for pendulum simulations where energy conservation is important. It's 
                symplectic, meaning it preserves the Hamiltonian structure.`
            },
            {
                name: 'Symplectic Integrators',
                description: `Specialized integrators that preserve energy and phase space volume. Critical for 
                long-term simulations of conservative systems. The leapfrog method is a simple symplectic integrator 
                commonly used for pendulum systems.`
            }
        ],
        stability: `For chaotic systems like the double pendulum, numerical errors grow exponentially. Small timesteps 
        are essential. Energy drift (gradual energy change due to numerical errors) can be minimized using symplectic 
        integrators. For the simple pendulum, stability requires timesteps much smaller than the period: Δt << T = 2π√(L/g).`
    },

    furtherReading: [
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Strogatz, S. H. (2014). Nonlinear Dynamics and Chaos (2nd ed.). Westview Press.',
        'Taylor, J. R. (2005). Classical Mechanics. University Science Books.',
        'Baker, G. L., & Gollub, J. P. (1996). Chaotic Dynamics (2nd ed.). Cambridge University Press.',
        'Fowles, G. R., & Cassiday, G. L. (2005). Analytical Mechanics (7th ed.). Brooks/Cole.'
    ]
};

