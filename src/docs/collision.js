/**
 * Collision Demonstrations Documentation
 */

export const collisionDocumentation = {
    overview: `Collisions are fundamental events in physics where two or more objects interact over a very short 
    time interval. This demonstration explores different types of collisions - elastic, inelastic, and perfectly 
    inelastic - and how they conserve or dissipate momentum and energy.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'm₁v₁ + m₂v₂ = m₁v₁\' + m₂v₂\'',
                description: 'Conservation of linear momentum (always conserved in collisions)',
                variables: 'm = mass, v = velocity before collision, v\' = velocity after collision'
            },
            {
                formula: '½m₁v₁² + ½m₂v₂² = ½m₁v₁\'² + ½m₂v₂\'²',
                description: 'Conservation of kinetic energy (only in elastic collisions)',
                variables: ''
            },
            {
                formula: 'e = -(v₁\' - v₂\')/(v₁ - v₂)',
                description: 'Coefficient of restitution: ratio of relative velocities',
                variables: 'e = 1 (elastic), 0 < e < 1 (inelastic), e = 0 (perfectly inelastic)'
            },
            {
                formula: 'J = ∫F dt = Δp',
                description: 'Impulse equals change in momentum',
                variables: 'J = impulse, F = force, p = momentum'
            },
            {
                formula: 'J = -(1 + e)(v_rel · n) / (1/m₁ + 1/m₂)',
                description: 'Impulse magnitude for collision resolution',
                variables: 'v_rel = relative velocity, n = collision normal'
            },
            {
                formula: 'v₁\' = v₁ + (J/m₁)n',
                description: 'Velocity after collision (object 1)',
                variables: ''
            },
            {
                formula: 'v₂\' = v₂ - (J/m₂)n',
                description: 'Velocity after collision (object 2)',
                variables: ''
            },
            {
                formula: 'ΔE = ½(1 - e²)m_eff(v_rel)²',
                description: 'Energy lost in inelastic collision',
                variables: 'm_eff = reduced mass = m₁m₂/(m₁ + m₂)'
            },
            {
                formula: 'v_cm = (m₁v₁ + m₂v₂)/(m₁ + m₂)',
                description: 'Center of mass velocity (conserved in all collisions)',
                variables: 'v_cm = center of mass velocity'
            }
        ],
        concepts: [
            {
                name: 'Elastic Collisions',
                description: `Perfectly elastic collisions conserve both momentum and kinetic energy. In reality, 
                no collision is perfectly elastic, but some (like billiard balls) are very close (e ≈ 0.95). 
                Elastic collisions are reversible - if you reverse the velocities, the collision "undoes" itself.`
            },
            {
                name: 'Inelastic Collisions',
                description: `Most real collisions are inelastic, meaning kinetic energy is not conserved. Some 
                energy is converted to heat, sound, or deformation. The coefficient of restitution (e) quantifies 
                this: e = 1 means elastic, e = 0 means perfectly inelastic.`
            },
            {
                name: 'Perfectly Inelastic Collisions',
                description: `In perfectly inelastic collisions (e = 0), objects stick together after collision. 
                Maximum kinetic energy is lost. The final velocity is the center of mass velocity. Examples include 
                putty sticking to a wall or two cars colliding and coupling together.`
            },
            {
                name: 'Conservation of Momentum',
                description: `Momentum is always conserved in collisions because there are no external forces 
                (collision forces are internal). This is true regardless of whether energy is conserved. Momentum 
                conservation provides one equation, allowing us to solve for post-collision velocities.`
            },
            {
                name: 'Impulse-Momentum Theorem',
                description: `During a collision, large forces act over very short times. The impulse (force × time) 
                equals the change in momentum. This is the fundamental principle used to resolve collisions in 
                physics engines.`
            },
            {
                name: 'Newton\'s Cradle',
                description: `A classic demonstration where momentum and energy conservation create a chain reaction. 
                When one ball strikes, momentum transfers through the chain, causing the last ball to swing out. 
                Energy conservation ensures only one ball moves at the end.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Automotive crash testing: Understanding collision dynamics for vehicle safety design',
            'Sports equipment: Designing protective gear that absorbs impact energy',
            'Manufacturing: Controlling impacts in assembly lines and material handling',
            'Packaging design: Protecting products during shipping collisions',
            'Robotics: Safe collision handling for robot manipulators',
            'Aerospace: Spacecraft docking and debris collision avoidance'
        ],
        physics: [
            'Particle physics: High-energy particle collisions in accelerators',
            'Astrophysics: Collisions between celestial bodies and formation of planetary systems',
            'Condensed matter: Understanding material properties through impact testing',
            'Plasma physics: Collisions between charged particles in plasmas',
            'Nuclear physics: Nuclear reactions and scattering experiments'
        ],
        examples: [
            'Billiards: Near-elastic collisions allow precise control of ball trajectories',
            'Car crashes: Inelastic collisions convert kinetic energy to deformation and heat',
            'Baseball bat hitting ball: The collision transfers momentum, launching the ball',
            'Newton\'s cradle: Demonstrates conservation laws in a visually striking way',
            'Bouncing ball: Each bounce is a collision with the ground, losing energy',
            'Pendulum collisions: Coupled pendulums transfer energy through collisions',
            'Pool/snooker: Strategic use of elastic collisions for game play'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Impulse-Based Resolution',
                description: `Collisions are resolved by calculating and applying impulses. The impulse magnitude 
                depends on relative velocity, masses, and coefficient of restitution. This method conserves momentum 
                exactly while allowing energy loss through the restitution coefficient.`
            },
            {
                name: 'Sequential Collision Resolution',
                description: `When multiple collisions occur simultaneously, they're resolved sequentially. Multiple 
                iterations per frame improve stability. The order of resolution can affect results, so methods like 
                "warm starting" use previous frame information.`
            },
            {
                name: 'Position Correction',
                description: `After applying impulses, objects may still interpenetrate slightly. Position correction 
                moves them apart along the collision normal. This prevents objects from sinking into each other over 
                multiple frames.`
            }
        ],
        stability: `Collision resolution must handle edge cases: objects at rest, very fast collisions, and simultaneous 
        multiple contacts. Small timesteps prevent objects from passing through each other. Position correction prevents 
        accumulation of penetration errors. The coefficient of restitution must be clamped to [0,1] to prevent energy 
        gain.`
    },

    furtherReading: [
        'Goldstein, H., Poole, C., & Safko, J. (2001). Classical Mechanics (3rd ed.). Addison-Wesley.',
        'Halliday, D., Resnick, R., & Walker, J. (2018). Fundamentals of Physics (11th ed.). Wiley.',
        'Erleben, K., et al. (2018). Physics-Based Animation. CRC Press.',
        'Millington, I. (2007). Game Physics Engine Development. Morgan Kaufmann.',
        'Catto, E. (2005). "Iterative Dynamics with Temporal Coherence." Game Developer Conference.'
    ]
};

