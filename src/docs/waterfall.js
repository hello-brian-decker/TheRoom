/**
 * Waterfall Scene Documentation
 */

export const waterfallDocumentation = {
    overview: `This demonstration explores the physics of bouncing rubber balls, focusing on elastic collisions, 
    energy conservation, and the effects of gravity. The simulation uses particle physics to model individual 
    balls as they fall, collide with the ground, and interact with each other.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F = ma',
                description: 'Newton\'s second law: Force equals mass times acceleration',
                variables: 'F = force, m = mass, a = acceleration'
            },
            {
                formula: 'v = v₀ + at',
                description: 'Velocity as a function of time under constant acceleration',
                variables: 'v = final velocity, v₀ = initial velocity, a = acceleration, t = time'
            },
            {
                formula: 'v² = v₀² + 2as',
                description: 'Velocity squared relationship (useful for energy calculations)',
                variables: 's = displacement'
            },
            {
                formula: 'E_k = ½mv²',
                description: 'Kinetic energy of a moving object',
                variables: 'E_k = kinetic energy'
            },
            {
                formula: 'E_p = mgh',
                description: 'Gravitational potential energy',
                variables: 'E_p = potential energy, g = gravitational acceleration, h = height'
            },
            {
                formula: 'E_total = E_k + E_p = constant',
                description: 'Conservation of mechanical energy (in absence of non-conservative forces)',
                variables: ''
            },
            {
                formula: 'e = -(v₁\' - v₂\')/(v₁ - v₂)',
                description: 'Coefficient of restitution: ratio of relative velocities after and before collision',
                variables: 'e = coefficient of restitution (0 = perfectly inelastic, 1 = perfectly elastic)'
            },
            {
                formula: 'J = ∫F dt = Δp = mΔv',
                description: 'Impulse-momentum theorem: impulse equals change in momentum',
                variables: 'J = impulse, p = momentum'
            }
        ],
        concepts: [
            {
                name: 'Elastic Collisions',
                description: `When two objects collide elastically, both momentum and kinetic energy are conserved. 
                The coefficient of restitution (e) approaches 1 for highly elastic materials like rubber. 
                In this simulation, rubber balls have e ≈ 0.85-0.95, meaning they retain most of their kinetic 
                energy after bouncing.`
            },
            {
                name: 'Coefficient of Restitution',
                description: `This dimensionless quantity describes how "bouncy" a collision is. For a ball 
                bouncing off a surface: e = v_after/v_before. A value of 1 means perfect elasticity (no energy loss), 
                while 0 means perfectly inelastic (objects stick together). Rubber typically has e ≈ 0.8-0.9.`
            },
            {
                name: 'Impulse-Momentum Theorem',
                description: `The change in momentum of an object equals the impulse applied to it. During a 
                collision, forces act over a very short time interval, creating an impulse that changes the 
                object's velocity. This is the fundamental principle behind collision resolution in physics engines.`
            },
            {
                name: 'Energy Dissipation',
                description: `In real-world collisions, some kinetic energy is converted to other forms (heat, sound, 
                deformation). The simulation models this through the coefficient of restitution and damping factors. 
                Over time, balls lose energy and eventually come to rest.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Automotive crash testing: Understanding collision dynamics helps design safer vehicles',
            'Sports equipment design: Optimizing ball materials for desired bounce characteristics',
            'Material testing: Measuring coefficients of restitution to characterize material properties',
            'Impact analysis: Predicting behavior of objects during collisions in industrial settings',
            'Safety engineering: Designing protective equipment that absorbs impact energy'
        ],
        physics: [
            'Particle physics: Collision experiments in accelerators follow similar conservation laws',
            'Astrophysics: Collisions between celestial bodies follow momentum conservation',
            'Condensed matter physics: Studying material properties through impact testing',
            'Biomechanics: Understanding how biological tissues respond to impacts'
        ],
        examples: [
            'Basketball bouncing on a court: The ball loses energy with each bounce due to air resistance and surface deformation',
            'Tennis ball on clay vs. hard court: Different surfaces have different coefficients of restitution',
            'Bouncing a superball: High elasticity creates dramatic bounces',
            'Dropping a rubber ball: Height decreases with each bounce due to energy loss',
            'Ball collisions in billiards: Understanding angles and energy transfer for strategic play'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Used in this simulation for its simplicity and computational efficiency. 
                Position and velocity are updated using: x(t+Δt) = x(t) + v(t)Δt, v(t+Δt) = v(t) + a(t)Δt. 
                While less accurate than higher-order methods, it's sufficient for real-time simulation.`
            },
            {
                name: 'Collision Detection',
                description: `Sphere-sphere and sphere-plane collision detection uses geometric distance calculations. 
                For efficiency with many particles, spatial partitioning (grid or octree) could be used, though 
                the current implementation uses pairwise checks for simplicity.`
            }
        ],
        stability: `The simulation uses a fixed timestep approach. For stability, the timestep should be small 
        compared to the fastest dynamics (typically collision timescales). Damping factors prevent numerical 
        instabilities and model realistic energy dissipation. Position correction after collisions ensures objects 
        don't interpenetrate.`
    },

    furtherReading: [
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Fowles, G. R., & Cassiday, G. L. (2005). Analytical Mechanics (7th ed.). Brooks/Cole.',
        'Erleben, K., et al. (2018). Physics-Based Animation. CRC Press.',
        'Millington, I. (2007). Game Physics Engine Development. Morgan Kaufmann.'
    ]
};

