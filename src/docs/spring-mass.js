/**
 * Spring-Mass Systems Documentation
 */

export const springMassDocumentation = {
    overview: `Spring-mass systems are fundamental to understanding oscillations, waves, and vibrations. From 
    simple harmonic motion to complex wave propagation in chains and bridges, these systems demonstrate how 
    energy propagates through connected masses via elastic forces.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F = -kx',
                description: 'Hooke\'s law: restoring force proportional to displacement',
                variables: 'k = spring constant, x = displacement from equilibrium'
            },
            {
                formula: 'x\'\' + (k/m)x = 0',
                description: 'Undamped harmonic oscillator equation',
                variables: 'm = mass'
            },
            {
                formula: 'ω₀ = √(k/m)',
                description: 'Natural angular frequency',
                variables: 'ω₀ = angular frequency'
            },
            {
                formula: 'T = 2π√(m/k)',
                description: 'Period of oscillation',
                variables: 'T = period'
            },
            {
                formula: 'x\'\' + 2ζω₀x\' + ω₀²x = 0',
                description: 'Damped harmonic oscillator equation',
                variables: 'ζ = damping ratio, ω₀ = natural frequency'
            },
            {
                formula: 'ζ = c/(2√(mk))',
                description: 'Damping ratio',
                variables: 'c = damping coefficient'
            },
            {
                formula: 'x(t) = Ae^(-ζω₀t)cos(ω_d t + φ)',
                description: 'Underdamped solution (ζ < 1)',
                variables: 'ω_d = ω₀√(1-ζ²) = damped frequency, A = amplitude, φ = phase'
            },
            {
                formula: 'E = ½kx² + ½mv²',
                description: 'Total energy (potential + kinetic)',
                variables: ''
            },
            {
                formula: '∂²u/∂t² = c²∂²u/∂x²',
                description: 'Wave equation for continuous systems',
                variables: 'c = √(T/μ) = wave speed, T = tension, μ = mass per unit length'
            },
            {
                formula: 'ω_n = nπc/L',
                description: 'Normal mode frequencies for fixed-fixed string',
                variables: 'n = mode number, L = length'
            },
            {
                formula: 'F_resonance = kx_max / (2ζ)',
                description: 'Resonance amplitude (driven oscillator)',
                variables: 'x_max = maximum displacement'
            }
        ],
        concepts: [
            {
                name: 'Hooke\'s Law',
                description: `The fundamental principle of elasticity: the restoring force is proportional to 
                displacement and opposite in direction. This linear relationship holds for small deformations. 
                Beyond the elastic limit, materials exhibit nonlinear behavior.`
            },
            {
                name: 'Simple Harmonic Motion',
                description: `When a mass is attached to an ideal spring with no damping, it oscillates with 
                constant amplitude and period. The motion is sinusoidal, and energy continuously converts between 
                kinetic and potential forms.`
            },
            {
                name: 'Damping',
                description: `Real systems lose energy due to friction and air resistance. Underdamped systems 
                (ζ < 1) oscillate with exponentially decreasing amplitude. Critically damped (ζ = 1) returns to 
                equilibrium fastest without oscillation. Overdamped (ζ > 1) returns slowly without oscillation.`
            },
            {
                name: 'Resonance',
                description: `When a system is driven at its natural frequency, the amplitude becomes very large. 
                At resonance, energy transfer is maximized. This is crucial in engineering - sometimes desired 
                (musical instruments) and sometimes dangerous (bridge collapses).`
            },
            {
                name: 'Wave Propagation',
                description: `In chains of connected masses, disturbances propagate as waves. The wave speed 
                depends on spring constant and mass. For continuous systems, this leads to the wave equation, 
                fundamental to understanding sound, light, and other wave phenomena.`
            },
            {
                name: 'Normal Modes',
                description: `Coupled oscillators have specific patterns called normal modes where all masses 
                oscillate at the same frequency. These modes are independent - any motion can be decomposed into 
                a superposition of normal modes.`
            },
            {
                name: 'Energy Transfer',
                description: `In coupled systems, energy transfers between oscillators. This is the mechanism 
                behind wave propagation - energy flows from one mass to the next through the connecting springs.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Vehicle suspensions: Springs and dampers provide comfortable ride and handling',
            'Structural engineering: Understanding natural frequencies prevents resonance disasters',
            'Earthquake engineering: Base isolation systems use springs to protect buildings',
            'Bridge design: Tuned mass dampers reduce oscillations from wind and traffic',
            'Musical instruments: Strings, membranes, and air columns are spring-mass systems',
            'Vibration control: Isolating machinery from foundations using spring systems',
            'Seismic protection: Spring systems isolate structures from ground motion'
        ],
        physics: [
            'Classical mechanics: Fundamental example of oscillatory systems',
            'Wave physics: Wave equation emerges from continuum limit of spring-mass chains',
            'Quantum mechanics: Harmonic oscillator is the foundation of quantum field theory',
            'Solid state physics: Atomic vibrations in crystals are spring-mass systems',
            'Acoustics: Sound propagation in materials involves spring-mass interactions',
            'Optics: Light propagation can be modeled using coupled oscillators'
        ],
        examples: [
            'Guitar strings: Vibrating strings produce musical notes at specific frequencies',
            'Car suspension: Springs absorb road bumps, dampers prevent bouncing',
            'Trampoline: Elastic surface creates oscillatory motion',
            'Bungee jumping: Elastic cord creates controlled oscillations',
            'Metronome: Pendulum with spring provides steady rhythm',
            'Shock absorbers: Damped springs reduce impact forces',
            'Rubber bands: Simple demonstration of Hooke\'s law',
            'Slinky: Wave propagation through connected coils'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Simple but can accumulate errors, especially for undamped systems where energy 
                should be conserved. Position and velocity are updated separately, which can lead to energy drift.`
            },
            {
                name: 'Verlet Integration',
                description: `Better energy conservation than Euler. The Verlet algorithm is symplectic, 
                preserving the Hamiltonian structure. Excellent for long-term simulations of conservative systems.`
            },
            {
                name: 'Runge-Kutta 4th Order',
                description: `High accuracy for driven or damped systems. RK4 provides good results for 
                systems with external forces or time-dependent spring constants.`
            },
            {
                name: 'Implicit Methods',
                description: `For stiff systems (large spring constants), implicit methods like backward Euler 
                or implicit midpoint provide stability. These methods require solving nonlinear equations each step.`
            }
        ],
        stability: `For spring-mass systems, stability requires timesteps much smaller than the oscillation period: 
        Δt << T = 2π√(m/k). Stiff systems (large k) require very small timesteps. Implicit methods can handle larger 
        timesteps for stiff systems. Energy conservation in undamped systems is best maintained using symplectic 
        integrators like Verlet.`
    },

    furtherReading: [
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Fowles, G. R., & Cassiday, G. L. (2005). Analytical Mechanics (7th ed.). Brooks/Cole.',
        'French, A. P. (1971). Vibrations and Waves. W. W. Norton & Company.',
        'Crawford, F. S. (1968). Waves. McGraw-Hill.',
        'Pain, H. J. (2005). The Physics of Vibrations and Waves (6th ed.). Wiley.'
    ]
};

