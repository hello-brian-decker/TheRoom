/**
 * Cloth Simulation Documentation
 */

export const clothDocumentation = {
    overview: `Cloth simulation models flexible materials using mass-spring systems. Each point of the cloth is 
    represented as a mass connected to neighboring points by springs. This creates realistic fabric behavior 
    including draping, folding, and response to forces like wind and gravity.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'F_spring = -k(x - x₀)',
                description: 'Spring force: Hooke\'s law restoring force',
                variables: 'k = spring constant, x = current length, x₀ = rest length'
            },
            {
                formula: 'F_damping = -cv',
                description: 'Damping force: opposes velocity',
                variables: 'c = damping coefficient, v = velocity'
            },
            {
                formula: 'F_bend = -k_bend(θ - θ₀)',
                description: 'Bending resistance force',
                variables: 'k_bend = bending stiffness, θ = angle, θ₀ = rest angle'
            },
            {
                formula: 'ma = F_spring + F_damping + F_gravity + F_wind',
                description: 'Net force on each mass point',
                variables: 'a = acceleration'
            },
            {
                formula: 'C(x) = |x₁ - x₂| - L₀ = 0',
                description: 'Constraint equation: maintains spring rest length',
                variables: 'L₀ = rest length'
            },
            {
                formula: 'F_wind = ρ(v_wind - v_cloth)²A',
                description: 'Wind force on cloth surface',
                variables: 'ρ = air density, A = surface area, v = velocity'
            },
            {
                formula: 'k_stretch = E·A/L₀',
                description: 'Stretch spring constant from material properties',
                variables: 'E = Young\'s modulus, A = cross-sectional area'
            },
            {
                formula: 'k_shear = G·A/L₀',
                description: 'Shear spring constant',
                variables: 'G = shear modulus'
            },
            {
                formula: 'Δt < 2√(m/k_max)',
                description: 'Stability condition for explicit integration',
                variables: 'k_max = largest spring constant'
            }
        ],
        concepts: [
            {
                name: 'Mass-Spring System',
                description: `Cloth is discretized into a grid of point masses connected by springs. Each mass 
                follows Newton's laws, and springs provide restoring forces. This creates a network that can 
                deform, stretch, and bend realistically.`
            },
            {
                name: 'Spring Types',
                description: `Different springs model different cloth behaviors: structural springs (connect 
                neighbors) resist stretching, shear springs (diagonal connections) resist shearing, and bending 
                springs resist folding. Each has different stiffness constants.`
            },
            {
                name: 'Constraint-Based Dynamics',
                description: `Instead of using very stiff springs (which cause numerical instability), constraints 
                can be used to maintain exact rest lengths. Constraint satisfaction methods like Lagrange multipliers 
                or position-based dynamics solve for positions that satisfy all constraints.`
            },
            {
                name: 'Damping',
                description: `Real cloth has internal friction that dissipates energy. Damping forces proportional 
                to velocity model this. Without damping, cloth would oscillate forever. Critical damping provides 
                realistic behavior without excessive oscillation.`
            },
            {
                name: 'Bending Resistance',
                description: `Cloth resists bending due to its thickness and material properties. Bending forces 
                act to restore angles between adjacent triangles to their rest angles. This prevents cloth from 
                folding too easily and creates realistic drape.`
            },
            {
                name: 'Collision Detection',
                description: `Cloth must avoid self-intersection and collisions with other objects. This requires 
                detecting when cloth triangles intersect with themselves or the environment. Spatial partitioning 
                accelerates this expensive operation.`
            },
            {
                name: 'Numerical Stability',
                description: `Stiff springs (high k values) require very small timesteps for stability. This is 
                the fundamental challenge in cloth simulation. Implicit integration methods or constraint-based 
                approaches allow larger timesteps.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Computer graphics: Realistic clothing in movies, games, and virtual reality',
            'Fashion design: Simulating how fabrics drape and fold before manufacturing',
            'Textile engineering: Understanding fabric behavior under different conditions',
            'Automotive: Simulating airbag deployment and fabric behavior',
            'Architecture: Modeling fabric structures like tents and awnings',
            'Medical simulation: Modeling surgical drapes and soft tissue',
            'Packaging: Simulating flexible packaging materials'
        ],
        physics: [
            'Continuum mechanics: Cloth simulation bridges discrete and continuous systems',
            'Material science: Understanding how material properties affect behavior',
            'Fluid-structure interaction: Cloth interacting with air or water flows',
            'Nonlinear dynamics: Complex behavior from simple spring interactions'
        ],
        examples: [
            'Movie special effects: Realistic clothing in animated films',
            'Video games: Character clothing that moves naturally',
            'Virtual try-on: Online shopping with simulated fabric',
            'Flags and banners: Realistic motion in wind',
            'Parachutes: Understanding deployment and inflation',
            'Sails: Optimizing sail shape for sailing',
            'Tents and awnings: Structural design of fabric structures',
            'Clothing design: Testing how garments fit and drape'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Explicit Euler',
                description: `Simple but requires very small timesteps for stability with stiff springs. The 
                stability condition Δt < 2√(m/k) means stiff springs force tiny timesteps, making simulation slow.`
            },
            {
                name: 'Implicit Integration',
                description: `Unconditionally stable, allowing larger timesteps. However, requires solving a 
                system of nonlinear equations each step, which is computationally expensive. Essential for 
                real-time applications with many springs.`
            },
            {
                name: 'Position-Based Dynamics',
                description: `Instead of integrating forces, directly solve for positions that satisfy constraints. 
                This is more stable and allows larger timesteps. Popular in games and real-time applications.`
            },
            {
                name: 'Verlet Integration',
                description: `Good balance between stability and speed. Verlet integration is symplectic and 
                handles stiff systems better than explicit Euler. Commonly used in cloth simulation.`
            }
        ],
        stability: `Cloth simulation is numerically challenging because springs can be very stiff. The stability 
        condition requires timesteps inversely proportional to the square root of the spring constant. For realistic 
        cloth, this often means timesteps of 1/1000 second or smaller with explicit methods. Implicit methods or 
        constraint-based approaches allow 10-100x larger timesteps. Damping also helps stability by reducing 
        oscillations.`
    },

    furtherReading: [
        'Baraff, D., & Witkin, A. (1998). "Large Steps in Cloth Simulation." SIGGRAPH.',
        'Müller, M., et al. (2007). "Position Based Dynamics." Journal of Visual Communication and Image Representation.',
        'Provot, X. (1995). "Deformation Constraints in a Mass-Spring Model." Graphics Interface.',
        'Bridson, R., et al. (2002). "Simulation of Clothing with Folds and Wrinkles." Eurographics.',
        'Erleben, K., et al. (2018). Physics-Based Animation. CRC Press.'
    ]
};

