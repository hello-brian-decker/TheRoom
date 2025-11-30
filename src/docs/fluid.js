/**
 * Fluid Simulation Documentation
 */

export const fluidDocumentation = {
    overview: `Fluid simulation models the behavior of liquids and gases using computational methods. The 
    Smoothed Particle Hydrodynamics (SPH) method represents fluids as particles, each carrying properties like 
    density, pressure, and velocity. This approach naturally handles free surfaces, splashing, and complex 
    fluid interactions.`,

    mathematicalFoundation: {
        equations: [
            {
                formula: 'A(r) = Σⱼ mⱼ(Aⱼ/ρⱼ)W(r - rⱼ, h)',
                description: 'SPH interpolation: any quantity A at position r',
                variables: 'm = particle mass, ρ = density, W = smoothing kernel, h = smoothing radius'
            },
            {
                formula: 'ρᵢ = Σⱼ mⱼW(rᵢ - rⱼ, h)',
                description: 'Density calculation at particle i',
                variables: ''
            },
            {
                formula: 'P = k(ρ - ρ₀)',
                description: 'Pressure from density (equation of state)',
                variables: 'k = pressure constant, ρ₀ = rest density'
            },
            {
                formula: 'F_pressure = -∇P/ρ',
                description: 'Pressure force per unit mass',
                variables: '∇P = pressure gradient'
            },
            {
                formula: 'F_pressure,i = -Σⱼ mⱼ(Pᵢ + Pⱼ)/(2ρⱼ)∇W(rᵢ - rⱼ, h)',
                description: 'SPH pressure force on particle i',
                variables: ''
            },
            {
                formula: 'F_viscosity = μ∇²v',
                description: 'Viscous force (Laplacian of velocity)',
                variables: 'μ = dynamic viscosity, v = velocity'
            },
            {
                formula: 'F_viscosity,i = μΣⱼ mⱼ(vⱼ - vᵢ)/ρⱼ ∇²W(rᵢ - rⱼ, h)',
                description: 'SPH viscous force on particle i',
                variables: ''
            },
            {
                formula: '∂v/∂t + (v·∇)v = -∇P/ρ + μ∇²v/ρ + g',
                description: 'Navier-Stokes equation: momentum conservation',
                variables: 'g = gravitational acceleration'
            },
            {
                formula: '∂ρ/∂t + ∇·(ρv) = 0',
                description: 'Continuity equation: mass conservation',
                variables: ''
            },
            {
                formula: 'W(r, h) = (315/(64πh⁹))(h² - r²)³',
                description: 'Spiky kernel (for pressure, prevents clumping)',
                variables: 'r = distance, h = smoothing radius'
            },
            {
                formula: 'W(r, h) = (45/(πh⁶))(h - r)²',
                description: 'Viscosity kernel (for viscosity forces)',
                variables: ''
            }
        ],
        concepts: [
            {
                name: 'Smoothed Particle Hydrodynamics (SPH)',
                description: `A Lagrangian method where fluid is represented by discrete particles. Each particle 
                carries mass, velocity, and other properties. Quantities at any point are interpolated from nearby 
                particles using smoothing kernels. This naturally handles free surfaces and complex geometries.`
            },
            {
                name: 'Smoothing Kernels',
                description: `Kernels weight the contribution of nearby particles. They have compact support (zero 
                beyond smoothing radius h) and integrate to unity. Different kernels are used for different 
                quantities: spiky kernels for pressure (prevent clumping), viscosity kernels for viscous forces.`
            },
            {
                name: 'Pressure Forces',
                description: `Pressure arises from density variations. High density regions push particles apart, 
                maintaining incompressibility. The pressure force is proportional to the negative gradient of 
                pressure, driving particles from high to low pressure regions.`
            },
            {
                name: 'Viscosity',
                description: `Viscous forces smooth out velocity differences between nearby particles, modeling 
                internal friction. High viscosity creates thick, slow-moving fluids (like honey). Low viscosity 
                creates thin, fast-moving fluids (like water).`
            },
            {
                name: 'Surface Tension',
                description: `At fluid surfaces, cohesive forces create surface tension. This can be modeled by 
                detecting surface particles (low density neighbors) and applying forces toward the surface normal. 
                Surface tension causes droplets to form spherical shapes.`
            },
            {
                name: 'Incompressibility',
                description: `Most liquids are nearly incompressible - density changes very little with pressure. 
                SPH enforces this through pressure forces that resist density changes. The equation of state 
                P = k(ρ - ρ₀) creates strong restoring forces when density deviates from rest density.`
            },
            {
                name: 'Boundary Conditions',
                description: `Fluids interact with solid boundaries through boundary particles or force fields. 
                No-slip conditions (zero velocity at walls) are enforced. Boundary particles contribute to density 
                and pressure calculations, preventing fluid from penetrating solids.`
            }
        ]
    },

    realWorldApplications: {
        engineering: [
            'Computer graphics: Realistic water, smoke, and fire in movies and games',
            'Oceanography: Modeling ocean currents, waves, and tsunamis',
            'Aerospace: Understanding fuel sloshing in spacecraft tanks',
            'Automotive: Simulating fuel tanks, cooling systems, and wiper fluid',
            'Civil engineering: Flood modeling and dam break simulations',
            'Chemical engineering: Mixing processes and reactor design',
            'Medical simulation: Blood flow and drug delivery modeling',
            'Marine engineering: Ship hydrodynamics and wave interactions'
        ],
        physics: [
            'Computational fluid dynamics: Fundamental method for fluid simulation',
            'Astrophysics: Modeling stellar interiors and accretion disks',
            'Plasma physics: Particle-based methods for plasma simulation',
            'Multiphase flows: Understanding interactions between different fluid phases',
            'Turbulence: Studying chaotic fluid motion',
            'Free surface flows: Modeling interfaces between fluids and gases'
        ],
        examples: [
            'Movie special effects: Realistic water simulations in films',
            'Video games: Dynamic water and fluid effects',
            'Weather prediction: Atmospheric fluid dynamics',
            'Oil spills: Modeling and predicting spill behavior',
            'Dam breaks: Emergency planning and safety analysis',
            'Blood flow: Medical simulations of circulation',
            'Fuel sloshing: Spacecraft and vehicle design',
            'Wave generation: Understanding ocean wave formation',
            'Fountains: Designing water features',
            'Pouring liquids: Simulating realistic pouring behavior'
        ]
    },

    numericalMethods: {
        integration: [
            {
                name: 'Euler Integration',
                description: `Simple explicit integration. For SPH, forces are calculated from current particle 
                positions, then velocities and positions are updated. Requires small timesteps for stability, 
                especially with high pressure constants.`
            },
            {
                name: 'Leapfrog Integration',
                description: `Better energy conservation than Euler. Positions and velocities are offset by half 
                a timestep, providing better accuracy. Commonly used in SPH simulations.`
            },
            {
                name: 'Predictor-Corrector',
                description: `Two-step method: predict new positions, recalculate forces, then correct. Provides 
                better accuracy than simple Euler. Used in many SPH implementations.`
            },
            {
                name: 'Adaptive Timestepping',
                description: `Timestep size adapts based on maximum velocity and acceleration. Fast-moving particles 
                require smaller timesteps. This improves both stability and efficiency.`
            }
        ],
        stability: `SPH stability depends on several factors. The timestep must satisfy the Courant condition: 
        Δt < h/c, where c is the speed of sound (related to pressure constant). High pressure constants create 
        fast pressure waves, requiring smaller timesteps. Viscosity also affects stability - too much can cause 
        numerical diffusion, too little can cause instabilities. Smoothing radius h must be chosen to balance 
        accuracy (larger h) and resolution (smaller h).`
    },

    furtherReading: [
        'Monaghan, J. J. (1992). "Smoothed Particle Hydrodynamics." Annual Review of Astronomy and Astrophysics.',
        'Müller, M., et al. (2003). "Particle-Based Fluid Simulation for Interactive Applications." Eurographics.',
        'Ihmsen, M., et al. (2014). "Implicit Incompressible SPH." IEEE Transactions on Visualization and Computer Graphics.',
        'Bridson, R. (2015). Fluid Simulation for Computer Graphics (2nd ed.). A K Peters/CRC Press.',
        'Gingold, R. A., & Monaghan, J. J. (1977). "Smoothed Particle Hydrodynamics: Theory and Application to Non-Spherical Stars." Monthly Notices of the Royal Astronomical Society.'
    ]
};

